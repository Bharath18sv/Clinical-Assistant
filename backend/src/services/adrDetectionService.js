import { Patient } from "../models/patient.models.js";
import { Prescription } from "../models/prescription.models.js";
import { Doctor } from "../models/doctor.models.js";

// Drug interaction database (simplified - in production, use FDA/WHO databases)
const DRUG_INTERACTIONS = {
  // Warfarin interactions
  warfarin: {
    aspirin: { severity: "high", description: "Increased bleeding risk" },
    ibuprofen: { severity: "high", description: "Increased bleeding risk" },
    acetaminophen: {
      severity: "moderate",
      description: "Potential INR elevation",
    },
    omeprazole: {
      severity: "moderate",
      description: "May affect warfarin metabolism",
    },
  },
  // ACE Inhibitors interactions
  lisinopril: {
    potassium: { severity: "high", description: "Hyperkalemia risk" },
    spironolactone: { severity: "high", description: "Hyperkalemia risk" },
    ibuprofen: {
      severity: "moderate",
      description: "Reduced antihypertensive effect",
    },
  },
  // Metformin interactions
  metformin: {
    contrast_dye: { severity: "high", description: "Lactic acidosis risk" },
    alcohol: { severity: "moderate", description: "Lactic acidosis risk" },
  },
  // Statins interactions
  atorvastatin: {
    grapefruit: { severity: "high", description: "Increased statin levels" },
    warfarin: { severity: "moderate", description: "Increased bleeding risk" },
  },
};

// Allergy-based contraindications
const ALLERGY_CONTRAINDICATIONS = {
  penicillin: ["amoxicillin", "ampicillin", "piperacillin", "ibuprofen"],
  sulfa: ["sulfamethoxazole", "sulfasalazine", "furosemide"],
  aspirin: ["ibuprofen", "naproxen", "ketorolac"],
  shellfish: ["iodine_contrast", "iodine_supplements"],
};

// Disease-based contraindications
const DISEASE_CONTRAINDICATIONS = {
  diabetes: {
    contraindicated: ["prednisone", "hydrocortisone"],
    caution: ["metformin", "insulin"],
  },
  hypertension: {
    contraindicated: ["pseudoephedrine", "phenylephrine"],
    caution: ["lisinopril", "amlodipine"],
  },
  kidney_disease: {
    contraindicated: ["ibuprofen", "naproxen"],
    caution: ["metformin", "digoxin"],
  },
  liver_disease: {
    contraindicated: ["acetaminophen", "statins"],
    caution: ["warfarin", "metformin"],
  },
};

export class ADRDetectionService {
  /**
   * Main ADR detection function
   * @param {string} patientId - Patient ID
   * @param {Array} newMedications - New medications being prescribed
   * @returns {Object} ADR analysis results
   */
  static async detectADR(patientId, newMedications = []) {
    try {
      // Get patient data
      const patient = await Patient.findById(patientId).select(
        "allergies chronicConditions symptoms medications"
      );

      if (!patient) {
        throw new Error("Patient not found");
      }

      // Get existing prescriptions
      const existingPrescriptions = await Prescription.find({
        patientId,
        status: "active",
      });

      // Extract all current medications
      const currentMedications = [];
      existingPrescriptions.forEach((prescription) => {
        prescription.medications.forEach((med) => {
          if (med.status === "active") {
            currentMedications.push(med.name.toLowerCase());
          }
        });
      });

      // Add new medications to check
      const allMedications = [
        ...currentMedications,
        ...newMedications.map((med) => med.name.toLowerCase()),
      ];

      // Perform ADR checks
      const adrResults = {
        patientId,
        timestamp: new Date(),
        checks: {
          drugInteractions: this.checkDrugInteractions(allMedications),
          allergyContraindications: this.checkAllergyContraindications(
            patient.allergies,
            allMedications
          ),
          diseaseContraindications: this.checkDiseaseContraindications(
            patient.chronicConditions,
            allMedications
          ),
          symptomWarnings: this.checkSymptomWarnings(
            patient.symptoms,
            allMedications
          ),
        },
        riskLevel: "low", // Will be calculated
        recommendations: [],
      };

      // Calculate overall risk level
      adrResults.riskLevel = this.calculateRiskLevel(adrResults.checks);

      // Generate recommendations
      adrResults.recommendations = this.generateRecommendations(
        adrResults.checks
      );

      return adrResults;
    } catch (error) {
      console.error("ADR Detection Error:", error);
      throw error;
    }
  }

  /**
   * Check for drug-drug interactions
   */
  static checkDrugInteractions(medications) {
    const interactions = [];

    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const med1 = medications[i];
        const med2 = medications[j];

        // Check both directions
        if (DRUG_INTERACTIONS[med1] && DRUG_INTERACTIONS[med1][med2]) {
          interactions.push({
            medication1: med1,
            medication2: med2,
            severity: DRUG_INTERACTIONS[med1][med2].severity,
            description: DRUG_INTERACTIONS[med1][med2].description,
            type: "drug_interaction",
          });
        }

        if (DRUG_INTERACTIONS[med2] && DRUG_INTERACTIONS[med2][med1]) {
          interactions.push({
            medication1: med2,
            medication2: med1,
            severity: DRUG_INTERACTIONS[med2][med1].severity,
            description: DRUG_INTERACTIONS[med2][med1].description,
            type: "drug_interaction",
          });
        }
      }
    }

    return interactions;
  }

  /**
   * Check for allergy contraindications
   */
  static checkAllergyContraindications(allergies, medications) {
    const contraindications = [];

    allergies.forEach((allergy) => {
      const allergyLower = allergy.toLowerCase();
      const contraindicatedMeds = ALLERGY_CONTRAINDICATIONS[allergyLower];

      if (contraindicatedMeds) {
        contraindicatedMeds.forEach((med) => {
          if (medications.includes(med.toLowerCase())) {
            contraindications.push({
              allergy: allergy,
              medication: med,
              severity: "high",
              description: `Contraindicated due to ${allergy} allergy`,
              type: "allergy_contraindication",
            });
          }
        });
      }
    });

    return contraindications;
  }

  /**
   * Check for disease-based contraindications
   */
  static checkDiseaseContraindications(chronicConditions, medications) {
    const contraindications = [];

    chronicConditions.forEach((condition) => {
      const conditionLower = condition.toLowerCase();
      const contraindicationsData = DISEASE_CONTRAINDICATIONS[conditionLower];

      if (contraindicationsData) {
        // Check contraindicated medications
        contraindicationsData.contraindicated?.forEach((med) => {
          if (medications.includes(med.toLowerCase())) {
            contraindications.push({
              condition: condition,
              medication: med,
              severity: "high",
              description: `Contraindicated in ${condition}`,
              type: "disease_contraindication",
            });
          }
        });

        // Check medications requiring caution
        contraindicationsData.caution?.forEach((med) => {
          if (medications.includes(med.toLowerCase())) {
            contraindications.push({
              condition: condition,
              medication: med,
              severity: "moderate",
              description: `Use with caution in ${condition}`,
              type: "disease_caution",
            });
          }
        });
      }
    });

    return contraindications;
  }

  /**
   * Check for symptom-based warnings
   */
  static checkSymptomWarnings(symptoms, medications) {
    const warnings = [];

    // Example symptom-based warnings
    const symptomWarnings = {
      bleeding: ["warfarin", "aspirin", "ibuprofen"],
      nausea: ["metformin", "morphine"],
      dizziness: ["lisinopril", "metoprolol"],
      rash: ["penicillin", "sulfa"],
    };

    symptoms.forEach((symptom) => {
      const symptomLower = symptom.toLowerCase();
      const warningMeds = symptomWarnings[symptomLower];

      if (warningMeds) {
        warningMeds.forEach((med) => {
          if (medications.includes(med.toLowerCase())) {
            warnings.push({
              symptom: symptom,
              medication: med,
              severity: "moderate",
              description: `May worsen ${symptom}`,
              type: "symptom_warning",
            });
          }
        });
      }
    });

    return warnings;
  }

  /**
   * Calculate overall risk level
   */
  static calculateRiskLevel(checks) {
    const allIssues = [
      ...checks.drugInteractions,
      ...checks.allergyContraindications,
      ...checks.diseaseContraindications,
      ...checks.symptomWarnings,
    ];

    if (allIssues.some((issue) => issue.severity === "high")) {
      return "high";
    } else if (allIssues.some((issue) => issue.severity === "moderate")) {
      return "moderate";
    } else {
      return "low";
    }
  }

  /**
   * Generate recommendations based on ADR analysis
   */
  static generateRecommendations(checks) {
    const recommendations = [];

    // High severity recommendations
    const highSeverityIssues = [
      ...checks.drugInteractions.filter((i) => i.severity === "high"),
      ...checks.allergyContraindications.filter((i) => i.severity === "high"),
      ...checks.diseaseContraindications.filter((i) => i.severity === "high"),
    ];

    if (highSeverityIssues.length > 0) {
      recommendations.push({
        priority: "urgent",
        action: "Consider alternative medications or dosage adjustments",
        issues: highSeverityIssues,
      });
    }

    // Moderate severity recommendations
    const moderateSeverityIssues = [
      ...checks.drugInteractions.filter((i) => i.severity === "moderate"),
      ...checks.diseaseContraindications.filter(
        (i) => i.severity === "moderate"
      ),
      ...checks.symptomWarnings.filter((i) => i.severity === "moderate"),
    ];

    if (moderateSeverityIssues.length > 0) {
      recommendations.push({
        priority: "monitor",
        action: "Monitor patient closely for adverse effects",
        issues: moderateSeverityIssues,
      });
    }

    return recommendations;
  }

  /**
   * Get doctor information for notifications
   */
  static async getDoctorInfo(doctorId) {
    return await Doctor.findById(doctorId).select(
      "fullname email phone specialization"
    );
  }

  /**
   * Get patient information for notifications
   */
  static async getPatientInfo(patientId) {
    return await Patient.findById(patientId).select("fullname email phone");
  }
}

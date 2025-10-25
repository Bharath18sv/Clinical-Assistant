from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
import pickle
import os

app = Flask(__name__)
CORS(app)

class ADRPredictor:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.is_trained = False
        self.load_or_train_model()
    
    def load_or_train_model(self):
        try:
            with open('adr_model.pkl', 'rb') as f:
                self.model = pickle.load(f)
            with open('vectorizer.pkl', 'rb') as f:
                self.vectorizer = pickle.load(f)
            self.is_trained = True
        except FileNotFoundError:
            self.train_model()
    
    def train_model(self):
        training_data = [
            ("warfarin aspirin", "high", "Increased bleeding risk"),
            ("warfarin ibuprofen", "high", "Severe bleeding risk"),
            ("metformin alcohol", "medium", "Lactic acidosis risk"),
            ("lisinopril potassium", "medium", "Hyperkalemia risk"),
            ("digoxin furosemide", "high", "Digitalis toxicity"),
            ("aspirin methotrexate", "medium", "Increased toxicity"),
            ("paracetamol ibuprofen", "low", "Minimal interaction"),
            ("metformin lisinopril", "low", "Generally safe"),
            ("paracetamol metformin", "safe", "No interaction"),
        ]
        
        X = [item[0] for item in training_data]
        y = [item[1] for item in training_data]
        
        X_vectorized = self.vectorizer.fit_transform(X)
        self.model.fit(X_vectorized, y)
        self.is_trained = True
        
        with open('adr_model.pkl', 'wb') as f:
            pickle.dump(self.model, f)
        with open('vectorizer.pkl', 'wb') as f:
            pickle.dump(self.vectorizer, f)
    
    def predict_interaction(self, drug1, drug2):
        if not self.is_trained:
            return {"severity": "unknown", "confidence": 0.0}
        
        input_text = f"{drug1.lower()} {drug2.lower()}"
        X_input = self.vectorizer.transform([input_text])
        
        prediction = self.model.predict(X_input)[0]
        probabilities = self.model.predict_proba(X_input)[0]
        confidence = max(probabilities)
        
        return {
            "severity": prediction,
            "confidence": float(confidence),
            "message": f"Interaction between {drug1} and {drug2}: {prediction} risk"
        }
    
    def check_multiple_drugs(self, medications, patient_data):
        interactions = []
        
        for i in range(len(medications)):
            for j in range(i + 1, len(medications)):
                drug1 = medications[i].get('name', '')
                drug2 = medications[j].get('name', '')
                
                if drug1 and drug2:
                    result = self.predict_interaction(drug1, drug2)
                    
                    if result['severity'] in ['high', 'medium'] and result['confidence'] > 0.5:
                        interactions.append({
                            'type': 'drug_interaction',
                            'severity': result['severity'],
                            'medications': [drug1, drug2],
                            'message': result['message'],
                            'confidence': result['confidence'],
                            'recommendation': 'Monitor patient closely'
                        })
        
        # Drug class mappings
        drug_classes = {
            'penicillin': ['amoxicillin', 'ampicillin', 'benzylpenicillin', 'flucloxacillin', 'phenoxymethylpenicillin'],
            'nsaids': ['ibuprofen', 'aspirin', 'naproxen', 'diclofenac', 'celecoxib'],
            'sulfa': ['sulfamethoxazole', 'sulfadiazine', 'sulfasalazine'],
            'cephalosporins': ['cephalexin', 'cefaclor', 'cefuroxime', 'ceftriaxone'],
            'tetracyclines': ['tetracycline', 'doxycycline', 'minocycline']
        }

        if 'allergies' in patient_data:
            allergies = [allergy.lower() for allergy in patient_data['allergies']]
            for med in medications:
                med_name = med.get('name', '').lower()
                
                # Check direct matches
                if med_name in allergies:
                    interactions.append({
                        'type': 'allergy',
                        'severity': 'high',
                        'medications': [med.get('name', '')],
                        'message': f"Patient allergic to {med.get('name', '')}",
                        'confidence': 1.0,
                        'recommendation': 'Discontinue immediately'
                    })
                    continue
                
                # Check drug class matches
                for allergy in allergies:
                    if allergy in drug_classes:
                        if med_name in drug_classes[allergy]:
                            interactions.append({
                                'type': 'allergy',
                                'severity': 'high',
                                'medications': [med.get('name', '')],
                                'message': f"Patient allergic to {allergy} class drugs including {med.get('name', '')}",
                                'confidence': 1.0,
                                'recommendation': 'Discontinue immediately'
                            })
        
        return interactions

predictor = ADRPredictor()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "model_trained": predictor.is_trained})

@app.route('/predict-adr', methods=['POST'])
def predict_adr():
    try:
        data = request.get_json()
        medications = data.get('medications', [])
        patient_data = data.get('patient', {})
        
        interactions = predictor.check_multiple_drugs(medications, patient_data)
        
        return jsonify({
            "success": True,
            "interactions": interactions,
            "total_interactions": len(interactions)
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6001, debug=True)
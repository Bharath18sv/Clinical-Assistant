# ML ADR Detection Service

Machine Learning-based Adverse Drug Reaction detection service for Clinical Assistant.

## Features
- **Drug Interaction Detection** using Random Forest classifier
- **Allergy Cross-checking** against patient allergies
- **Age-based Risk Assessment** for elderly patients
- **Confidence Scoring** for predictions
- **Fallback Support** when ML service is unavailable

## Setup

1. **Install Dependencies**:
```bash
./start.sh
```

2. **Manual Setup**:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

## API Endpoints

### Health Check
```
GET /health
```

### Predict ADR
```
POST /predict-adr
{
  "medications": [
    {"name": "warfarin", "dosage": "5mg"},
    {"name": "aspirin", "dosage": "100mg"}
  ],
  "patient": {
    "age": 70,
    "allergies": ["penicillin"],
    "chronicConditions": ["hypertension"]
  }
}
```

## Integration

The service runs on `http://localhost:5001` and integrates with:
- **Backend**: Prescription creation and patient details
- **Frontend**: Real-time ADR alerts display

## Model Training

The service automatically trains a Random Forest model with synthetic drug interaction data on first startup. The model is saved as `adr_model.pkl` and `vectorizer.pkl`.

## Security

- No external API calls
- Local processing only
- Input validation and sanitization
- Timeout protection (5 seconds)
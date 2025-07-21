from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline

# Load model once at startup
model_id = "k-habib/scram-model"
classifier = pipeline("text-classification", model=model_id)

app = Flask(__name__)
CORS(app)  # Allow Chrome extension to connect

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    text = data.get('job_description', '')

    if not text:
        return jsonify({'error': 'No job description provided'}), 400

    result = classifier(text[:512])[0]  # Truncate if needed
    return jsonify({
        'prediction': result['label'],
        'confidence': round(result['score'], 3)
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001) 

    

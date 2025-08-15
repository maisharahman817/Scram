import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline

# Load model once at startup
model_id = "k-habib/scram-model"
classifier = pipeline("text-classification", model=model_id)

app = Flask(__name__)
CORS(app)  # Allow CORS for all routes

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    job_description = data.get('job_description', '').strip()

    if not job_description:
        return jsonify({'error': 'Empty job description'}), 400

    truncated_text = job_description[:512]

    try:
        result = classifier(truncated_text)
        prediction = result[0]['label']
        confidence = result[0]['score']
        return jsonify({'prediction': prediction, 'confidence': round(confidence, 3)})
    except Exception as e:
        print("Model inference error:", e)
        return jsonify({'error': 'Model inference failed'}), 500

@app.route('/feedback', methods=['POST'])
def feedback():
    data = request.get_json()
    job_title = data.get('job_title')
    job_description = data.get('job_description')
    feedback_type = data.get('feedback_type')

    print(f"Feedback received: {feedback_type} | {job_title}")

    return jsonify({'status': 'success', 'message': 'Feedback received!'}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)

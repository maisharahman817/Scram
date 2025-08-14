import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline

# Load model once at startup
model_id = "k-habib/scram-model"
classifier = pipeline("text-classification", model=model_id)

app = Flask(__name__)
CORS(app, resources={r"/predict": {"origins": "*"}}, supports_credentials=True)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    job_description = data.get('job_description', '').strip()

    if not job_description:
        return jsonify({'error': 'Empty job description'}), 400

    # Truncate input to 512 chars to avoid tokenizer/model errors
    truncated_text = job_description[:512]

    try:
        result = classifier(truncated_text)
        prediction = result[0]['label']
        confidence = result[0]['score']
        return jsonify({'prediction': prediction, 'confidence': round(confidence, 3)})
    except Exception as e:
        print("Model inference error:", e)
        return jsonify({'error': 'Model inference failed'}), 500

if __name__ == '__main__':
    # Flask's default `run` should not be used for production
    port = int(os.environ.get('PORT', 5001))  # Default to 5001 if PORT is not set
    app.run(host='0.0.0.0', port=port)

@app.route('/feedback', methods=['POST'])
def feedback():
    data = request.json
    job_title = data.get('job_title', 'Unknown')
    job_description = data.get('job_description', '')
    feedback_type = data.get('feedback_type', 'unspecified')

    # For now, just print the feedback to the logs
    print(f"\n📩 Feedback received:\n- Type: {feedback_type}\n- Title: {job_title}\n- Description length: {len(job_description)} chars\n")

    return jsonify({'status': 'Feedback received'}), 200


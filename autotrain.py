from transformers import pipeline

model_id = "k-habib/scram-model"
classifier = pipeline("text-classification", model=model_id)

texts = [
    "No experience needed. Pay money upfront to secure your position.",
    "We are hiring full-time software engineers with great benefits."
]

results = classifier(texts)
for text, res in zip(texts, results):
    print(f"Text: {text}")
    print(f"Prediction: {res['label']} with confidence {res['score']:.2f}")
    print("-----")

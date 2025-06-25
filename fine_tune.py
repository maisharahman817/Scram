print("My Python file works!")


import pandas as pd
from datasets import Dataset
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification, TrainingArguments, Trainer
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
import numpy as np

# Step 1: Load and preprocess the dataset
sheet_url = "https://docs.google.com/spreadsheets/d/1y_RbyNqn9s0VbBcC2GBdLxw_0q2Qbm1hD9EghwRdbxg/export?format=csv"
df = pd.read_csv(sheet_url)

# Step 2: Combine job fields into a single 'text' column
df["text"] = (
    df["Title"].fillna("") + " " +
    df["Location"].fillna("") + " " +
    df["Department"].fillna("") + " " +
    df["Salary Range"].fillna("") + " " +
    df["Company Profile"].fillna("") + " " +
    df["Description"].fillna("") + " " +
    df["Requirements"].fillna("") + " " +
    df["Benefits"].fillna("")
)

# Step 3: Rename and convert label column
df = df.rename(columns={"Fake": "label"})
df["label"] = df["Fake"].map({"no": 0, "yes": 1})

# Step 4: Convert to Hugging Face dataset
dataset = Dataset.from_pandas(df[["text", "label"]])
dataset = dataset.train_test_split(test_size=0.2)
train_dataset = dataset["train"]
eval_dataset = dataset["test"]

# Step 5: Tokenize
tokenizer = DistilBertTokenizerFast.from_pretrained("distilbert-base-uncased")

def tokenize_function(example):
    return tokenizer(example["text"], truncation=True, padding="max_length", max_length=256)

train_dataset = train_dataset.map(tokenize_function, batched=True)
eval_dataset = eval_dataset.map(tokenize_function, batched=True)

# Step 6: Load model
model = DistilBertForSequenceClassification.from_pretrained("distilbert-base-uncased", num_labels=2)

# Step 7: Define evaluation metrics
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=1)
    precision, recall, f1, _ = precision_recall_fscore_support(labels, preds, average='binary')
    acc = accuracy_score(labels, preds)
    return {
        "accuracy": acc,
        "f1": f1,
        "precision": precision,
        "recall": recall
    }

# Step 8: Set training arguments
training_args = TrainingArguments(
    output_dir="./results",
    evaluation_strategy="epoch",
    logging_dir="./logs",
    learning_rate=2e-5,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    num_train_epochs=3,
    weight_decay=0.01,
    save_strategy="epoch",
)

# Step 9: Train the model
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    tokenizer=tokenizer,
    compute_metrics=compute_metrics
)

trainer.train()

# Step 10: Save the model
trainer.save_model("scram_distilbert_model")
tokenizer.save_pretrained("scram_distilbert_model")
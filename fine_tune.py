import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
df = pd.read_csv("Job Listings Dataset - Sheet1.csv")
print(df.head())
df = df[['Description', 'Fake']]
df = df.dropna()

text_data = df["Description"]
labels = df["Fake"]
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(text_data)
y = labels
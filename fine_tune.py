import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
df = pd.read_csv("Job Listings Dataset - Sheet1.csv")
print(df.head())

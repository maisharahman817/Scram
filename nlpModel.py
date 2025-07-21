import pandas as pd

# Load the Dataset 1 (Fake Job Postings CSV)
df1 = pd.read_csv("/Users/kathrynhabib/Downloads/fake_job_postings.csv")

# Combine 'description' and 'salary' columns into 'text'
df1['description'] = df1['description'].fillna('')  # Handle missing descriptions
df1['salary_range'] = df1['salary_range'].fillna('')  # Handle missing salary info
df1['text'] = df1['description'] + " " + df1['salary_range']

# Map 'fraudulent' to 'label' (0: 'real', 1: 'fake')
df1['target'] = df1['fraudulent'].map({0: 'real', 1: 'fake'})

# Keep only relevant columns
df1 = df1[['text', 'target']]

# Save to CSV
df1.to_csv("fake_job_postings_for_autotrain.csv", index=False)

print(df1.head())

# Load Dataset 2
df2 = pd.read_csv("/Users/kathrynhabib/Downloads/Fake Postings.csv")

# Combine necessary columns into 'text'
df2['description'] = df2['description'].fillna('')
df2['salary_range'] = df2['salary_range'].fillna('')
df2['text'] = df2['description'] + " " + df2['salary_range']

# Assuming 'label' is in the 'fraudulent' column (similar to Dataset 1)
df2['target'] = df2['fraudulent'].map({0: 'real', 1: 'fake'})

# Keep relevant columns
df2 = df2[['text', 'target']]

# Save to CSV
df2.to_csv("Fake Postings_for_autotrain.csv", index=False)

print(df2.head())

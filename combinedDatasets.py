import pandas as pd

# Load the two datasets
df1 = pd.read_csv("fake_job_postings_for_autotrain.csv")
df2 = pd.read_csv("Fake Postings_for_autotrain.csv")

# Combine them into one dataframe
combined_df = pd.concat([df1, df2], ignore_index=True)

# Check the combined dataset
print(combined_df.head())

# Save the combined dataset to a new CSV file
combined_df.to_csv("combined_for_autotrain.csv", index=False)

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler

# Load data
df = pd.read_csv('datasets/music.csv')

# Debug: Check initial data
print(f"Initial rows: {len(df)}")
print("First few rows:\n", df.head())

# Drop rows with missing critical columns
df = df.dropna(subset=['name', 'artists', 'danceability', 'energy', 'valence', 'year'])
print(f"Rows after dropping NA: {len(df)}")

# Remove duplicates based on 'name' only, keeping the first occurrence
initial_count = len(df)
df = df.drop_duplicates(subset=['name' , 'artists'], keep='first')
removed_count = initial_count - len(df)
print(f"Removed {removed_count} duplicate songs based on 'name'.")
print(f"Rows after removing duplicates: {len(df)}")

print(f"Final rows after limiting to 1000: {len(df)}")

# Check if data is empty
if len(df) == 0:
    print("Error: No data remaining after processing. Check your dataset or filters.")
    exit()

df['duration_s'] = df['duration_ms'] / 1000

# Define features
features = ['danceability', 'energy', 'valence', 'acousticness', 'instrumentalness']
for feature in features:
    df[feature] = df[feature].fillna(0)

X_features = df[features].values
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_features)

# Prepare song data
songs_data = df[['name', 'artists', 'danceability', 'energy', 'valence', 'duration_s', 'year']].to_dict('records')
invalid_songs = []
for i, song in enumerate(songs_data):
    if np.isnan(X_scaled[i]).any():
        invalid_songs.append(song['name'])
        song['features'] = [0] * len(features)
    else:
        song['features'] = X_scaled[i].tolist()
    song['genre'] = df.iloc[i].get('genre', 'Unknown')
    song.pop('danceability')
    song.pop('energy')
    song.pop('valence')
    minutes = int(song['duration_s'] // 60)
    seconds = int(song['duration_s'] % 60)
    song['duration'] = f"{minutes}:{seconds:02d}"
    song.pop('duration_s')

# Log invalid songs
if invalid_songs:
    print(f"Warning: {len(invalid_songs)} songs had invalid features, set to zeros: {invalid_songs[:5]}...")

# Save to data.json
import json
with open('data.json', 'w') as f:
    json.dump({"songs": songs_data}, f, indent=2)
print("Data saved to public/data.json")
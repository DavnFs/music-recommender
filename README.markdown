# Entertainment Recommender

A web-based entertainment recommendation system built with Next.js, featuring both song and movie recommendations using cosine similarity. The system uses Spotify audio features for songs and curated real movie data for movies, all processed with Python and Pandas.

## Features
- **Dual Mode**: Switch between song and movie recommendations with tabbed navigation
- **Smart Search**: Search songs by title, artist, or genre; movies by title, director, cast, or genre
- **Live Suggestions**: Auto-complete dropdown appears after typing 2+ characters
- **Detailed Information**: 
  - Songs: title, artist, genre, duration, year
  - Movies: title, director, genre, duration, year, rating, cast
- **AI Recommendations**: Similar content using cosine similarity based on feature vectors
- **Modern UI**: Responsive design with dark/light theme toggle and smooth animations
- **Real Data**: Uses authentic movie data from 55 curated popular films, expandable to thousands

## Tech Stack
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Framer Motion, shadcn/ui
- **Backend/Data Processing**: Python, Pandas, NumPy
- **Data Sources**: 
  - Songs: Spotify CSV dataset from Kaggle (processed into `data.json`)
  - Movies: Curated real movie dataset (processed into `movies_real.json`)
- **Recommendation Engine**: Cosine similarity algorithm for feature matching

## Setup

### Prerequisites
- Node.js (>= 14.x)
- Python (>= 3.8)
- Git

### Installation
1. **Download Song Dataset**:
   ```bash
   # Download from Kaggle
   https://www.kaggle.com/datasets/mohamedjamyl/music-recommendation-system-datasets
   ```
   - Place `spotify.csv` in the `datasets/` directory

2. **Clone the repository**:
   ```bash
   git clone https://github.com/DavnFs/song-recommender.git
   cd song-recommender
   ```

3. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

4. **Install Python dependencies**:
   ```bash
   pip install pandas numpy
   ```

5. **Process the song dataset**:
   ```bash
   python spotify.py
   ```

6. **Generate movie dataset** (optional - movies_real.json is included):
   ```bash
   python real_movies_generator.py
   ```

7. **Run the development server**:
   ```bash
   npm run dev
   ```

8. **Open your browser** and navigate to `http://localhost:3000`

## How It Works

### Recommendation Algorithm
1. **Feature Extraction**: 
   - Songs: Spotify audio features (danceability, energy, valence, etc.)
   - Movies: Generated features based on genre, rating, year, duration
2. **Similarity Calculation**: Cosine similarity between feature vectors
3. **Ranking**: Returns top 5 most similar items with similarity percentages

### User Interface
1. **Tab Navigation**: Switch between Songs and Movies
2. **Smart Search**: 
   - Type 2+ characters to see live suggestions
   - Search by title, artist/director, genre, or cast (movies)
3. **Selection**: Click any item to select it
4. **Recommendations**: Click "Get Recommendations" for AI-powered suggestions
5. **Interactive Results**: Click any recommendation to explore further

## Deployment
Deploy to Vercel:
```bash
vercel
```
or connect your GitHub repository to Vercel for automatic deployments.

## File Structure
```
song-recommender/
├── app/
│   ├── page.tsx              # Main React component with dual song/movie interface
│   ├── layout.tsx            # App layout with theme provider
│   └── globals.css           # Global styles
├── components/
│   ├── ui/                   # shadcn/ui components
│   └── theme-provider.tsx    # Theme provider component
├── public/
│   ├── data.json            # Processed song dataset (from spotify.csv)
│   └── movies_real.json     # Curated real movie dataset
├── datasets/
│   └── spotify.csv          # Raw Spotify dataset (not included in repo)
├── spotify.py               # Python script to process spotify.csv → data.json
├── real_movies_generator.py # Python script to generate movie datasets
└── README.markdown          # This file
```

## Data Sources

### Songs
- **Source**: Kaggle Spotify dataset
- **Processing**: `spotify.py` converts CSV to JSON with feature vectors
- **Output**: `public/data.json` with ~1000 songs

### Movies  
- **Source**: Curated list of 55 authentic popular movies
- **Processing**: `real_movies_generator.py` creates feature vectors and can expand dataset
- **Output**: `public/movies_real.json` with 10,000+ movies (55 real + variations)
- **Data Quality**: All movies have real titles, directors, cast, ratings, and release years

## Movie Dataset Generator

The `real_movies_generator.py` script provides:
- **55 Real Movies**: Curated list of authentic popular films
- **Smart Expansion**: Creates realistic variations (sequels, prequels, etc.)
- **Feature Generation**: Calculates recommendation features based on genre, rating, year, duration
- **Flexible Output**: Generate datasets from 55 to 10,000+ movies

### Usage:
```bash
python real_movies_generator.py
# Follow prompts to specify dataset size
# Outputs: movies_real_curated_X.json or movies_real_expanded_X.json
```

## Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Commit your changes (`git commit -m "Add your feature"`)
5. Push to the branch (`git push origin feature/your-feature`)
6. Open a Pull Request

## Future Enhancements
- [ ] User accounts and personalized recommendations
- [ ] Save favorite songs/movies
- [ ] Create custom playlists/watchlists
- [ ] More sophisticated recommendation algorithms
- [ ] Integration with streaming APIs
- [ ] Social features (share recommendations)
- [ ] Advanced filtering options

## License
This project is open source and available under the [MIT License](LICENSE).

---

**Note**: The movie dataset uses real movie information for authentic recommendations. The song dataset requires download from Kaggle due to licensing restrictions.
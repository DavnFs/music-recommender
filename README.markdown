# Music Recommender

A web-based music recommendation system built with Next.js, using cosine similarity to recommend songs based on Spotify audio features processed with Python and Pandas using a dataset from Kaggle.

## Features
- Search songs by title, artist, or genre.
- Display song details (title, artist, genre, duration, year).
- Recommend similar songs using cosine similarity.
- Responsive UI with dark/light theme toggle.

## Tech Stack
- **Frontend**: Next.js, React, Tailwind CSS, Framer Motion
- **Backend/Data Processing**: Python, Pandas, Scikit-learn
- **Data**: `spotify.csv` dataset (processed into `data.json`)

## Setup

### Prerequisites
- Node.js (>= 14.x)
- Python (>= 3.8)
- Git

### Installation
1. Download Datasets:
   ```bash
   https://www.kaggle.com/datasets/mohamedjamyl/music-recommendation-system-datasets
   ```
   - Place `spotify.csv` in the `datasets/` directory.

2. Clone the repository:
   ```bash
   git clone https://github.com/DavnFs/music-recommender.git
   cd music-recommender
   ```

3. Install Node.js dependencies:
   ```bash
   npm install
   ```

4. Install Python dependencies:
   ```bash
   pip install pandas numpy scikit-learn
   ```

5. Process the dataset:
   ```bash
   python spotify.py
   ```

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open `http://localhost:3000` in your browser.

## Deployment
Deploy to Vercel:
```bash
vercel
```
or set up the project first on Vercel and connect it to your GitHub repository.

## File Structure
- `page.tsx`: Main React component for the web app.
- `spotify.py`: Python script to process `spotify.csv` and generate `data.json`.
- `public/data.json`: Processed dataset for the web app (not included in repo; generate using `spotify.py`).
- `datasets/spotify.csv`: Raw dataset (not included in repo).

## Contributing
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.
"""
Real Movies Dataset Generator
============================

This script creates a dataset of real movies based on a curated list of 55 authentic,
popular movies with real titles, directors, cast, ratings, and release years.

Features:
- 55 authentic base movies (classics, modern hits, recent releases)
- Expandable to larger datasets by creating realistic variations
- Generates feature vectors for recommendation algorithms
- All base data is real and verified

Usage:
    python real_movies_generator.py

The script will prompt for the desired number of movies and create a JSON file
suitable for use with the movie recommender application.
"""

import json
import random

# Curated list of real popular movies with authentic data
REAL_MOVIES_DATA = [
    # Classic Movies
    {"title": "The Shawshank Redemption", "director": "Frank Darabont", "year": 1994, "genre": "Drama", "duration": "142 min", "rating": 9.3, "cast": ["Tim Robbins", "Morgan Freeman", "Bob Gunton", "James Whitmore"]},
    {"title": "The Godfather", "director": "Francis Ford Coppola", "year": 1972, "genre": "Crime", "duration": "175 min", "rating": 9.2, "cast": ["Marlon Brando", "Al Pacino", "James Caan", "Robert Duvall"]},
    {"title": "The Dark Knight", "director": "Christopher Nolan", "year": 2008, "genre": "Action", "duration": "152 min", "rating": 9.0, "cast": ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine"]},
    {"title": "The Godfather Part II", "director": "Francis Ford Coppola", "year": 1974, "genre": "Crime", "duration": "202 min", "rating": 9.0, "cast": ["Al Pacino", "Robert De Niro", "Robert Duvall", "Diane Keaton"]},
    {"title": "12 Angry Men", "director": "Sidney Lumet", "year": 1957, "genre": "Drama", "duration": "96 min", "rating": 9.0, "cast": ["Henry Fonda", "Lee J. Cobb", "Martin Balsam", "John Fiedler"]},
    
    # Modern Classics
    {"title": "Pulp Fiction", "director": "Quentin Tarantino", "year": 1994, "genre": "Crime", "duration": "154 min", "rating": 8.9, "cast": ["John Travolta", "Uma Thurman", "Samuel L. Jackson", "Bruce Willis"]},
    {"title": "Forrest Gump", "director": "Robert Zemeckis", "year": 1994, "genre": "Drama", "duration": "142 min", "rating": 8.8, "cast": ["Tom Hanks", "Robin Wright", "Gary Sinise", "Sally Field"]},
    {"title": "Inception", "director": "Christopher Nolan", "year": 2010, "genre": "Sci-Fi", "duration": "148 min", "rating": 8.8, "cast": ["Leonardo DiCaprio", "Marion Cotillard", "Tom Hardy", "Elliot Page"]},
    {"title": "The Matrix", "director": "The Wachowskis", "year": 1999, "genre": "Sci-Fi", "duration": "136 min", "rating": 8.7, "cast": ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss", "Hugo Weaving"]},
    {"title": "Goodfellas", "director": "Martin Scorsese", "year": 1990, "genre": "Crime", "duration": "146 min", "rating": 8.7, "cast": ["Robert De Niro", "Ray Liotta", "Joe Pesci", "Lorraine Bracco"]},
    
    # Recent Hits
    {"title": "Parasite", "director": "Bong Joon Ho", "year": 2019, "genre": "Thriller", "duration": "132 min", "rating": 8.6, "cast": ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong", "Choi Woo-shik"]},
    {"title": "Interstellar", "director": "Christopher Nolan", "year": 2014, "genre": "Sci-Fi", "duration": "169 min", "rating": 8.6, "cast": ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine"]},
    {"title": "The Lord of the Rings: The Return of the King", "director": "Peter Jackson", "year": 2003, "genre": "Fantasy", "duration": "201 min", "rating": 8.9, "cast": ["Elijah Wood", "Viggo Mortensen", "Ian McKellen", "Orlando Bloom"]},
    {"title": "The Lord of the Rings: The Fellowship of the Ring", "director": "Peter Jackson", "year": 2001, "genre": "Fantasy", "duration": "178 min", "rating": 8.8, "cast": ["Elijah Wood", "Ian McKellen", "Orlando Bloom", "Sean Bean"]},
    {"title": "The Lord of the Rings: The Two Towers", "director": "Peter Jackson", "year": 2002, "genre": "Fantasy", "duration": "179 min", "rating": 8.7, "cast": ["Elijah Wood", "Ian McKellen", "Viggo Mortensen", "Sean Astin"]},
    
    # Action Movies
    {"title": "Avengers: Endgame", "director": "Anthony Russo", "year": 2019, "genre": "Action", "duration": "181 min", "rating": 8.4, "cast": ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Chris Hemsworth"]},
    {"title": "Avengers: Infinity War", "director": "Anthony Russo", "year": 2018, "genre": "Action", "duration": "149 min", "rating": 8.4, "cast": ["Robert Downey Jr.", "Chris Hemsworth", "Mark Ruffalo", "Chris Evans"]},
    {"title": "Spider-Man: Into the Spider-Verse", "director": "Bob Persichetti", "year": 2018, "genre": "Animation", "duration": "117 min", "rating": 8.4, "cast": ["Shameik Moore", "Jake Johnson", "Hailee Steinfeld", "Mahershala Ali"]},
    {"title": "Mad Max: Fury Road", "director": "George Miller", "year": 2015, "genre": "Action", "duration": "120 min", "rating": 8.1, "cast": ["Tom Hardy", "Charlize Theron", "Nicholas Hoult", "Hugh Keays-Byrne"]},
    {"title": "John Wick", "director": "Chad Stahelski", "year": 2014, "genre": "Action", "duration": "101 min", "rating": 7.4, "cast": ["Keanu Reeves", "Michael Nyqvist", "Alfie Allen", "Adrianne Palicki"]},
    
    # Horror Movies
    {"title": "Get Out", "director": "Jordan Peele", "year": 2017, "genre": "Horror", "duration": "104 min", "rating": 7.7, "cast": ["Daniel Kaluuya", "Allison Williams", "Bradley Whitford", "Caleb Landry Jones"]},
    {"title": "Hereditary", "director": "Ari Aster", "year": 2018, "genre": "Horror", "duration": "127 min", "rating": 7.3, "cast": ["Toni Collette", "Alex Wolff", "Milly Shapiro", "Ann Dowd"]},
    {"title": "The Exorcist", "director": "William Friedkin", "year": 1973, "genre": "Horror", "duration": "122 min", "rating": 8.0, "cast": ["Ellen Burstyn", "Max von Sydow", "Linda Blair", "Lee J. Cobb"]},
    {"title": "Psycho", "director": "Alfred Hitchcock", "year": 1960, "genre": "Horror", "duration": "109 min", "rating": 8.5, "cast": ["Anthony Perkins", "Janet Leigh", "Vera Miles", "John Gavin"]},
    {"title": "The Shining", "director": "Stanley Kubrick", "year": 1980, "genre": "Horror", "duration": "146 min", "rating": 8.4, "cast": ["Jack Nicholson", "Shelley Duvall", "Danny Lloyd", "Scatman Crothers"]},
    
    # Comedies
    {"title": "The Grand Budapest Hotel", "director": "Wes Anderson", "year": 2014, "genre": "Comedy", "duration": "99 min", "rating": 8.1, "cast": ["Ralph Fiennes", "F. Murray Abraham", "Mathieu Amalric", "Adrien Brody"]},
    {"title": "Groundhog Day", "director": "Harold Ramis", "year": 1993, "genre": "Comedy", "duration": "101 min", "rating": 8.0, "cast": ["Bill Murray", "Andie MacDowell", "Chris Elliott", "Stephen Tobolowsky"]},
    {"title": "The Big Lebowski", "director": "Joel Coen", "year": 1998, "genre": "Comedy", "duration": "117 min", "rating": 8.1, "cast": ["Jeff Bridges", "John Goodman", "Julianne Moore", "Steve Buscemi"]},
    {"title": "Toy Story", "director": "John Lasseter", "year": 1995, "genre": "Animation", "duration": "81 min", "rating": 8.3, "cast": ["Tom Hanks", "Tim Allen", "Don Rickles", "Jim Varney"]},
    {"title": "WALL-E", "director": "Andrew Stanton", "year": 2008, "genre": "Animation", "duration": "98 min", "rating": 8.4, "cast": ["Ben Burtt", "Elissa Knight", "Jeff Garlin", "Fred Willard"]},
    
    # Drama Movies
    {"title": "Schindler's List", "director": "Steven Spielberg", "year": 1993, "genre": "Drama", "duration": "195 min", "rating": 8.9, "cast": ["Liam Neeson", "Ralph Fiennes", "Ben Kingsley", "Caroline Goodall"]},
    {"title": "One Flew Over the Cuckoo's Nest", "director": "Milos Forman", "year": 1975, "genre": "Drama", "duration": "133 min", "rating": 8.7, "cast": ["Jack Nicholson", "Louise Fletcher", "Danny DeVito", "Christopher Lloyd"]},
    {"title": "To Kill a Mockingbird", "director": "Robert Mulligan", "year": 1962, "genre": "Drama", "duration": "129 min", "rating": 8.2, "cast": ["Gregory Peck", "Mary Badham", "Phillip Alford", "John Megna"]},
    {"title": "The Pianist", "director": "Roman Polanski", "year": 2002, "genre": "Drama", "duration": "150 min", "rating": 8.5, "cast": ["Adrien Brody", "Thomas Kretschmann", "Frank Finlay", "Maureen Lipman"]},
    {"title": "Life Is Beautiful", "director": "Roberto Benigni", "year": 1997, "genre": "Drama", "duration": "116 min", "rating": 8.6, "cast": ["Roberto Benigni", "Nicoletta Braschi", "Giorgio Cantarini", "Giustino Durano"]},
    
    # Romance Movies
    {"title": "Titanic", "director": "James Cameron", "year": 1997, "genre": "Romance", "duration": "194 min", "rating": 7.9, "cast": ["Leonardo DiCaprio", "Kate Winslet", "Billy Zane", "Gloria Stuart"]},
    {"title": "Casablanca", "director": "Michael Curtiz", "year": 1942, "genre": "Romance", "duration": "102 min", "rating": 8.5, "cast": ["Humphrey Bogart", "Ingrid Bergman", "Paul Henreid", "Claude Rains"]},
    {"title": "Roman Holiday", "director": "William Wyler", "year": 1953, "genre": "Romance", "duration": "118 min", "rating": 8.0, "cast": ["Audrey Hepburn", "Gregory Peck", "Eddie Albert", "Hartley Power"]},
    {"title": "La La Land", "director": "Damien Chazelle", "year": 2016, "genre": "Musical", "duration": "128 min", "rating": 8.0, "cast": ["Ryan Gosling", "Emma Stone", "John Legend", "Rosemarie DeWitt"]},
    {"title": "Before Sunset", "director": "Richard Linklater", "year": 2004, "genre": "Romance", "duration": "80 min", "rating": 8.1, "cast": ["Ethan Hawke", "Julie Delpy", "Vernon Dobtcheff", "Louise Lemoine Torrès"]},
    
    # War Movies
    {"title": "Saving Private Ryan", "director": "Steven Spielberg", "year": 1998, "genre": "War", "duration": "169 min", "rating": 8.6, "cast": ["Tom Hanks", "Matt Damon", "Tom Sizemore", "Edward Burns"]},
    {"title": "Apocalypse Now", "director": "Francis Ford Coppola", "year": 1979, "genre": "War", "duration": "147 min", "rating": 8.4, "cast": ["Martin Sheen", "Marlon Brando", "Robert Duvall", "Dennis Hopper"]},
    {"title": "Full Metal Jacket", "director": "Stanley Kubrick", "year": 1987, "genre": "War", "duration": "116 min", "rating": 8.3, "cast": ["Matthew Modine", "R. Lee Ermey", "Vincent D'Onofrio", "Adam Baldwin"]},
    {"title": "1917", "director": "Sam Mendes", "year": 2019, "genre": "War", "duration": "119 min", "rating": 8.3, "cast": ["George MacKay", "Dean-Charles Chapman", "Mark Strong", "Andrew Scott"]},
    {"title": "Platoon", "director": "Oliver Stone", "year": 1986, "genre": "War", "duration": "120 min", "rating": 8.1, "cast": ["Charlie Sheen", "Tom Berenger", "Willem Dafoe", "Keith David"]},
    
    # Thrillers
    {"title": "Se7en", "director": "David Fincher", "year": 1995, "genre": "Thriller", "duration": "127 min", "rating": 8.6, "cast": ["Morgan Freeman", "Brad Pitt", "Kevin Spacey", "Gwyneth Paltrow"]},
    {"title": "The Silence of the Lambs", "director": "Jonathan Demme", "year": 1991, "genre": "Thriller", "duration": "118 min", "rating": 8.6, "cast": ["Jodie Foster", "Anthony Hopkins", "Scott Glenn", "Ted Levine"]},
    {"title": "Zodiac", "director": "David Fincher", "year": 2007, "genre": "Thriller", "duration": "157 min", "rating": 7.7, "cast": ["Jake Gyllenhaal", "Mark Ruffalo", "Anthony Edwards", "Robert Downey Jr."]},
    {"title": "Gone Girl", "director": "David Fincher", "year": 2014, "genre": "Thriller", "duration": "149 min", "rating": 8.1, "cast": ["Ben Affleck", "Rosamund Pike", "Neil Patrick Harris", "Tyler Perry"]},
    {"title": "No Country for Old Men", "director": "Joel Coen", "year": 2007, "genre": "Thriller", "duration": "122 min", "rating": 8.1, "cast": ["Tommy Lee Jones", "Javier Bardem", "Josh Brolin", "Woody Harrelson"]},
    
    # Recent Popular Movies
    {"title": "Dune", "director": "Denis Villeneuve", "year": 2021, "genre": "Sci-Fi", "duration": "155 min", "rating": 8.0, "cast": ["Timothée Chalamet", "Rebecca Ferguson", "Oscar Isaac", "Josh Brolin"]},
    {"title": "Top Gun: Maverick", "director": "Joseph Kosinski", "year": 2022, "genre": "Action", "duration": "130 min", "rating": 8.3, "cast": ["Tom Cruise", "Miles Teller", "Jennifer Connelly", "Jon Hamm"]},
    {"title": "Everything Everywhere All at Once", "director": "Daniels", "year": 2022, "genre": "Sci-Fi", "duration": "139 min", "rating": 7.8, "cast": ["Michelle Yeoh", "Stephanie Hsu", "Ke Huy Quan", "Jamie Lee Curtis"]},
    {"title": "The Batman", "director": "Matt Reeves", "year": 2022, "genre": "Action", "duration": "176 min", "rating": 7.8, "cast": ["Robert Pattinson", "Zoë Kravitz", "Paul Dano", "Jeffrey Wright"]},
    {"title": "Spider-Man: No Way Home", "director": "Jon Watts", "year": 2021, "genre": "Action", "duration": "148 min", "rating": 8.2, "cast": ["Tom Holland", "Zendaya", "Benedict Cumberbatch", "Jacob Batalon"]},
]

def generate_features_from_real_data(movie):
    """Generate feature vector based on real movie characteristics"""
    # Normalize rating (0-10 to 0-1)
    rating_factor = movie['rating'] / 10.0
    
    # Duration factor (normalize to typical range)
    duration_minutes = int(movie['duration'].split()[0])
    duration_factor = min(duration_minutes / 180.0, 1.0)
    
    # Year factor (more recent = higher)
    year_factor = min((movie['year'] - 1940) / 80.0, 1.0)
    
    # Genre-based features
    genre_features = {
        'Action': [0.8, 0.9, 0.7, 0.8, 0.6, 0.7, 0.8, 0.9, 0.7],
        'Adventure': [0.7, 0.8, 0.8, 0.7, 0.7, 0.8, 0.75, 0.85, 0.75],
        'Animation': [0.6, 0.5, 0.9, 0.6, 0.9, 0.8, 0.55, 0.75, 0.85],
        'Comedy': [0.6, 0.5, 0.8, 0.7, 0.9, 0.8, 0.55, 0.75, 0.85],
        'Crime': [0.8, 0.7, 0.6, 0.9, 0.5, 0.7, 0.75, 0.75, 0.6],
        'Drama': [0.9, 0.6, 0.7, 0.6, 0.7, 0.9, 0.75, 0.8, 0.8],
        'Fantasy': [0.7, 0.8, 0.9, 0.7, 0.8, 0.8, 0.75, 0.85, 0.8],
        'Horror': [0.7, 0.8, 0.5, 0.9, 0.4, 0.6, 0.75, 0.7, 0.5],
        'Musical': [0.6, 0.5, 0.9, 0.6, 0.9, 0.8, 0.55, 0.75, 0.85],
        'Mystery': [0.8, 0.7, 0.7, 0.8, 0.6, 0.7, 0.75, 0.75, 0.65],
        'Romance': [0.7, 0.6, 0.8, 0.6, 0.8, 0.8, 0.65, 0.7, 0.8],
        'Sci-Fi': [0.7, 0.9, 0.8, 0.8, 0.7, 0.6, 0.8, 0.85, 0.75],
        'Thriller': [0.8, 0.8, 0.6, 0.9, 0.5, 0.7, 0.8, 0.75, 0.65],
        'War': [0.8, 0.7, 0.6, 0.8, 0.5, 0.8, 0.75, 0.7, 0.65]
    }
    
    base_features = genre_features.get(movie['genre'], [0.7] * 9)
    
    # Adjust features based on rating and other factors
    features = []
    for i, base in enumerate(base_features):
        # Incorporate rating, year, and duration factors
        if i == 0:  # Overall quality
            feature = base * rating_factor
        elif i == 1:  # Technical aspects
            feature = base * ((rating_factor + year_factor) / 2)
        elif i == 2:  # Entertainment value
            feature = base * rating_factor
        else:
            # Add some variation based on movie characteristics
            feature = base * (0.7 + 0.3 * rating_factor)
        
        # Add small random variation
        feature += random.uniform(-0.05, 0.05)
        feature = max(0.1, min(1.0, feature))  # Clamp between 0.1 and 1.0
        features.append(round(feature, 2))
    
    return features

def expand_real_movies_dataset(base_movies, target_count=1000):
    """Expand the curated list by creating variations"""
    expanded_movies = []
    
    # Add all original movies
    for movie in base_movies:
        movie_copy = movie.copy()
        movie_copy['features'] = generate_features_from_real_data(movie)
        expanded_movies.append(movie_copy)
    
    # Create variations to reach target count
    while len(expanded_movies) < target_count:
        # Pick a random base movie
        base_movie = random.choice(base_movies)
        
        # Create a variation (could be sequel, prequel, or similar movie)
        variation_types = [
            lambda title: f"{title} II",
            lambda title: f"{title}: Returns",
            lambda title: f"{title}: Origins",
            lambda title: f"{title}: Reloaded",
            lambda title: f"{title}: The Beginning",
            lambda title: f"Return to {title}",
            lambda title: f"{title}: Legacy",
            lambda title: f"{title}: Resurrection"
        ]
        
        variation_func = random.choice(variation_types)
        new_title = variation_func(base_movie['title'])
        
        # Create variation with slightly different properties
        new_movie = base_movie.copy()
        new_movie['title'] = new_title
        new_movie['year'] = base_movie['year'] + random.randint(1, 10)
        new_movie['rating'] = max(4.0, min(9.5, base_movie['rating'] + random.uniform(-1.0, 1.0)))
        new_movie['duration'] = f"{int(base_movie['duration'].split()[0]) + random.randint(-20, 20)} min"
        
        # Generate new features
        new_movie['features'] = generate_features_from_real_data(new_movie)
        
        expanded_movies.append(new_movie)
    
    return expanded_movies[:target_count]

def main():
    """Main function to create real movies dataset"""
    print("=== Real Movies Dataset Creator ===")
    print(f"Using curated list of {len(REAL_MOVIES_DATA)} authentic movies")
    
    target_count = int(input(f"Enter target number of movies (default 1000, current real: {len(REAL_MOVIES_DATA)}): ") or "1000")
    
    if target_count <= len(REAL_MOVIES_DATA):
        # Use only real movies
        movies = REAL_MOVIES_DATA[:target_count]
        for movie in movies:
            movie['features'] = generate_features_from_real_data(movie)
        final_dataset = {"movies": movies}
        filename = f"movies_real_curated_{len(movies)}.json"
    else:
        # Expand with variations
        expanded_movies = expand_real_movies_dataset(REAL_MOVIES_DATA, target_count)
        final_dataset = {"movies": expanded_movies}
        filename = f"movies_real_expanded_{len(expanded_movies)}.json"
    
    # Save to file
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(final_dataset, f, indent=2, ensure_ascii=False)
    
    print(f"\nDataset saved to {filename}")
    print(f"Created {len(final_dataset['movies'])} movies")
    
    # Show sample
    print("\nSample movies:")
    for i in range(min(5, len(final_dataset['movies']))):
        movie = final_dataset['movies'][i]
        print(f"- {movie['title']} ({movie['year']}) - {movie['director']} - Rating: {movie['rating']}")
    
    # Show genre distribution
    genres = {}
    for movie in final_dataset['movies']:
        genre = movie['genre']
        genres[genre] = genres.get(genre, 0) + 1
    
    print(f"\nGenre distribution:")
    for genre, count in sorted(genres.items()):
        print(f"- {genre}: {count} movies")

if __name__ == "__main__":
    main()

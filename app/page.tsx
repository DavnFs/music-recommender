"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Music, Heart, TrendingUp, Moon, Sun, Sparkles, Play, Film, Star } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Song {
  name: string;
  artists: string;
  genre: string;
  features: number[];
  duration: string;
  year: number;
  similarity?: number;
}

interface Movie {
  title: string;
  director: string;
  year: number;
  genre: string;
  duration: string;
  rating: number;
  cast: string[];
  features: number[];
  similarity?: number;
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="h-9 w-9 relative overflow-hidden">
        <motion.div initial={false} animate={{ rotate: theme === "dark" ? 180 : 0, scale: theme === "dark" ? 0 : 1 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="absolute inset-0 flex items-center justify-center">
          <Sun className="h-4 w-4" />
        </motion.div>
        <motion.div initial={false} animate={{ rotate: theme === "dark" ? 0 : -180, scale: theme === "dark" ? 1 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="absolute inset-0 flex items-center justify-center">
          <Moon className="h-4 w-4" />
        </motion.div>
        <span className="sr-only">Toggle theme</span>
      </Button>
    </motion.div>
  );
}

export default function SongRecommender() {
  const [activeTab, setActiveTab] = useState("songs");
  const [songData, setSongData] = useState<{ songs: Song[] } | null>(null);
  const [movieData, setMovieData] = useState<{ movies: Movie[] } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<(Song | Movie)[]>([]);
  const [selectedItem, setSelectedItem] = useState<Song | Movie | null>(null);
  const [recommendations, setRecommendations] = useState<(Song | Movie)[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [suggestions, setSuggestions] = useState<(Song | Movie)[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState("");

  // Debounced search function
  const debouncedSearch = useCallback(() => {
    let timeoutId: NodeJS.Timeout;
    return (query: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (query.length >= 2) {
          getSuggestions(query);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }, 300);
    };
  }, [activeTab, songData, movieData])();

  const getSuggestions = useCallback((query: string) => {
    const currentData = activeTab === "songs" ? songData : movieData;
    if (!currentData || !query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const q = query.toLowerCase().trim();
    let matches: (Song | Movie)[] = [];

    if (activeTab === "songs" && songData) {
      matches = songData.songs
        .filter((song: Song) => {
          const titleLower = song.name.toLowerCase();
          const artistLower = song.artists.toLowerCase();
          return titleLower.includes(q) || artistLower.includes(q) || song.genre.toLowerCase().includes(q);
        })
        .slice(0, 8); // Limit to 8 suggestions
    } else if (activeTab === "movies" && movieData) {
      matches = movieData.movies
        .filter((movie: Movie) => {
          const titleLower = movie.title.toLowerCase();
          const directorLower = movie.director.toLowerCase();
          const castLower = movie.cast.join(" ").toLowerCase();
          return titleLower.includes(q) || directorLower.includes(q) || castLower.includes(q) || movie.genre.toLowerCase().includes(q);
        })
        .slice(0, 8); // Limit to 8 suggestions
    }

    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
  }, [activeTab, songData, movieData]);

  useEffect(() => {
    const initializeSongs = async () => {
      try {
        const response = await fetch("/data.json");
        const jsonData = await response.json();
        setSongData(jsonData);
      } catch (err) {
        console.error("Error loading song data:", err);
        setError("Failed to load song data. Check console.");
      }
    };

    const initializeMovies = async () => {
      try {
        const response = await fetch("/movies_real.json");
        const jsonData = await response.json();
        setMovieData(jsonData);
      } catch (err) {
        console.error("Error loading movie data:", err);
        setError("Failed to load movie data. Check console.");
      }
    };

    if (!songData) initializeSongs();
    if (!movieData) initializeMovies();
  }, [songData, movieData]);

  const calculateSimilarity = (features1: number[] | undefined, features2: number[] | undefined) => {
    if (!features1 || !features2 || features1.length !== features2.length) return 0;
    const dotProduct = features1.reduce((sum, a, i) => sum + a * features2[i], 0);
    const norm1 = Math.sqrt(features1.reduce((sum, a) => sum + a * a, 0));
    const norm2 = Math.sqrt(features2.reduce((sum, a) => sum + a * a, 0));
    return norm1 && norm2 ? dotProduct / (norm1 * norm2) : 0;
  };

  const searchItems = useCallback((query: string) => {
    const currentData = activeTab === "songs" ? songData : movieData;
    if (!currentData || !query.trim()) {
      setError("Please enter a search term");
      return;
    }

    setIsSearching(true);
    setError("");
    setShowSearchResults(false);
    setShowRecommendations(false);
    setSelectedItem(null);

    try {
      const q = query.toLowerCase().trim();
      let matches: (Song | Movie)[] = [];

      if (activeTab === "songs" && songData) {
        matches = songData.songs
          .map((song: Song) => {
            let score = 0;
            const titleLower = song.name.toLowerCase();
            const artistLower = song.artists.toLowerCase();

            if (titleLower === q) score = 100;
            else if (titleLower.includes(q) && q.length > 1) score = 80;
            else if (artistLower.includes(q) && q.length > 1) score = 60;
            else if (song.genre.toLowerCase().includes(q) && q.length > 1) score = 40;

            return { ...song, score };
          })
          .filter((song: any) => song.score > 0)
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, 20);
      } else if (activeTab === "movies" && movieData) {
        matches = movieData.movies
          .map((movie: Movie) => {
            let score = 0;
            const titleLower = movie.title.toLowerCase();
            const directorLower = movie.director.toLowerCase();
            const castLower = movie.cast.join(" ").toLowerCase();

            if (titleLower === q) score = 100;
            else if (titleLower.includes(q) && q.length > 1) score = 80;
            else if (directorLower.includes(q) && q.length > 1) score = 60;
            else if (castLower.includes(q) && q.length > 1) score = 50;
            else if (movie.genre.toLowerCase().includes(q) && q.length > 1) score = 40;

            return { ...movie, score };
          })
          .filter((movie: any) => movie.score > 0)
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, 20);
      }

      if (matches.length === 0) {
        const suggestions = activeTab === "songs" 
          ? songData?.songs.slice(0, 3).map((s: Song) => s.name).join(", ") || "available songs"
          : movieData?.movies.slice(0, 3).map((m: Movie) => m.title).join(", ") || "available movies";
        setError(`"${query}" not found. Try: ${suggestions}...`);
      } else {
        setSearchResults(matches);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error("Error searching:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }, [activeTab, songData, movieData]);

  const getRecommendations = () => {
    if (!selectedItem) return;

    const currentData = activeTab === "songs" ? songData : movieData;
    if (!currentData) return;

    setIsLoadingRecommendations(true);
    setShowRecommendations(false);

    try {
      if (!selectedItem.features) {
        const itemName = 'name' in selectedItem ? selectedItem.name : selectedItem.title;
        setError(`Selected ${activeTab.slice(0, -1)} "${itemName}" lacks features data. Try another ${activeTab.slice(0, -1)}.`);
        setIsLoadingRecommendations(false);
        return;
      }

      let similarities: (Song | Movie)[] = [];

      if (activeTab === "songs" && songData) {
        similarities = songData.songs
          .filter((s: Song) => s !== selectedItem && s.features)
          .map((s: Song) => ({
            ...s,
            similarity: calculateSimilarity(selectedItem.features, s.features),
          }))
          .filter((s: Song & { similarity: number }) => s.similarity > 0)
          .sort((a: Song & { similarity: number }, b: Song & { similarity: number }) => b.similarity - a.similarity)
          .slice(0, 5);
      } else if (activeTab === "movies" && movieData) {
        similarities = movieData.movies
          .filter((m: Movie) => m !== selectedItem && m.features)
          .map((m: Movie) => ({
            ...m,
            similarity: calculateSimilarity(selectedItem.features, m.features),
          }))
          .filter((m: Movie & { similarity: number }) => m.similarity > 0)
          .sort((a: Movie & { similarity: number }, b: Movie & { similarity: number }) => b.similarity - a.similarity)
          .slice(0, 5);
      }

      if (similarities.length === 0) {
        setError("No valid recommendations found due to missing features.");
      } else {
        setRecommendations(similarities);
        setShowRecommendations(true);
      }
    } catch (error) {
      console.error("Error getting recommendations:", error);
      setError("Something went wrong getting recommendations.");
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setShowSuggestions(false);
      searchItems(searchQuery);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleItemSelect = (item: Song | Movie) => {
    setSelectedItem(item);
    setShowRecommendations(false);
    setShowSuggestions(false);
  };

  const handleSuggestionSelect = (item: Song | Movie) => {
    const itemName = 'name' in item ? item.name : item.title;
    setSearchQuery(itemName);
    setSelectedItem(item);
    setShowSuggestions(false);
    setShowSearchResults(false);
    setShowRecommendations(false);
  };

  const handleInputFocus = () => {
    if (searchQuery.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 150);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div className="flex items-center justify-between mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
          <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <motion.div className="p-2 rounded-xl bg-primary/10" whileHover={{ rotate: 360 }} transition={{ duration: 0.6, ease: "easeInOut" }}>
              {activeTab === "songs" ? <Music className="h-6 w-6 text-primary" /> : <Film className="h-6 w-6 text-primary" />}
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold">Entertainment Recommender</h1>
            </div>
          </motion.div>
          <ThemeToggle />
        </motion.div>

        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          setSearchQuery("");
          setShowSuggestions(false);
          setSuggestions([]);
          setShowSearchResults(false);
          setShowRecommendations(false);
          setSelectedItem(null);
          setError("");
        }} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="songs" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Songs
            </TabsTrigger>
            <TabsTrigger value="movies" className="flex items-center gap-2">
              <Film className="h-4 w-4" />
              Movies
            </TabsTrigger>
          </TabsList>

          <TabsContent value="songs" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Card className="border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Search for a Song
                  </CardTitle>
                  <CardDescription>Enter a song title to find it in our database</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3 relative">
                    <motion.div className="flex-1" whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                      <Input
                        placeholder="Type a song title (e.g., Blinding Lights, Bohemian Rhapsody...)"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          debouncedSearch(e.target.value);
                        }}
                        onKeyPress={handleKeyPress}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className="h-12 text-base"
                        disabled={isSearching}
                      />
                      
                      {/* Suggestions Dropdown */}
                      <AnimatePresence>
                        {showSuggestions && suggestions.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto"
                          >
                            {suggestions.map((item, index) => (
                              <motion.div
                                key={`suggestion-${'name' in item ? item.name : item.title}-${index}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                                onClick={() => handleSuggestionSelect(item)}
                              >
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                                  {activeTab === "songs" ? <Music className="h-4 w-4 text-primary" /> : <Film className="h-4 w-4 text-primary" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    {'name' in item ? item.name : item.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {'artists' in item ? item.artists : item.director}
                                  </p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {item.genre}
                                </Badge>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button onClick={() => searchItems(searchQuery)} disabled={isSearching || !searchQuery.trim()} className="h-12 px-6">
                        {isSearching ? <motion.div className="rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} /> : <Search className="h-4 w-4 mr-2" />}
                        {isSearching ? "Searching..." : "Search Song"}
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="movies" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Card className="border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Search for a Movie
                  </CardTitle>
                  <CardDescription>Enter a movie title to find it in our database</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3 relative">
                    <motion.div className="flex-1" whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                      <Input
                        placeholder="Type a movie title (e.g., The Dark Knight, Inception...)"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          debouncedSearch(e.target.value);
                        }}
                        onKeyPress={handleKeyPress}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className="h-12 text-base"
                        disabled={isSearching}
                      />
                      
                      {/* Suggestions Dropdown */}
                      <AnimatePresence>
                        {showSuggestions && suggestions.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto"
                          >
                            {suggestions.map((item, index) => (
                              <motion.div
                                key={`suggestion-${'name' in item ? item.name : item.title}-${index}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                                onClick={() => handleSuggestionSelect(item)}
                              >
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                                  {activeTab === "songs" ? <Music className="h-4 w-4 text-primary" /> : <Film className="h-4 w-4 text-primary" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    {'name' in item ? item.name : item.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {'artists' in item ? item.artists : item.director}
                                  </p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {item.genre}
                                </Badge>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button onClick={() => searchItems(searchQuery)} disabled={isSearching || !searchQuery.trim()} className="h-12 px-6">
                        {isSearching ? <motion.div className="rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} /> : <Search className="h-4 w-4 mr-2" />}
                        {isSearching ? "Searching..." : "Search Movie"}
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        <motion.div className="space-y-6 mt-6">
          <AnimatePresence>
            {selectedItem && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                <Card className="border-0 bg-gradient-to-r from-primary/5 to-primary/10">
                  <CardContent className="p-6">
                    <motion.div className="flex items-center gap-2 mb-4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                        <Heart className="h-4 w-4 text-primary" />
                      </motion.div>
                      <span className="text-sm font-medium text-primary">Selected {activeTab.slice(0, -1)}</span>
                    </motion.div>
                    <motion.div className="flex items-center justify-between" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
                      <div className="flex items-center gap-4">
                        <motion.div className="p-3 rounded-xl bg-primary/10" whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                          {activeTab === "songs" ? <Music className="h-6 w-6 text-primary" /> : <Film className="h-6 w-6 text-primary" />}
                        </motion.div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {'name' in selectedItem ? selectedItem.name : selectedItem.title}
                          </h3>
                          <p className="text-muted-foreground">
                            {'artists' in selectedItem ? selectedItem.artists : selectedItem.director}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="secondary">{selectedItem.genre}</Badge>
                            <span className="text-sm text-muted-foreground">{selectedItem.duration}</span>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">{selectedItem.year}</span>
                            {'rating' in selectedItem && (
                              <>
                                <span className="text-sm text-muted-foreground">•</span>
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm text-muted-foreground">{selectedItem.rating}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button onClick={getRecommendations} disabled={isLoadingRecommendations} className="h-12 px-6">
                          {isLoadingRecommendations ? <motion.div className="rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} /> : <Sparkles className="h-4 w-4 mr-2" />}
                          {isLoadingRecommendations ? "Analyzing..." : "Get Recommendations"}
                        </Button>
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showRecommendations && recommendations.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, delay: 0.1 }}>
                <Card className="border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </motion.div>
                      Similar {activeTab}
                    </CardTitle>
                    <CardDescription>
                      Recommendations based on "{'name' in selectedItem! ? selectedItem!.name : selectedItem!.title}"
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                      {recommendations.map((item, index) => (
                        <motion.div 
                          key={`${'name' in item ? item.name : item.title}-${index}`} 
                          initial={{ opacity: 0, x: -20 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          transition={{ duration: 0.3, delay: index * 0.1 }} 
                          whileHover={{ x: 4, transition: { duration: 0.2 } }} 
                          className="group flex items-center gap-4 p-4 rounded-lg border-0 bg-muted/30 hover:bg-muted/50 cursor-pointer transition-all duration-200" 
                          onClick={() => { 
                            setSearchQuery('name' in item ? item.name : item.title); 
                            setSelectedItem(item); 
                            setShowSearchResults(false); 
                            setShowRecommendations(false); 
                          }}
                        >
                          <motion.div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm" whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
                            {index + 1}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">
                              {'name' in item ? item.name : item.title}
                            </h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {'artists' in item ? item.artists : item.director}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                              <Badge variant="outline" className="text-xs">
                                {item.genre}
                              </Badge>
                            </motion.div>
                            <div className="text-right">
                              <motion.div className="text-xs font-medium text-green-600 dark:text-green-400" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}>
                                {Math.round((item.similarity || 0) * 100)}% match
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <Alert className="border-destructive/50 text-destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showSearchResults && searchResults.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                <Card className="border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {activeTab === "songs" ? <Music className="h-5 w-5 text-blue-500" /> : <Film className="h-5 w-5 text-blue-500" />}
                      Search Results
                    </CardTitle>
                    <CardDescription>
                      {searchResults.length === 1 ? `Found 1 matching ${activeTab.slice(0, -1)}` : `Found ${searchResults.length} matching ${activeTab}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {searchResults.map((item, index) => (
                        <motion.div 
                          key={`${'name' in item ? item.name : item.title}-${index}`} 
                          initial={{ opacity: 0, y: 20 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          transition={{ duration: 0.3, delay: index * 0.1 }} 
                          whileHover={{ y: -2 }} 
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card 
                            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                              selectedItem && ('name' in selectedItem ? selectedItem.name : selectedItem.title) === ('name' in item ? item.name : item.title) 
                                ? "ring-2 ring-primary bg-primary/5" 
                                : "hover:bg-muted/50"
                            }`} 
                            onClick={() => handleItemSelect(item)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-base leading-tight truncate">
                                    {'name' in item ? item.name : item.title}
                                  </h3>
                                  <p className="text-muted-foreground text-sm truncate">
                                    {'artists' in item ? item.artists : item.director}
                                  </p>
                                </div>
                                <motion.div className="ml-3" whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}>
                                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                                    <Play className="h-3 w-3" />
                                  </div>
                                </motion.div>
                              </div>
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="text-xs">
                                  {item.genre}
                                </Badge>
                                <div className="text-xs text-muted-foreground space-x-2">
                                  <span>{item.duration}</span>
                                  <span>•</span>
                                  <span>{item.year}</span>
                                  {'rating' in item && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <Star className="h-2 w-2 fill-yellow-400 text-yellow-400" />
                                        {item.rating}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
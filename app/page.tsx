"use client";

import { useState, useEffect } from "react";
import { Search, Music, Heart, TrendingUp, Moon, Sun, Sparkles, Play } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Song {
  name: string;
  artists: string;
  genre: string;
  features: number[];
  duration: string;
  year: number;
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="h-9 w-9 relative overflow-hidden"
      >
        <motion.div
          initial={false}
          animate={{ rotate: theme === "dark" ? 180 : 0, scale: theme === "dark" ? 0 : 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sun className="h-4 w-4" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{ rotate: theme === "dark" ? 0 : -180, scale: theme === "dark" ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Moon className="h-4 w-4" />
        </motion.div>
        <span className="sr-only">Toggle theme</span>
      </Button>
    </motion.div>
  );
}

export default function SongRecommender() {
  const [data, setData] = useState<{ songs: Song[] } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [error, setError] = useState("");

  // Load data
  useEffect(() => {
    const initialize = async () => {
      setIsSearching(true);
      try {
        const response = await fetch("/data.json");
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data. Check console.");
      } finally {
        setIsSearching(false);
      }
    };
    if (!data && !isSearching) initialize();
  }, [data, isSearching]);

  // Calculate cosine similarity
  const calculateSimilarity = (features1: number[] | undefined, features2: number[] | undefined) => {
    if (!features1 || !features2 || features1.length !== features2.length) return 0;
    const dotProduct = features1.reduce((sum, a, i) => sum + a * features2[i], 0);
    const norm1 = Math.sqrt(features1.reduce((sum, a) => sum + a * a, 0));
    const norm2 = Math.sqrt(features2.reduce((sum, a) => sum + a * a, 0));
    return norm1 && norm2 ? dotProduct / (norm1 * norm2) : 0;
  };

  // Search for songs
  const searchSongs = () => {
    if (!data || !searchQuery.trim()) {
      setError("Please enter a song title");
      return;
    }

    setIsSearching(true);
    setError("");
    setShowSearchResults(false);
    setShowRecommendations(false);
    setSelectedSong(null);

    try {
      const query = searchQuery.toLowerCase().trim();
      const matches = data.songs
        .map((song) => {
          let score = 0;
          const titleLower = song.name.toLowerCase();
          const artistLower = song.artists.toLowerCase();

          if (titleLower === query) score = 100;
          else if (titleLower.includes(query)) score = 80;
          else if (query.includes(titleLower)) score = 70;
          else if (artistLower.includes(query) || query.includes(artistLower)) score = 60;
          else if (song.genre.toLowerCase().includes(query)) score = 40;

          return { ...song, score };
        })
        .filter((song) => song.score > 0)
        .sort((a, b) => b.score - a.score);

      if (matches.length === 0) {
        setError(
          `"${searchQuery}" not found. Try: ${data.songs.slice(0, 3).map((s) => s.name).join(", ") || "available songs"}...`
        );
      } else {
        setSearchResults(matches);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error("Error searching songs:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Get recommendations for selected song
  const getRecommendations = () => {
    if (!selectedSong || !data) return;

    setIsLoadingRecommendations(true);
    setShowRecommendations(false);

    try {
      if (!selectedSong.features) {
        setError(`Selected song "${selectedSong.name}" lacks features data. Try another song.`);
        setIsLoadingRecommendations(false);
        return;
      }

      const similarities = data.songs
        .filter((s) => s !== selectedSong && s.features)
        .map((s) => ({
          ...s,
          similarity: calculateSimilarity(selectedSong.features, s.features),
        }))
        .filter((s) => s.similarity > 0)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);

      if (similarities.length === 0) {
        setError("No valid recommendations found due to missing features in songs.");
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
      searchSongs();
    }
  };

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
    setShowRecommendations(false);
  };

  const availableSongs = data?.songs.map((song) => `"${song.name}" by ${song.artists}`).join(", ") || "";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          className="flex items-center justify-between mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <motion.div
              className="p-2 rounded-xl bg-primary/10"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <Music className="h-6 w-6 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold">Music Recommender</h1>
            </div>
          </motion.div>
          <ThemeToggle />
        </motion.div>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Search Section */}
          <Card className="border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search for a Song
              </CardTitle>
              <CardDescription>Enter a song title to find it in our database</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <motion.div className="flex-1" whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                  <Input
                    placeholder="Type a song title (e.g., Blinding Lights, Bohemian Rhapsody...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="h-12 text-base"
                    disabled={isSearching}
                  />
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={searchSongs} disabled={isSearching || !searchQuery.trim()} className="h-12 px-6">
                    {isSearching ? (
                      <motion.div
                        className="rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    {isSearching ? "Searching..." : "Search Song"}
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Song */}
          <AnimatePresence>
            {selectedSong && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="border-0 bg-gradient-to-r from-primary/5 to-primary/10">
                  <CardContent className="p-6">
                    <motion.div
                      className="flex items-center gap-2 mb-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Heart className="h-4 w-4 text-primary" />
                      </motion.div>
                      <span className="text-sm font-medium text-primary">Selected Song</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      <div className="flex items-center gap-4">
                        <motion.div
                          className="p-3 rounded-xl bg-primary/10"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Music className="h-6 w-6 text-primary" />
                        </motion.div>
                        <div>
                          <h3 className="font-semibold text-lg">{selectedSong.name}</h3>
                          <p className="text-muted-foreground">{selectedSong.artists}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="secondary">{selectedSong.genre}</Badge>
                            <span className="text-sm text-muted-foreground">{selectedSong.duration}</span>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">{selectedSong.year}</span>
                          </div>
                        </div>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={getRecommendations}
                          disabled={isLoadingRecommendations}
                          className="h-12 px-6"
                        >
                          {isLoadingRecommendations ? (
                            <motion.div
                              className="rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                          ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                          )}
                          {isLoadingRecommendations ? "Analyzing..." : "Get Recommendations"}
                        </Button>
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Similar Songs (Recommendations) */}
          <AnimatePresence>
            {showRecommendations && recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Card className="border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </motion.div>
                      Similar Songs
                    </CardTitle>
                    <CardDescription>Recommendations based on "{selectedSong?.name}"</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <motion.div
                      className="space-y-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      {recommendations.map((song, index) => (
                        <motion.div
                          key={`${song.name}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ x: 4, transition: { duration: 0.2 } }}
                          className="group flex items-center gap-4 p-4 rounded-lg border-0 bg-muted/30 hover:bg-muted/50 cursor-pointer transition-all duration-200"
                          onClick={() => {
                            setSearchQuery(song.name);
                            setSelectedSong(song);
                            setShowSearchResults(false);
                            setShowRecommendations(false);
                          }}
                        >
                          <motion.div
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                          >
                            {index + 1}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{song.name}</h4>
                            <p className="text-sm text-muted-foreground truncate">{song.artists}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                              <Badge variant="outline" className="text-xs">
                                {song.genre}
                              </Badge>
                            </motion.div>
                            <div className="text-right">
                              <motion.div
                                className="text-xs font-medium text-green-600 dark:text-green-400"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                              >
                                {Math.round(song.similarity * 100)}% match
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

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Alert className="border-destructive/50 text-destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Results */}
          <AnimatePresence>
            {showSearchResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Music className="h-5 w-5 text-blue-500" />
                      Search Results
                    </CardTitle>
                    <CardDescription>
                      {searchResults.length === 1
                        ? "Found 1 matching song"
                        : `Found ${searchResults.length} matching songs`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {searchResults.map((song, index) => (
                        <motion.div
                          key={`${song.name}-${index}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card
                            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                              selectedSong?.name === song.name ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                            }`}
                            onClick={() => handleSongSelect(song)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-base leading-tight truncate">{song.name}</h3>
                                  <p className="text-muted-foreground text-sm truncate">{song.artists}</p>
                                </div>
                                <motion.div
                                  className="ml-3"
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                                    <Play className="h-3 w-3" />
                                  </div>
                                </motion.div>
                              </div>
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="text-xs">
                                  {song.genre}
                                </Badge>
                                <div className="text-xs text-muted-foreground space-x-2">
                                  <span>{song.duration}</span>
                                  <span>•</span>
                                  <span>{song.year}</span>
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
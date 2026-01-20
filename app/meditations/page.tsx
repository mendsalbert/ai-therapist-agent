"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccessibleCard } from "@/components/ui/accessible-card";
import { AccessibleButton } from "@/components/ui/accessible-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Headphones, 
  Play, 
  Pause, 
  Volume2, 
  Clock,
  Crown,
  Search,
  Loader2,
  ListPlus,
  PlayCircle,
  Heart,
  HeartOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { logger } from "@/lib/utils/logger";
import { useAudioPlayer } from "@/lib/contexts/audio-player-context";
import { useSession } from "@/lib/contexts/session-context";
import { toast } from "sonner";
import { PageLoading } from "@/components/ui/page-loading";
import { MeditationsFloatingPlayer } from "@/components/audio/meditations-floating-player";
import { getBackendErrorMessage, isBackendOnline } from "@/lib/utils/backend-wakeup";

interface Meditation {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  audioUrl: string;
  category: string;
  isPremium: boolean;
  tags: string[];
  createdAt: string;
}

export default function MeditationsPage() {
  const { user, isAuthenticated, userTier } = useSession();
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // Debounce search input
  const [filterPremium, setFilterPremium] = useState<boolean | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoriteStatus, setFavoriteStatus] = useState<Record<string, boolean>>({});
  const [favoriteLoading, setFavoriteLoading] = useState<Record<string, boolean>>({});
  const [favoriteMeditations, setFavoriteMeditations] = useState<Meditation[]>([]);
  const [showBackendWarning, setShowBackendWarning] = useState(false);
  
  // Use ONLY the global audio player - no local audio state
  const { 
    play, 
    pause, 
    currentTrack, 
    isPlaying, 
    addToPlaylist, 
    playPlaylist,
    togglePlayPause,
    playNext,
    playPrevious,
    stop,
    seek,
    setVolume,
    volume,
    duration,
    currentTime,
    playlist,
    currentIndex,
    shufflePlaylist,
    savedPlaylists,
    currentPlaylistId,
    loadSavedPlaylists,
    savePlaylistToMongoDB,
    loadPlaylistFromMongoDB
  } = useAudioPlayer() as any; // FIX: add 'as any' to avoid TS error if hook is missing

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const loadMeditations = useCallback(async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);
      if (filterPremium !== null) params.append("isPremium", String(filterPremium));
      params.append("limit", "50");

      // Use the GET route (works on server), not POST
      const res = await fetch(`/api/meditations?${params.toString()}`, { cache: "no-store" });

      if (!res.ok) {
        console.error("Meditations fetch failed:", res.status);
        setMeditations([]);
        return;
      }

      const data = await res.json();

      // Accept various shapes just in case
      const list = Array.isArray(data.meditations)
        ? data.meditations
        : Array.isArray(data.results)
        ? data.results
        : Array.isArray(data.items)
        ? data.items
        : [];

      const normalized = list.map((m: any) => ({
        id: m.id || m._id || "",
        title: m.title || m.name || "",
        description: m.description || "",
        duration: m.duration || 0,
        audioUrl: m.audioUrl || m.audioURL || m.audio || "",
        category: m.category || m.type || "",
        isPremium: Boolean(m.isPremium),
        tags: Array.isArray(m.tags) ? m.tags : [],
        createdAt: m.createdAt || "",
      }));

      logger.debug('Loaded meditations:', normalized);
      
      // Check if any meditations have valid audio URLs
      const validMeditations = normalized.filter((m: Meditation) => m.audioUrl);
      logger.debug(`Meditations with valid audio URLs: ${validMeditations.length} out of ${normalized.length}`);
      if (validMeditations.length > 0) {
        logger.debug('First valid meditation:', validMeditations[0]);
      }

      setMeditations(normalized);
    } catch (e) {
      console.error("Error loading meditations:", e);
      setMeditations([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, filterPremium]);


  useEffect(() => {
    loadMeditations();
  }, [loadMeditations]);

  // Check backend status on mount
  useEffect(() => {
    const checkBackend = () => {
      const backendOffline = !isBackendOnline();
      setShowBackendWarning(backendOffline);
      
      if (backendOffline) {
        toast.info("Server is starting up...", {
          description: "This may take up to a minute. Please wait.",
          duration: 5000,
          id: 'backend-starting'
        });
      }
    };
    
    checkBackend();
    
    // Check again after a delay to see if backend woke up
    const timer = setTimeout(() => {
      checkBackend();
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);

  // Check favorite status for all meditations when they load
  useEffect(() => {
    if (isAuthenticated && meditations.length > 0) {
      meditations.forEach(meditation => {
        checkFavoriteStatus(meditation.id);
      });
    }
  }, [isAuthenticated, meditations]);

  // Check favorite status for favorite meditations when they load
  useEffect(() => {
    if (isAuthenticated && favoriteMeditations.length > 0) {
      favoriteMeditations.forEach(meditation => {
        // Set favorite status to true for favorite meditations
        setFavoriteStatus(prev => ({
          ...prev,
          [meditation.id]: true
        }));
      });
    }
  }, [isAuthenticated, favoriteMeditations]);

  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch('/api/meditations/favorites?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        const favorites = data.favorites || [];
        
        // Convert favorites to meditation format
        const favoriteMeditations = favorites
          .filter((fav: any) => fav.meditationId) // Filter out deleted meditations
          .map((fav: any) => ({
            id: fav.meditationId._id,
            title: fav.meditationId.title,
            description: fav.meditationId.description,
            duration: fav.meditationId.duration,
            audioUrl: fav.meditationId.audioUrl,
            category: fav.meditationId.category,
            isPremium: fav.meditationId.isPremium,
            tags: fav.meditationId.tags || [],
            createdAt: fav.meditationId.createdAt,
          }));

        setFavoriteMeditations(favoriteMeditations);
        logger.debug('Loaded favorite meditations:', favoriteMeditations);
      } else if (response.status === 404 && !isBackendOnline()) {
        // Backend is offline, silently fail - don't show error
        logger.warn('Backend offline, skipping favorites load');
        setFavoriteMeditations([]);
      }
    } catch (error) {
      // Silently handle errors when backend is starting up
      if (!isBackendOnline()) {
        logger.warn('Backend offline, error loading favorites:', error);
      } else {
        console.error('Error loading favorites:', error);
      }
      setFavoriteMeditations([]);
    }
  }, [isAuthenticated]);

  // Load favorites when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated, loadFavorites]);

  const handlePlay = async (meditationId: string) => {
    logger.debug('Play button clicked for meditation:', meditationId);

    const meditation = meditations.find(m => m.id === meditationId);
    if (!meditation) {
      console.error('Meditation not found:', meditationId);
      return;
    }

    logger.debug('Found meditation:', meditation);

    // Check premium access
    if (userTier === "free" && meditation.isPremium) {
      toast.error("This meditation is a premium feature. Upgrade to access advanced meditations.");
      return;
    }

    // Pre-check free-tier weekly meditation limit
    if (userTier === "free") {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        const res = await fetch((process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.BACKEND_API_URL || 'https://hope-backend-2.onrender.com') + '/meditation/sessions?limit=100&page=1', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          const sessionsLast7 = (data.sessions || []).filter((s: any) => new Date(s.completedAt) >= sevenDaysAgo).length;
          if (sessionsLast7 >= 10) {
            toast.error("Weekly meditation limit reached on Free plan. Upgrade to enjoy unlimited listening.");
            return;
          }
        }
      } catch {}
    }

    // Validate audio URL
    if (!meditation.audioUrl) {
      console.error('No audio URL for meditation:', meditation);
      toast.error('Audio file not available');
      return;
    }

    // Convert to the format expected by the global audio player
    const meditationForPlayer = {
      _id: meditation.id,
      title: meditation.title,
      audioUrl: meditation.audioUrl,
      category: meditation.category
    };

    logger.debug('Calling play with:', meditationForPlayer);

    try {
      play(meditationForPlayer);
    } catch (error) {
      console.error('Error calling play:', error);
      toast.error('Failed to start playback');
    }
  };

  const handleAddToPlaylist = (meditation: Meditation) => {
    const meditationForPlayer = {
      _id: meditation.id,
      title: meditation.title,
      audioUrl: meditation.audioUrl,
      category: meditation.category
    };
    
    addToPlaylist(meditationForPlayer);
    toast.success(`Added "${meditation.title}" to playlist`);
  };

  const toggleFavorite = async (meditationId: string) => {
    console.log('Toggle favorite clicked for:', meditationId);
    console.log('Meditation ID type:', typeof meditationId);
    console.log('Meditation ID length:', meditationId.length);
    
    if (!isAuthenticated) {
      toast.error("Please log in to add favorites");
      return;
    }

    const isCurrentlyFavorited = favoriteStatus[meditationId];
    const newFavoriteStatus = !isCurrentlyFavorited;
    
    // Optimistic UI update - update immediately for instant feedback
    setFavoriteStatus(prev => ({
      ...prev,
      [meditationId]: newFavoriteStatus
    }));
    
    console.log('Optimistically updated favorite status to:', newFavoriteStatus);
    setFavoriteLoading(prev => ({ ...prev, [meditationId]: true }));

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      console.log('Token exists:', !!token);
      console.log('Making request to:', `/api/meditations/${meditationId}/favorite`);
      console.log('Method:', isCurrentlyFavorited ? 'DELETE' : 'POST');

      const response = await fetch(`/api/meditations/${meditationId}/favorite`, {
        method: isCurrentlyFavorited ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        console.log('Success! Favorite status confirmed');
        
        // Always refresh favorites list to keep it in sync
        loadFavorites();
        
        toast.success(
          isCurrentlyFavorited 
            ? "Removed from favorites" 
            : "Added to favorites"
        );
      } else {
        // Roll back the optimistic update if API failed
        console.error('Response not ok, rolling back:', data);
        setFavoriteStatus(prev => ({
          ...prev,
          [meditationId]: isCurrentlyFavorited // Revert to original state
        }));
        
        // Show appropriate error message based on backend status
        const errorMessage = response.status === 404 && !isBackendOnline()
          ? getBackendErrorMessage()
          : (data.error || "Failed to update favorite status");
        toast.error(errorMessage);
      }
    } catch (error) {
      // Roll back the optimistic update on error
      console.error('Error toggling favorite, rolling back:', error);
      setFavoriteStatus(prev => ({
        ...prev,
        [meditationId]: isCurrentlyFavorited // Revert to original state
      }));
      
      // Show appropriate error message based on backend status
      const errorMessage = getBackendErrorMessage();
      toast.error(errorMessage, {
        duration: 5000,
        description: !isBackendOnline() ? "Favorites will work once the server is ready." : undefined
      });
    } finally {
      console.log('Setting loading to false for:', meditationId);
      setFavoriteLoading(prev => ({ ...prev, [meditationId]: false }));
    }
  };

  const checkFavoriteStatus = async (meditationId: string) => {
    if (!isAuthenticated) return;

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`/api/meditations/${meditationId}/favorite-status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFavoriteStatus(prev => ({
          ...prev,
          [meditationId]: data.isFavorited
        }));
      } else if (response.status === 404 && !isBackendOnline()) {
        // Backend is offline, silently skip status check
        logger.warn('Backend offline, skipping favorite status check for:', meditationId);
      }
    } catch (error) {
      // Silently handle errors when backend is starting up
      if (!isBackendOnline()) {
        logger.warn('Backend offline, error checking favorite status:', error);
      } else {
        console.error('Error checking favorite status:', error);
      }
    }
  };

  // Memoize filtered meditations for performance
  const filteredMeditations = useMemo(() => {
    const sourceMeditations = showFavorites ? favoriteMeditations : meditations;
    
    return sourceMeditations.filter(meditation => {
      const lowerSearchQuery = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        meditation.title.toLowerCase().includes(lowerSearchQuery) ||
        meditation.description.toLowerCase().includes(lowerSearchQuery) ||
        meditation.category.toLowerCase().includes(lowerSearchQuery) ||
        meditation.tags.some((tag: string) => tag.toLowerCase().includes(lowerSearchQuery));

      const matchesPremium = filterPremium === null || meditation.isPremium === filterPremium;

      return matchesSearch && matchesPremium;
    });
  }, [showFavorites, favoriteMeditations, meditations, searchQuery, filterPremium]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by debounced query, no need to call loadMeditations here
    // loadMeditations will be called automatically when debouncedSearchQuery changes
  };

  const handlePlayAll = useCallback(() => {
    if (filteredMeditations.length === 0) {
      toast.error('No meditations to play');
      return;
    }

    // Filter out premium meditations if user is on free tier
    const playableMeditations = filteredMeditations.filter((meditation: Meditation) => 
      !meditation.isPremium || userTier === "premium"
    );

    if (playableMeditations.length === 0) {
      toast.error('No playable meditations found');
      return;
    }

    // Convert to the format expected by the audio player
    const meditationsForPlayer = playableMeditations.map(meditation => ({
      _id: meditation.id,
      title: meditation.title,
      audioUrl: meditation.audioUrl,
      category: meditation.category
    }));

    // Play the playlist starting from the first track
    playPlaylist(meditationsForPlayer, 0);
    toast.success(`Playing ${meditationsForPlayer.length} meditations`);
  }, [filteredMeditations, userTier, playPlaylist]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col xs:flex-row items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            {showFavorites && (
              <Heart className="w-8 h-8 text-red-500 fill-current" />
            )}
            <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900">
              {showFavorites ? "My Favorite Meditations" : "Meditation Library"}
            </h1>
            {showFavorites && (
              <Heart className="w-8 h-8 text-red-500 fill-current" />
            )}
          </div>
          <p className="text-base xs:text-lg text-gray-600 max-w-xs xs:max-w-2xl mx-auto">
            {showFavorites 
              ? "Your personal collection of meditations that bring you peace and mindfulness."
              : "Discover guided meditations to help you find peace, reduce stress, and improve your well-being."
            }
          </p>
          {showFavorites && favoriteMeditations.length > 0 && (
            <div className="mt-4">
              <Badge variant="default" className="bg-red-500 hover:bg-red-600 text-white">
                <Heart className="w-3 h-3 mr-1 fill-current" />
                {favoriteMeditations.length} Favorite{favoriteMeditations.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </div>

        {/* Backend Status Warning */}
        {showBackendWarning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Server is starting up...
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  This may take up to a minute. Some features like favorites may be temporarily unavailable.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search and Filter */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="p-2 sm:p-6">
            <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search meditations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 transition-all duration-200"
                />
              </div>
              <div className="flex flex-row flex-wrap gap-2">
                <Button
                  type="button"
                  variant={!showFavorites ? "default" : "outline"}
                  onClick={() => setShowFavorites(false)}
                  size="sm"
                >
                  All
                </Button>
                {isAuthenticated && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowFavorites(!showFavorites);
                      // Refresh favorites when switching to favorites view
                      if (!showFavorites) {
                        loadFavorites();
                      }
                    }}
                    size="sm"
                    className={`gap-2 transition-colors ${
                      showFavorites 
                        ? 'text-red-500 border-red-500 hover:bg-red-50' 
                        : 'text-gray-500 border-gray-300 hover:text-red-500 hover:border-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${showFavorites ? 'fill-current' : ''}`} />
                    Favorites ({favoriteMeditations.length})
                  </Button>
                )}
                <Button
                  type="button"
                  variant={filterPremium === null ? "default" : "outline"}
                  onClick={() => setFilterPremium(null)}
                  size="sm"
                >
                  All Types
                </Button>
                <Button
                  type="button"
                  variant={filterPremium === false ? "default" : "outline"}
                  onClick={() => setFilterPremium(false)}
                  size="sm"
                >
                  Free
                </Button>
                <Button
                  type="button"
                  variant={filterPremium === true ? "default" : "outline"}
                  onClick={() => setFilterPremium(true)}
                  size="sm"
                >
                  Premium
                </Button>
              </div>
              <Button type="submit" size="sm">
                Search
              </Button>
            </form>
            
            {/* Play All Button */}
            {!isLoading && filteredMeditations.length > 0 && (
              <div className="mt-4 flex justify-center">
                <Button
                  onClick={handlePlayAll}
                  variant="outline"
                  className="gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  Play All ({filteredMeditations.filter(m => !m.isPremium || userTier === "premium").length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <PageLoading 
            message="Loading meditations..." 
            showSkeleton={true}
          />
        )}

        {/* Meditation Cards */}
        {!isLoading && filteredMeditations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <AnimatePresence>
              {filteredMeditations.map((meditation, index) => (
                <motion.div
                  key={meditation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ 
                    duration: 0.2, // Faster animation
                    delay: index * 0.02, // Staggered but fast
                    ease: [0.4, 0, 0.2, 1] // Smooth easing
                  }}
                >
                  <AccessibleCard
                    title={meditation.title}
                    description={meditation.description}
                    className="h-full hover:shadow-lg transition-shadow duration-300"
                    ariaLabel={`Meditation: ${meditation.title}`}
                    ariaDescribedBy={`meditation-${meditation.id}-description`}
                    interactive={false}
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-2 sm:gap-0">
                      <div className="flex items-center gap-2">
                        <Headphones className="w-5 h-5 text-primary" aria-hidden="true" />
                        <h3 className="text-lg font-semibold">{meditation.title}</h3>
                      </div>
                      {meditation.isPremium && (
                        <Crown className="w-5 h-5 text-amber-500" aria-label="Premium meditation" />
                      )}
                    </div>
                    <div className="space-y-4">
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {meditation.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {meditation.duration} min
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {meditation.category}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {/* Regular tags */}
                        {meditation.tags.length > 0 && (
                          <>
                            {meditation.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {meditation.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{meditation.tags.length - 3}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <AccessibleButton
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            logger.debug('Play button clicked for:', meditation.id);
                            handlePlay(meditation.id);
                          }}
                          className="flex-1"
                          disabled={meditation.isPremium && userTier === "free"}
                          ariaLabel={
                            currentTrack?._id === meditation.id
                              ? isPlaying
                                ? "Pause meditation"
                                : "Resume meditation"
                              : "Play meditation"
                          }
                        >
                          {currentTrack?._id === meditation.id ? (
                            isPlaying ? (
                              <>
                                <Pause className="w-4 h-4 mr-2" aria-hidden="true" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" aria-hidden="true" />
                                Resume
                              </>
                            )
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" aria-hidden="true" />
                              Play
                            </>
                          )}
                        </AccessibleButton>
                        <AccessibleButton
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddToPlaylist(meditation)}
                          className="gap-2"
                          ariaLabel="Add meditation to playlist"
                        >
                          <ListPlus className="w-4 h-4" aria-hidden="true" />
                          Add
                        </AccessibleButton>
                        <AccessibleButton
                          size="sm"
                          variant="outline"
                          onClick={() => toggleFavorite(meditation.id)}
                          disabled={favoriteLoading[meditation.id]}
                          className={`gap-2 transition-colors ${
                            favoriteStatus[meditation.id] 
                              ? 'text-red-500 border-red-500 hover:bg-red-50' 
                              : 'text-gray-500 border-gray-300 hover:text-red-500 hover:border-red-500'
                          }`}
                          ariaLabel={favoriteStatus[meditation.id] ? "Remove from favorites" : "Add to favorites"}
                          loading={favoriteLoading[meditation.id]}
                          loadingText="Updating..."
                        >
                          {favoriteLoading[meditation.id] ? (
                            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                          ) : (
                            <Heart className={`w-4 h-4 ${favoriteStatus[meditation.id] ? 'fill-current' : ''}`} aria-hidden="true" />
                          )}
                        </AccessibleButton>
                      </div>
                    </div>
                  </AccessibleCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredMeditations.length === 0 && (
          <div className="text-center py-12">
            {showFavorites ? (
              <>
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No favorite meditations yet</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery ? "No favorites match your search" : "Start exploring meditations and add them to your favorites"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowFavorites(false)}>
                    Browse All Meditations
                  </Button>
                )}
              </>
            ) : (
              <>
                <Headphones className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No meditations found</h3>
                <p className="text-gray-500">
                  {searchQuery ? "Try adjusting your search terms" : "Check back later for new meditations"}
                </p>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Floating Audio Player - Only visible on meditations page */}
      <MeditationsFloatingPlayer />
    </div>
  );
}


"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  PlayCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/hooks/use-session";
import { toast } from "sonner";
import { useAudioPlayer } from "@/lib/contexts/audio-player-context";

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
  const { user, isAuthenticated } = useSession();
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPremium, setFilterPremium] = useState<boolean | null>(null);
  const [userTier, setUserTier] = useState<"free" | "premium">("free");
  
  // Audio element ref
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleError = (e: any) => {
      console.error('Audio error:', e);
      toast.error('Failed to load audio file');
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((error) => {
        console.error('Play failed:', error);
        toast.error('Failed to play audio');
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Fetch meditations from database - memoized with useCallback
  const loadMeditations = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filterPremium !== null) params.append("isPremium", filterPremium.toString());
      
      const response = await fetch(`/api/meditations/search?${params}`);
      const result = await response.json();
      
      if (response.ok && result.success) {
        setMeditations(result.meditations);
      } else {
        toast.error('Failed to load meditations');
        setMeditations([]);
      }
    } catch (error) {
      console.error('Error loading meditations:', error);
      toast.error('Failed to load meditations');
      setMeditations([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filterPremium]);

  // Load meditations on component mount and when search changes
  useEffect(() => {
    loadMeditations();
  }, [loadMeditations]);

  // Add this useEffect to detect user tier
  useEffect(() => {
    const checkUserTier = async () => {
      if (isAuthenticated && user) {
        try {
          const token = localStorage.getItem('token') || localStorage.getItem('authToken');
          const response = await fetch('/api/user/tier', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setUserTier(data.tier || 'free');
          }
        } catch (error) {
          console.error('Error checking user tier:', error);
          setUserTier('free');
        }
      }
    };
    
    checkUserTier();
  }, [isAuthenticated, user]);

  const handlePlay = async (meditationId: string) => {
    const meditation = meditations.find(m => m.id === meditationId);
    
    if (!meditation) {
      toast.error('Meditation not found');
      return;
    }

    // Check if meditation is premium-only
    if (meditation.isPremium && userTier === "free") {
      toast.error("This meditation is a premium feature. Upgrade to access advanced meditations.");
      return;
    }

    // Check if audio URL is valid
    if (!meditation.audioUrl) {
      toast.error('Audio file not available');
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack === meditationId) {
      // Same track - toggle play/pause
      setIsPlaying(!isPlaying);
    } else {
      // New track - load and play
      setCurrentTrack(meditationId);
      audio.src = meditation.audioUrl;
      audio.load();
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadMeditations();
  };

  const { play, pause, currentTrack: globalCurrentTrack, isPlaying: globalIsPlaying, addToPlaylist, playPlaylist } = useAudioPlayer();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Meditation Library
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover guided meditations to help you find peace, reduce stress, and improve your well-being.
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search meditations by title, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={filterPremium === null ? "default" : "outline"}
                  onClick={() => setFilterPremium(null)}
                >
                  All
                </Button>
                <Button
                  type="button"
                  variant={filterPremium === false ? "default" : "outline"}
                  onClick={() => setFilterPremium(false)}
                >
                  Free
                </Button>
                <Button
                  type="button"
                  variant={filterPremium === true ? "default" : "outline"}
                  onClick={() => setFilterPremium(true)}
                >
                  Premium
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Loading meditations...</span>
          </div>
        )}

        {/* Meditations Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {meditations.map((meditation) => (
                <motion.div
                  key={meditation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Headphones className="w-5 h-5 text-primary" />
                          <CardTitle className="text-lg">{meditation.title}</CardTitle>
                        </div>
                        {meditation.isPremium && (
                          <Crown className="w-5 h-5 text-amber-500" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {meditation.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {meditation.duration} min
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {meditation.category}
                        </Badge>
                      </div>

                      {meditation.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
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
                        </div>
                      )}

                      <Button
                        onClick={() => handlePlay(meditation.id)}
                        className="w-full"
                        disabled={meditation.isPremium && userTier === "free"}
                      >
                        {currentTrack === meditation.id ? (
                          isPlaying ? (
                            <>
                              <Pause className="w-4 h-4 mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Resume
                            </>
                          )
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Play
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToPlaylist({
                            _id: meditation.id,
                            title: meditation.title,
                            audioUrl: meditation.audioUrl,
                            category: meditation.category
                          });
                        }}
                        className="gap-2"
                      >
                        <ListPlus className="w-4 h-4" />
                        Add
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && meditations.length === 0 && (
          <div className="text-center py-12">
            <Headphones className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No meditations found
            </h3>
            <p className="text-gray-500">
              {searchQuery || filterPremium !== null
                ? "Try adjusting your search or filters"
                : "No meditations have been uploaded yet"}
            </p>
          </div>
        )}

        {/* Enhanced Audio Player */}
        {currentTrack && (
          <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Track Info */}
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex-shrink-0"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {meditations.find(m => m.id === currentTrack)?.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {meditations.find(m => m.id === currentTrack)?.category}
                    </p>
                  </div>
                  <Volume2 className="w-4 h-4 text-gray-400" />
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}



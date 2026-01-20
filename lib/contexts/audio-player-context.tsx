"use client";

import { 
  createContext, 
  useContext, 
  useState, 
  useRef, 
  useEffect, 
  ReactNode, 
  useCallback 
} from 'react';
import { toast } from 'sonner';
import { playlistAPI } from '@/lib/api/playlist';
import { GlobalAudioPlayer } from "@/components/audio/global-audio-player";

interface Meditation {
  _id: string;
  title: string;
  audioUrl: string;
  category: string;
}

type RepeatMode = 'none' | 'single' | 'all';

interface AudioPlayerContextType {
  currentTrack: Meditation | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackSpeed: number;
  repeatMode: RepeatMode;
  sleepTimer: number | null; // minutes remaining, null if disabled
  playlist: Meditation[];
  currentIndex: number;
  play: (meditation: Meditation) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setRepeatMode: (mode: RepeatMode) => void;
  setSleepTimer: (minutes: number | null) => void;
  togglePlayPause: () => void;
  // Playlist functions
  addToPlaylist: (meditation: Meditation) => void;
  removeFromPlaylist: (meditationId: string) => void;
  clearPlaylist: () => void;
  playNext: () => void;
  playPrevious: () => void;
  playPlaylist: (meditations: Meditation[], startIndex?: number) => void;
  shufflePlaylist: () => void;
  savedPlaylists: any[];
  currentPlaylistId: string | null;
  loadSavedPlaylists: () => Promise<void>;
  savePlaylistToMongoDB: (name: string, description?: string, isPublic?: boolean) => Promise<any | undefined>;
  loadPlaylistFromMongoDB: (playlistId: string) => Promise<void>;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Meditation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [playbackSpeed, setPlaybackSpeedState] = useState(1.0);
  const [repeatMode, setRepeatModeState] = useState<RepeatMode>('none');
  const [sleepTimer, setSleepTimerState] = useState<number | null>(null);
  const [playlist, setPlaylist] = useState<Meditation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Add state for saved playlists
  const [savedPlaylists, setSavedPlaylists] = useState<any[]>([]);
  const [currentPlaylistId, setCurrentPlaylistId] = useState<string | null>(null);

  // Load saved playlists from MongoDB
  const loadSavedPlaylists = useCallback(async () => {
    try {
      const response = await playlistAPI.getUserPlaylists();
      if (response.success) {
        setSavedPlaylists(response.data?.playlists || []);
      } else {
        console.warn('Failed to load playlists:', response.error);
        // Don't throw error, just log warning to prevent frontend fallback
      }
    } catch (error) {
      console.error('Failed to load playlists:', error);
      // Don't throw error, just log to prevent frontend fallback
    }
  }, []);

  // Save current queue as named playlist
  const savePlaylistToMongoDB = async (name: string, description?: string, isPublic: boolean = false) => {
    try {
      const response = await playlistAPI.createPlaylist({
        name,
        description,
        meditations: playlist.map(m => m._id),
        isPublic,
        tags: [],
      });

      if (response.success) {
        toast.success(`Playlist "${name}" saved!`);
        await loadSavedPlaylists();
        return response.data?.playlist;
      } else {
        console.warn('Failed to save playlist:', response.error);
        toast.error('Failed to save playlist');
        return undefined;
      }
    } catch (error) {
      console.error('Error saving playlist:', error);
      toast.error('Failed to save playlist');
      return undefined;
    }
  };

  // Load and play saved playlist
  const loadPlaylistFromMongoDB = async (playlistId: string) => {
    try {
      const response = await playlistAPI.getPlaylist(playlistId);
      if (response.success && response.data?.playlist) {
        const pl = response.data.playlist;
        const meditations = pl.meditations.map((m: any) => ({
          _id: m._id,
          title: m.title,
          audioUrl: m.audioUrl,
          category: m.category,
        }));
        
        setPlaylist(meditations);
        setCurrentPlaylistId(playlistId);
        if (meditations.length > 0) {
          play(meditations[0]);
          setCurrentIndex(0);
        }
        toast.success(`Playing "${pl.name}"`);
      } else {
        console.warn('Failed to load playlist:', response.error);
        toast.error('Failed to load playlist');
      }
    } catch (error) {
      console.error('Error loading playlist:', error);
      toast.error('Failed to load playlist');
    }
  };

  // Load playlist from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('audioPlaylist');
      if (saved) {
        try {
          setPlaylist(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load playlist:', e);
        }
      }
    }
  }, []);

  // Save playlist to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && playlist.length > 0) {
      localStorage.setItem('audioPlaylist', JSON.stringify(playlist));
    }
  }, [playlist]);

  // Define play function first
  const play = useCallback((meditation: Meditation) => {
    console.log('Play function called with:', meditation);
    
    if (typeof window === 'undefined' || !audioRef.current) {
      console.error('Audio not available - window:', typeof window, 'audioRef:', audioRef.current);
      return;
    }

    // Check if audio URL is valid
    if (!meditation.audioUrl) {
      console.error('No audio URL provided:', meditation);
      toast.error('Audio file not available');
      return;
    }

    console.log('Playing meditation:', meditation.title, meditation.audioUrl);

    if (currentTrack?._id === meditation._id && audioRef.current.src) {
      console.log('Resuming current track');
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          console.log('Resume successful');
        })
        .catch((error) => {
          console.error('Resume failed:', error);
          toast.error('Failed to resume playback');
        });
      return;
    }

    // Set loading state
    setIsPlaying(false);
    setIsLoading(true);
    
    console.log('Loading new track:', meditation.audioUrl);
    audioRef.current.src = meditation.audioUrl;
    audioRef.current.load();
    
    // Try to play immediately, then handle events
    const attemptPlay = () => {
      if (!audioRef.current) return;
      
      audioRef.current.play()
        .then(() => {
          setCurrentTrack(meditation);
          setIsPlaying(true);
          setIsLoading(false);
          console.log('Playback started successfully');
          
          // Update current index if track is in playlist
          const index = playlist.findIndex(m => m._id === meditation._id);
          if (index !== -1) {
            setCurrentIndex(index);
          }
        })
        .catch((error) => {
          console.error('Initial play failed:', error);
          // Wait for audio to be ready
          const handleCanPlay = () => {
            if (audioRef.current) {
              audioRef.current.removeEventListener('canplay', handleCanPlay);
              console.log('Audio ready, retrying playback');
              audioRef.current.play()
                .then(() => {
                  setCurrentTrack(meditation);
                  setIsPlaying(true);
                  setIsLoading(false);
                  console.log('Playback started successfully after retry');
                  
                  // Update current index if track is in playlist
                  const index = playlist.findIndex(m => m._id === meditation._id);
                  if (index !== -1) {
                    setCurrentIndex(index);
                  }
                })
                .catch((retryError) => {
                  console.error('Retry play failed:', retryError);
                  setIsPlaying(false);
                  setIsLoading(false);
                  toast.error('Failed to play meditation. Please check your internet connection.');
                });
            }
          };

          if (audioRef.current) {
            audioRef.current.addEventListener('canplay', handleCanPlay);
          }
          
          // Fallback timeout in case canplay doesn't fire
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.removeEventListener('canplay', handleCanPlay);
              setIsLoading(false);
            }
          }, 5000);
        });
    };

    attemptPlay();
  }, [currentTrack, playlist]);

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resume = () => {
    if (audioRef.current && currentTrack) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((error) => {
          console.error('Resume failed:', error);
          toast.error('Failed to resume playback');
        });
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsLoading(false);
      setCurrentTime(0);
      setCurrentTrack(null);
      setCurrentIndex(-1);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      console.log('Seeked to:', time);
    }
  };

  const setVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    setVolumeState(clampedVolume);
  };

  const setPlaybackSpeed = (speed: number) => {
    const validSpeeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const clampedSpeed = validSpeeds.reduce((prev, curr) => 
      Math.abs(curr - speed) < Math.abs(prev - speed) ? curr : prev
    );
    
    if (audioRef.current) {
      audioRef.current.playbackRate = clampedSpeed;
    }
    setPlaybackSpeedState(clampedSpeed);
    toast.info(`Playback speed: ${clampedSpeed}x`);
  };

  const setRepeatMode = (mode: RepeatMode) => {
    setRepeatModeState(mode);
    const modeLabels = { none: 'Off', single: 'One', all: 'All' };
    toast.info(`Repeat: ${modeLabels[mode]}`);
  };

  const setSleepTimer = (minutes: number | null) => {
    // Clear existing timer
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    
    setSleepTimerState(minutes);
    
    if (minutes !== null && minutes > 0) {
      const milliseconds = minutes * 60 * 1000;
      sleepTimerRef.current = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
        setSleepTimerState(null);
        toast.success('Sleep timer ended - meditation paused');
      }, milliseconds);
      
      toast.success(`Sleep timer set for ${minutes} minutes`);
    } else {
      toast.info('Sleep timer disabled');
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else if (currentTrack) {
      resume();
    }
  };

  // Define playNext and playPrevious functions
  const playNext = useCallback(() => {
    if (playlist.length === 0) return;
    
    const nextIndex = currentIndex + 1;
    if (nextIndex < playlist.length) {
      setCurrentIndex(nextIndex);
      play(playlist[nextIndex]);
    } else {
      toast.info('End of playlist');
      stop();
    }
  }, [playlist, currentIndex, play, stop]);

  const playPrevious = useCallback(() => {
    if (playlist.length === 0) return;
    
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentIndex(prevIndex);
      play(playlist[prevIndex]);
    } else {
      toast.info('Start of playlist');
    }
  }, [playlist, currentIndex, play]);

  // Playlist functions
  const addToPlaylist = (meditation: Meditation) => {
    setPlaylist(prev => {
      if (prev.find(m => m._id === meditation._id)) {
        toast.info('Already in playlist');
        return prev;
      }
      toast.success(`Added "${meditation.title}" to playlist`);
      return [...prev, meditation];
    });
  };

  const removeFromPlaylist = (meditationId: string) => {
    setPlaylist(prev => {
      const newPlaylist = prev.filter(m => m._id !== meditationId);
      // If we removed the current track, stop playback
      if (currentTrack?._id === meditationId) {
        stop();
      }
      // Update current index if needed
      const newIndex = newPlaylist.findIndex(m => m._id === currentTrack?._id);
      if (newIndex !== -1) {
        setCurrentIndex(newIndex);
      } else if (currentIndex >= newPlaylist.length) {
        setCurrentIndex(Math.max(0, newPlaylist.length - 1));
      }
      return newPlaylist;
    });
    toast.success('Removed from playlist');
  };

  const clearPlaylist = () => {
    setPlaylist([]);
    setCurrentIndex(-1);
    stop(); // Stop current playback
    if (typeof window !== 'undefined') {
      localStorage.removeItem('audioPlaylist');
    }
    toast.success('Playlist cleared');
  };

  const playPlaylist = (meditations: Meditation[], startIndex: number = 0) => {
    if (meditations.length === 0) {
      toast.error('Playlist is empty');
      return;
    }
    
    setPlaylist(meditations);
    setCurrentIndex(startIndex);
    play(meditations[startIndex]);
    toast.success(`Playing ${meditations.length} meditations`);
  };

  const shufflePlaylist = () => {
    setPlaylist(prev => {
      const shuffled = [...prev].sort(() => Math.random() - 0.5);
      setCurrentIndex(0); // Reset to first track
      toast.success('Playlist shuffled');
      return shuffled;
    });
  };

  // Set up audio element and event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    audioRef.current.volume = volume;
    audioRef.current.preload = 'metadata';
    audioRef.current.crossOrigin = 'anonymous';

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (audio && !isNaN(audio.currentTime)) {
        setCurrentTime(audio.currentTime);
        console.log('Time update:', audio.currentTime, 'Duration:', audio.duration);
      }
    };
    
    const handleDurationChange = () => {
      if (audio && !isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
        console.log('Duration changed to:', audio.duration);
      }
    };
    
    const handleLoadedMetadata = () => {
      if (audio && !isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
        console.log('Metadata loaded, duration:', audio.duration);
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      
      // Handle repeat mode
      if (repeatMode === 'single' && currentTrack) {
        // Repeat current track
        audio.currentTime = 0;
        audio.play().catch(console.error);
        setIsPlaying(true);
      } else if (repeatMode === 'all' && playlist.length > 0) {
        // Play next or loop to first
        const nextIndex = (currentIndex + 1) % playlist.length;
        setCurrentIndex(nextIndex);
        play(playlist[nextIndex]);
      } else if (playlist.length > 0 && currentIndex < playlist.length - 1) {
        // Auto-play next in playlist if available
        playNext();
      }
    };
    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
      setIsLoading(false);
      const error = e.target as HTMLAudioElement;
      let errorMessage = 'Failed to load audio file';
      
      if (error.error) {
        switch (error.error.code) {
          case 1: // MEDIA_ERR_ABORTED
            errorMessage = 'Audio playback was aborted';
            break;
          case 2: // MEDIA_ERR_NETWORK
            errorMessage = 'Network error while loading audio';
            break;
          case 3: // MEDIA_ERR_DECODE
            errorMessage = 'Audio format not supported';
            break;
          case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
            errorMessage = 'Audio source not supported';
            break;
          default:
            errorMessage = 'Unknown audio error occurred';
        }
      }
      
      toast.error(errorMessage);
    };

    // Set playback speed
    audio.playbackRate = playbackSpeed;
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      // Don't pause audio on cleanup - let it continue playing
    };
  }, [playlist, currentIndex, playNext, repeatMode, currentTrack, play, playbackSpeed]);
  
  // Cleanup sleep timer on unmount
  useEffect(() => {
    return () => {
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
      }
    };
  }, []);

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isLoading,
        currentTime,
        duration,
        volume,
        playbackSpeed,
        repeatMode,
        sleepTimer,
        playlist,
        currentIndex,
        play,
        pause,
        resume,
        stop,
        seek,
        setVolume,
        setPlaybackSpeed,
        setRepeatMode,
        setSleepTimer,
        togglePlayPause,
        addToPlaylist,
        removeFromPlaylist,
        clearPlaylist,
        playNext,
        playPrevious,
        playPlaylist,
        shufflePlaylist,
        savedPlaylists,
        currentPlaylistId,
        loadSavedPlaylists,
        savePlaylistToMongoDB,
        loadPlaylistFromMongoDB,
      }}
    >
      {children}
      <GlobalAudioPlayer />
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return context;
}

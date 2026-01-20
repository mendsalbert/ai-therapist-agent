"use client";

import { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { toast } from 'sonner';
import { playlistAPI } from '@/lib/api/playlist';
import { GlobalAudioPlayer } from "@/components/audio/global-audio-player";

interface Meditation {
  _id: string;
  title: string;
  audioUrl: string;
  category: string;
}

interface AudioPlayerContextType {
  currentTrack: Meditation | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playlist: Meditation[];
  currentIndex: number;
  play: (meditation: Meditation) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [playlist, setPlaylist] = useState<Meditation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Add state for saved playlists
  const [savedPlaylists, setSavedPlaylists] = useState<any[]>([]);
  const [currentPlaylistId, setCurrentPlaylistId] = useState<string | null>(null);

  // Load saved playlists from MongoDB
  const loadSavedPlaylists = useCallback(async () => {
    try {
      const response = await playlistAPI.getUserPlaylists();
      if (response.success) {
        setSavedPlaylists(response.data?.playlists || []);
      }
    } catch (error) {
      console.error('Failed to load playlists:', error);
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
        toast.error('Failed to save playlist');
      }
    } catch (error) {
      console.error('Error saving playlist:', error);
      toast.error('Failed to save playlist');
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

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      // Auto-play next track in playlist
      if (playlist.length > 0 && currentIndex < playlist.length - 1) {
        playNext();
      }
    };
    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
      toast.error('Failed to load audio file');
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
      audio.pause();
    };
  }, [playlist, currentIndex]);

  const play = useCallback((meditation: Meditation) => {
    if (!audioRef.current) return;

    if (currentTrack?._id === meditation._id && audioRef.current.src) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    audioRef.current.src = meditation.audioUrl;
    audioRef.current.load();
    audioRef.current.play()
      .then(() => {
        setCurrentTrack(meditation);
        setIsPlaying(true);
        
        // Update current index if track is in playlist
        const index = playlist.findIndex(m => m._id === meditation._id);
        if (index !== -1) {
          setCurrentIndex(index);
        }
      })
      .catch((error) => {
        console.error('Play failed:', error);
        setIsPlaying(false);
        toast.error('Failed to play meditation');
      });
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
      setCurrentTime(0);
      setCurrentTrack(null);
      setCurrentIndex(-1);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    setVolumeState(clampedVolume);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else if (currentTrack) {
      resume();
    }
  };

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

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        playlist,
        currentIndex,
        play,
        pause,
        resume,
        stop,
        seek,
        setVolume,
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

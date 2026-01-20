"use client";

import { useAudioPlayer } from "@/lib/contexts/audio-player-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  X, 
  Volume2, 
  VolumeX, 
  SkipForward, 
  SkipBack,
  List,
  Shuffle,
  Loader2,
  Gauge,
  Repeat,
  Repeat1,
  Moon,
  Timer
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function MeditationsFloatingPlayer() {
  const { 
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
    togglePlayPause, 
    stop, 
    seek,
    setVolume,
    setPlaybackSpeed,
    setRepeatMode,
    setSleepTimer,
    playNext,
    playPrevious,
    removeFromPlaylist,
    clearPlaylist,
    shufflePlaylist,
    play
  } = useAudioPlayer();

  const [showVolume, setShowVolume] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);
  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (e.key) {
        case ' ': // Spacebar - play/pause
          e.preventDefault();
          if (currentTrack) togglePlayPause();
          break;
        case 'ArrowLeft': // Left arrow - rewind 10s
          e.preventDefault();
          if (currentTrack) seek(Math.max(0, currentTime - 10));
          break;
        case 'ArrowRight': // Right arrow - forward 10s
          e.preventDefault();
          if (currentTrack) seek(Math.min(duration, currentTime + 10));
          break;
        case 'ArrowUp': // Up arrow - volume up
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown': // Down arrow - volume down
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case 'n': // N - next track
          e.preventDefault();
          if (playlist.length > 0) playNext();
          break;
        case 'p': // P - previous track
          e.preventDefault();
          if (playlist.length > 0) playPrevious();
          break;
        case 'r': // R - toggle repeat
          e.preventDefault();
          const modes: ('none' | 'single' | 'all')[] = ['none', 'single', 'all'];
          const currentModeIndex = modes.indexOf(repeatMode);
          setRepeatMode(modes[(currentModeIndex + 1) % modes.length]);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentTrack, togglePlayPause, seek, currentTime, duration, volume, setVolume, playlist, playNext, playPrevious, repeatMode, setRepeatMode]);

  // Hide player when navigating away from meditations page
  useEffect(() => {
    if (pathname !== '/meditations') {
      setIsVisible(false);
    } else if (currentTrack) {
      setIsVisible(true);
    }
  }, [pathname, currentTrack]);

  // Show player when track starts playing on meditations page
  useEffect(() => {
    if (currentTrack && pathname === '/meditations') {
      setIsVisible(true);
    }
  }, [currentTrack, pathname]);

  if (!currentTrack || !isVisible) return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 && isFinite(duration) ? (currentTime / duration) * 100 : 0;
  
  console.log('Floating player progress:', { currentTime, duration, progress });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
      >
        <Card className="bg-background/95 backdrop-blur-lg border-primary/20 shadow-2xl">
          <div className="p-4 space-y-3">
            {/* Keyboard Shortcuts Hint (only show once) */}
            {currentTrack && (
              <div className="text-[10px] text-muted-foreground text-center opacity-60">
                Press <kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">Space</kbd> to play/pause • 
                <kbd className="px-1 py-0.5 bg-muted rounded text-[9px] ml-1">←</kbd>/<kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">→</kbd> to seek • 
                <kbd className="px-1 py-0.5 bg-muted rounded text-[9px] ml-1">R</kbd> to repeat
              </div>
            )}
            {/* Main Player */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">🎵</span>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{currentTrack.title}</h4>
                <p className="text-xs text-muted-foreground truncate">{currentTrack.category}</p>
                {playlist.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {currentIndex + 1} / {playlist.length}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                {/* Previous */}
                {playlist.length > 0 && (
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={playPrevious} 
                    disabled={currentIndex <= 0}
                    className="h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                )}

                {/* Play/Pause */}
                <Button 
                  size="icon" 
                  onClick={togglePlayPause} 
                  className="h-9 w-9 sm:h-10 sm:w-10"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </Button>

                {/* Next */}
                {playlist.length > 0 && (
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={playNext} 
                    disabled={currentIndex >= playlist.length - 1}
                    className="h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                )}

                {/* Playback Speed */}
                <div className="relative hidden sm:block">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowSpeed(!showSpeed)}
                    className="h-10 w-10"
                    title={`Speed: ${playbackSpeed}x`}
                  >
                    <Gauge className="w-5 h-5" />
                  </Button>

                  {showSpeed && (
                    <div className="absolute bottom-full right-0 mb-2 p-3 bg-popover border rounded-lg shadow-lg z-50">
                      <div className="text-xs font-semibold mb-2">Playback Speed</div>
                      <div className="flex flex-col gap-1">
                        {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                          <Button
                            key={speed}
                            size="sm"
                            variant={playbackSpeed === speed ? "default" : "ghost"}
                            onClick={() => {
                              setPlaybackSpeed(speed);
                              setShowSpeed(false);
                            }}
                            className="w-full justify-start text-xs"
                          >
                            {speed}x
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Repeat Mode */}
                <div className="relative hidden sm:block">
                  <Button
                    size="icon"
                    variant={repeatMode !== 'none' ? "default" : "ghost"}
                    onClick={() => {
                      const modes: ('none' | 'single' | 'all')[] = ['none', 'single', 'all'];
                      const currentModeIndex = modes.indexOf(repeatMode);
                      setRepeatMode(modes[(currentModeIndex + 1) % modes.length]);
                    }}
                    className="h-10 w-10"
                    title={`Repeat: ${repeatMode === 'none' ? 'Off' : repeatMode === 'single' ? 'One' : 'All'}`}
                  >
                    {repeatMode === 'single' ? (
                      <Repeat1 className="w-5 h-5" />
                    ) : (
                      <Repeat className={`w-5 h-5 ${repeatMode === 'all' ? 'text-primary' : ''}`} />
                    )}
                  </Button>
                </div>

                {/* Sleep Timer */}
                <div className="relative hidden sm:block">
                  <Button
                    size="icon"
                    variant={sleepTimer !== null ? "default" : "ghost"}
                    onClick={() => setShowSleepTimer(!showSleepTimer)}
                    className="h-10 w-10"
                    title={sleepTimer !== null ? `Sleep timer: ${sleepTimer} min` : 'Sleep timer'}
                  >
                    {sleepTimer !== null ? (
                      <Timer className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                  </Button>

                  {showSleepTimer && (
                    <div className="absolute bottom-full right-0 mb-2 p-3 bg-popover border rounded-lg shadow-lg z-50 min-w-[140px]">
                      <div className="text-xs font-semibold mb-2">Sleep Timer</div>
                      <div className="flex flex-col gap-1">
                        {sleepTimer !== null && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSleepTimer(null);
                              setShowSleepTimer(false);
                            }}
                            className="w-full justify-start text-xs"
                          >
                            Disable
                          </Button>
                        )}
                        {[5, 10, 15, 30, 60].map((minutes) => (
                          <Button
                            key={minutes}
                            size="sm"
                            variant={sleepTimer === minutes ? "default" : "ghost"}
                            onClick={() => {
                              setSleepTimer(minutes);
                              setShowSleepTimer(false);
                            }}
                            className="w-full justify-start text-xs"
                          >
                            {minutes} min
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Volume */}
                <div className="relative hidden sm:block">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowVolume(!showVolume)}
                    className="h-10 w-10"
                  >
                    {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>

                  {showVolume && (
                    <div className="absolute bottom-full right-0 mb-2 p-3 bg-popover border rounded-lg shadow-lg z-50">
                      <div className="text-xs font-semibold mb-2">Volume</div>
                      <Slider
                        value={[volume * 100]}
                        onValueChange={(value) => setVolume(value[0] / 100)}
                        max={100}
                        step={1}
                        className="w-24"
                      />
                      <div className="text-xs text-muted-foreground mt-1 text-center">
                        {Math.round(volume * 100)}%
                      </div>
                    </div>
                  )}
                </div>

                {/* Playlist Toggle */}
                {playlist.length > 0 && (
                  <Button
                    size="icon"
                    variant={showPlaylist ? "default" : "ghost"}
                    onClick={() => setShowPlaylist(!showPlaylist)}
                    className="h-8 w-8 sm:h-10 sm:w-10 relative"
                  >
                    <List className="w-4 h-4 sm:w-5 sm:h-5" />
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                      {playlist.length}
                    </Badge>
                  </Button>
                )}

                {/* Close */}
                <Button size="icon" variant="ghost" onClick={stop} className="h-8 w-8 sm:h-10 sm:w-10">
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <Slider
                value={[progress]}
                onValueChange={(value) => seek((value[0] / 100) * duration)}
                max={100}
                step={0.1}
                className="cursor-pointer"
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <div className="flex items-center gap-2">
                  {playbackSpeed !== 1.0 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {playbackSpeed}x
                    </Badge>
                  )}
                  {sleepTimer !== null && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 flex items-center gap-1">
                      <Moon className="w-2.5 h-2.5" />
                      {sleepTimer}m
                    </Badge>
                  )}
                  {repeatMode !== 'none' && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {repeatMode === 'single' ? '🔁' : '🔂'}
                    </Badge>
                  )}
                </div>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playlist View */}
            {showPlaylist && playlist.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t pt-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-semibold">Playlist ({playlist.length})</h5>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={shufflePlaylist} className="h-7">
                      <Shuffle className="w-3 h-3 mr-1" />
                      Shuffle
                    </Button>
                    <Button size="sm" variant="ghost" onClick={clearPlaylist} className="h-7">
                      Clear
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-40">
                  <div className="space-y-1">
                    {playlist.map((meditation, index) => (
                      <div
                        key={meditation._id}
                        className={`flex items-center gap-2 p-2 rounded text-sm cursor-pointer hover:bg-muted/50 ${
                          index === currentIndex ? 'bg-primary/10 text-primary' : ''
                        }`}
                        onClick={() => {
                          play(meditation);
                        }}
                      >
                        <span className="text-xs text-muted-foreground w-6">{index + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs font-medium">{meditation.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{meditation.category}</p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromPlaylist(meditation._id);
                          }}
                          className="h-6 w-6 shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
} 
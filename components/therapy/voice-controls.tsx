"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";

// Web Speech API types
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface VoiceControlsProps {
  isListening: boolean;
  isPlaying: boolean;
  onToggleListening: () => void;
  onTogglePlaying: () => void;
}

export function VoiceControls({
  isListening,
  isPlaying,
  onToggleListening,
  onTogglePlaying,
}: VoiceControlsProps) {
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check for browser support
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const SpeechSynthesis = window.speechSynthesis;
      
      if (SpeechRecognition && SpeechSynthesis) {
      setIsSupported(true);
        
        // Initialize speech recognition
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join("");
          
          if (transcript.trim()) {
            // You can emit this transcript to parent component
            console.log("Speech recognized:", transcript);
          }
        };
        
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error:", event.error);
        };
        
        recognition.onend = () => {
          console.log("Speech recognition ended");
        };
        
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const handleToggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    
    onToggleListening();
  };

  const handleTogglePlaying = () => {
    if (!window.speechSynthesis) return;
    
    if (isPlaying) {
      window.speechSynthesis.cancel();
    } else {
      // Example: speak a welcome message
      const utterance = new SpeechSynthesisUtterance("Hello! I'm here to help you with your mental health journey.");
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onend = () => {
        onTogglePlaying();
      };
      
      window.speechSynthesis.speak(utterance);
    }
    
    onTogglePlaying();
  };

  if (!isSupported) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        Voice controls not supported in this browser
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isListening ? "default" : "outline"}
        size="sm"
        onClick={handleToggleListening}
        className="flex items-center gap-2"
      >
        {isListening ? (
          <>
            <MicOff className="w-4 h-4" />
            Stop Listening
          </>
        ) : (
          <>
            <Mic className="w-4 h-4" />
            Start Listening
          </>
        )}
      </Button>

      <Button
        variant={isPlaying ? "default" : "outline"}
        size="sm"
        onClick={handleTogglePlaying}
        className="flex items-center gap-2"
      >
        {isPlaying ? (
          <>
            <VolumeX className="w-4 h-4" />
            Stop Speaking
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4" />
            Start Speaking
          </>
        )}
      </Button>
    </div>
  );
}

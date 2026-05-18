import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useToast } from "../hooks/useToast";

const AudioPlayerContext = createContext(null);

export function AudioPlayerProvider({ children }) {
  const toast = useToast();
  const [activeLesson, setActiveLesson] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechActive, setSpeechActive] = useState(false);

  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  // Stop any active narration
  const stopSpeech = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setSpeechActive(false);
  };

  // Start speech synthesis narration for a slide
  const startSpeech = (text) => {
    stopSpeech();
    if (isMuted || !synthRef.current) return;

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = synthRef.current.getVoices();
      const naturalVoice = voices.find(
        (v) =>
          v.name.includes("Google US English") ||
          v.name.includes("Microsoft David") ||
          v.name.includes("Natural") ||
          v.lang.startsWith("en-US")
      );
      if (naturalVoice) utterance.voice = naturalVoice;

      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setSpeechActive(true);
      };

      utterance.onend = () => {
        setSpeechActive(false);
        // Autoplay next slide if playing
        if (isPlaying && activeLesson && currentSlide < activeLesson.contentJson.slides.length - 1) {
          setTimeout(() => {
            setCurrentSlide((prev) => prev + 1);
          }, 800);
        } else if (isPlaying && activeLesson && currentSlide === activeLesson.contentJson.slides.length - 1) {
          setIsPlaying(false);
          toast.success("Lesson narration completed! Take the quiz to validate your mastery.");
        }
      };

      utterance.onerror = () => {
        setSpeechActive(false);
      };

      utteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    } catch (error) {
      console.error("Speech Synthesis Error:", error);
    }
  };

  // Sync speech when index or state shifts
  useEffect(() => {
    if (activeLesson && isPlaying) {
      const slideContent = activeLesson.contentJson.slides[currentSlide];
      if (slideContent) {
        startSpeech(slideContent.narrativeScript);
      }
    } else {
      stopSpeech();
    }
  }, [currentSlide, isPlaying, activeLesson, isMuted]);

  // Clean up speech when unmounting provider
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Mobile SpeechSynthesis gesture unlock helper
  const unlockAudio = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        // Play silent utterance synchronous to user interaction to unlock voice channel
        const u = new SpeechSynthesisUtterance("");
        u.volume = 0;
        window.speechSynthesis.speak(u);
      } catch (e) {
        console.warn("Mobile speech unlock bypassed", e);
      }
    }
  };

  const handleNextSlide = () => {
    unlockAudio();
    if (!activeLesson) return;
    if (currentSlide < activeLesson.contentJson.slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handlePrevSlide = () => {
    unlockAudio();
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const togglePlay = () => {
    unlockAudio();
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    unlockAudio();
    setIsMuted(!isMuted);
  };

  const selectLesson = (lesson) => {
    unlockAudio();
    setActiveLesson(lesson);
    setCurrentSlide(0);
    setIsPlaying(true);
  };

  const closePlayer = () => {
    stopSpeech();
    setActiveLesson(null);
    setIsPlaying(false);
    setCurrentSlide(0);
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        activeLesson,
        setActiveLesson,
        currentSlide,
        setCurrentSlide,
        isPlaying,
        setIsPlaying,
        isMuted,
        setIsMuted,
        speechActive,
        setSpeechActive,
        startSpeech,
        stopSpeech,
        handleNextSlide,
        handlePrevSlide,
        togglePlay,
        toggleMute,
        selectLesson,
        closePlayer,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
}

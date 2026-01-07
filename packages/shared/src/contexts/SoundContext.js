"use client";
import { jsx as _jsx } from "react/jsx-runtime";
// Shared: contexts/SoundContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { soundManager } from "../lib/sound";
const SoundContext = createContext(undefined);
export const SoundProvider = ({ children, }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolumeState] = useState(0.5);
    // Use the singleton instance of SoundManager
    const manager = soundManager;
    useEffect(() => {
        // Load saved settings
        const savedMuted = localStorage.getItem("soundMuted") === "true";
        const savedVolume = parseFloat(localStorage.getItem("soundVolume") || "0.5");
        setIsMuted(savedMuted);
        setVolumeState(savedVolume);
    }, []);
    const toggleMute = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        manager.setMuted(newMuted);
        localStorage.setItem("soundMuted", String(newMuted));
    };
    const playSound = (name, soundVolume = 1) => {
        if (isMuted) {
            return;
        }
        manager.playSound(name, soundVolume);
    };
    const playMusic = (name) => {
        if (isMuted) {
            return;
        }
        // Looping behavior should be configured during preloadSound(name, path, loop)
        // Here we just start music respecting the current volume from context
        manager.playMusic(name, volume);
    };
    const stopMusic = () => {
        manager.stopMusic();
    };
    const setVolume = (newVolume) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        setVolumeState(clampedVolume);
        manager.setVolume(clampedVolume);
        localStorage.setItem("soundVolume", String(clampedVolume));
        if (clampedVolume > 0 && isMuted) {
            setIsMuted(false);
        }
    };
    // Initialize the sound manager with the current volume and mute state
    useEffect(() => {
        manager.setVolume(volume);
        manager.setMuted(isMuted);
    }, [manager, volume, isMuted]);
    return (_jsx(SoundContext.Provider, { value: {
            isMuted,
            toggleMute,
            playSound,
            playMusic,
            stopMusic,
            setVolume,
            volume,
        }, children: children }));
};
export const useSound = () => {
    const context = useContext(SoundContext);
    if (!context) {
        throw new Error("useSound must be used within a SoundProvider");
    }
    return context;
};

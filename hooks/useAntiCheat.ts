"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface AntiCheatState {
    violations: number;
    isFullscreen: boolean;
    violationLog: string[];
}

export function useAntiCheat(maxViolations: number = 3, onAutoSubmit: () => void) {
    const [state, setState] = useState<AntiCheatState>({
        violations: 0,
        isFullscreen: false,
        violationLog: [],
    });

    const violationsRef = useRef(0);

    const addViolation = useCallback(
        (reason: string) => {
            violationsRef.current += 1;
            setState((prev) => ({
                ...prev,
                violations: violationsRef.current,
                violationLog: [...prev.violationLog, `${new Date().toLocaleTimeString()}: ${reason}`],
            }));

            if (violationsRef.current >= maxViolations) {
                onAutoSubmit();
            }
        },
        [maxViolations, onAutoSubmit]
    );

    const enterFullscreen = useCallback(async () => {
        try {
            await document.documentElement.requestFullscreen();
            setState((prev) => ({ ...prev, isFullscreen: true }));
        } catch (err) {
            console.error("Failed to enter fullscreen:", err);
        }
    }, []);

    const exitFullscreen = useCallback(() => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }, []);

    useEffect(() => {
        // Fullscreen change detection
        const handleFullscreenChange = () => {
            const isFs = !!document.fullscreenElement;
            setState((prev) => ({ ...prev, isFullscreen: isFs }));
            if (!isFs && violationsRef.current < maxViolations) {
                addViolation("Exited fullscreen mode");
            }
        };

        // Visibility change (tab switch) detection
        const handleVisibilityChange = () => {
            if (document.hidden) {
                addViolation("Tab switched / window minimized");
            }
        };

        // Blur detection
        const handleBlur = () => {
            addViolation("Window lost focus");
        };

        // Disable copy/paste
        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            addViolation("Copy attempt blocked");
        };

        const handlePaste = (e: ClipboardEvent) => {
            e.preventDefault();
            addViolation("Paste attempt blocked");
        };

        // Disable right-click
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        // Disable common keyboard shortcuts
        const handleKeyDown = (e: KeyboardEvent) => {
            // Block Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+P, F12, Ctrl+Shift+I
            if (
                (e.ctrlKey && ["c", "v", "a", "p"].includes(e.key.toLowerCase())) ||
                e.key === "F12" ||
                (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i")
            ) {
                e.preventDefault();
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);
        document.addEventListener("copy", handleCopy);
        document.addEventListener("paste", handlePaste);
        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
            document.removeEventListener("copy", handleCopy);
            document.removeEventListener("paste", handlePaste);
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [addViolation, maxViolations]);

    return {
        ...state,
        enterFullscreen,
        exitFullscreen,
        addViolation,
    };
}

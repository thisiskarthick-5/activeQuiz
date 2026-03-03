"use client";

import { useEffect, useState } from "react";

export default function Timer({
    duration,
    onTimeUp,
}: {
    duration: number;
    onTimeUp: () => void;
}) {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft, onTimeUp]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const percentage = (timeLeft / duration) * 100;
    const isUrgent = timeLeft <= 30;
    const isWarning = timeLeft <= 60 && !isUrgent;

    // Circle progress
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex items-center gap-3">
            <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="4"
                        fill="none"
                    />
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke={isUrgent ? "#ef4444" : isWarning ? "#f59e0b" : "#6366f1"}
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-linear"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span
                        className={`text-sm font-bold font-mono ${isUrgent
                                ? "text-red-400 animate-pulse"
                                : isWarning
                                    ? "text-amber-400"
                                    : "text-white"
                            }`}
                    >
                        {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                    </span>
                </div>
            </div>
            {isUrgent && (
                <span className="text-xs text-red-400 animate-pulse font-medium">
                    ⚠️ Time running out!
                </span>
            )}
        </div>
    );
}
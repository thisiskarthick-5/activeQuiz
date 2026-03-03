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

  return (
    <div
      className={`text-2xl font-bold p-3 rounded-lg w-fit ${
        timeLeft <= 10 ? "bg-red-600 animate-pulse" : "bg-blue-600"
      }`}
    >
      ⏳ {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
    </div>
  );
}
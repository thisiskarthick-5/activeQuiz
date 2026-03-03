"use client";
import { useEffect, useState } from "react";

export default function Timer({ duration }: { duration: number }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div
      className={`text-2xl font-bold p-3 rounded-lg w-fit ${
        timeLeft <= 10 ? "bg-red-600" : "bg-blue-600"
      }`}
    >
      ⏳ {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
    </div>
  );
}
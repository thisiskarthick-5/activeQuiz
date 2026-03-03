"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-black text-white p-4 flex justify-between items-center shadow-lg">
      <h1 className="text-xl font-bold text-blue-400">
        QuizMaster
      </h1>

      <div className="space-x-6">
        <Link href="/" className="hover:text-blue-400">Home</Link>
        <Link href="/login" className="hover:text-blue-400">Login</Link>
        <Link href="/dashboard" className="hover:text-blue-400">Dashboard</Link>
        <Link href="/leaderboard" className="hover:text-blue-400">Leaderboard</Link>
      </div>
    </nav>
  );
}
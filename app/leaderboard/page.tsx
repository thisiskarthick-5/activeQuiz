"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";
import { Quiz, Profile } from "@/lib/types";
import {
    HiClock,
    HiExclamation,
    HiChevronDown,
} from "react-icons/hi";

interface LeaderboardEntry {
    id: string;
    student_id: string;
    quiz_id: string;
    score: number | null;
    time_taken: number | null;
    violations: number;
    rank: number | null;
    student: Profile;
}

export default function Leaderboard() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [selectedQuiz, setSelectedQuiz] = useState<string>("");
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchQuizzes = async () => {
            const { data } = await supabase
                .from("quizzes")
                .select("*")
                .order("created_at", { ascending: false });
            setQuizzes(data || []);
            if (data && data.length > 0) {
                setSelectedQuiz(data[0].id);
            }
            setLoading(false);
        };
        fetchQuizzes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!selectedQuiz) return;

        const fetchEntries = async () => {
            setLoading(true);
            const { data } = await supabase
                .from("student_quiz")
                .select("*, student:profiles(*)")
                .eq("quiz_id", selectedQuiz)
                .not("submitted_at", "is", null)
                .order("score", { ascending: false })
                .order("time_taken", { ascending: true });
            setEntries((data as unknown as LeaderboardEntry[]) || []);
            setLoading(false);
        };
        fetchEntries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedQuiz]);

    const selectedQuizData = quizzes.find((q) => q.id === selectedQuiz);

    return (
        <div className="min-h-screen gradient-bg">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8 animate-fade-in-up">
                    <h1 className="text-3xl font-bold text-white mb-1">🏆 Leaderboard</h1>
                    <p className="text-gray-400">See how students rank across quizzes</p>
                </div>

                {/* Quiz Select */}
                <div className="glass-card p-4 mb-6 flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                    <span className="text-sm text-gray-400">Quiz:</span>
                    <div className="relative flex-1">
                        <select
                            value={selectedQuiz}
                            onChange={(e) => setSelectedQuiz(e.target.value)}
                            className="select-field pr-10"
                        >
                            {quizzes.map((q) => (
                                <option key={q.id} value={q.id}>
                                    {q.topic} ({q.quiz_code})
                                </option>
                            ))}
                        </select>
                        <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                </div>

                {selectedQuizData && (
                    <div className="glass-card p-4 mb-6 flex flex-wrap items-center gap-4 text-sm text-gray-400 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
                        <span className="badge badge-primary">{selectedQuizData.difficulty}</span>
                        <span className="flex items-center gap-1">
                            <HiClock className="text-indigo-400" /> {selectedQuizData.duration} min
                        </span>
                        <span>{selectedQuizData.num_questions} questions</span>
                        <span>{entries.length} submissions</span>
                    </div>
                )}

                {/* Leaderboard Table */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="glass-card p-5 animate-shimmer h-16" />
                        ))}
                    </div>
                ) : entries.length === 0 ? (
                    <div className="glass-card p-12 text-center animate-fade-in-up">
                        <p className="text-gray-400 text-lg">No submissions yet for this quiz</p>
                    </div>
                ) : (
                    <div className="space-y-3 stagger-children">
                        {/* Top 3 Podium */}
                        {entries.length >= 3 && (
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                {/* 2nd place */}
                                <div className="glass-card p-5 text-center mt-6">
                                    <div className="text-3xl mb-2">🥈</div>
                                    <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white font-bold mb-2">
                                        {entries[1].student?.name?.charAt(0) || "?"}
                                    </div>
                                    <p className="font-semibold text-white text-sm truncate">
                                        {entries[1].student?.name}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-300 mt-1">{entries[1].score}</p>
                                    <p className="text-xs text-gray-500">
                                        {entries[1].time_taken ? `${Math.floor(entries[1].time_taken / 60)}m ${entries[1].time_taken % 60}s` : "—"}
                                    </p>
                                </div>

                                {/* 1st place */}
                                <div className="glass-card p-5 text-center gradient-border animate-pulse-glow">
                                    <div className="text-4xl mb-2">🥇</div>
                                    <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-white font-bold text-lg mb-2 shadow-lg">
                                        {entries[0].student?.name?.charAt(0) || "?"}
                                    </div>
                                    <p className="font-bold text-white truncate">
                                        {entries[0].student?.name}
                                    </p>
                                    <p className="text-3xl font-bold gradient-text mt-1">{entries[0].score}</p>
                                    <p className="text-xs text-gray-500">
                                        {entries[0].time_taken ? `${Math.floor(entries[0].time_taken / 60)}m ${entries[0].time_taken % 60}s` : "—"}
                                    </p>
                                </div>

                                {/* 3rd place */}
                                <div className="glass-card p-5 text-center mt-6">
                                    <div className="text-3xl mb-2">🥉</div>
                                    <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white font-bold mb-2">
                                        {entries[2].student?.name?.charAt(0) || "?"}
                                    </div>
                                    <p className="font-semibold text-white text-sm truncate">
                                        {entries[2].student?.name}
                                    </p>
                                    <p className="text-2xl font-bold text-amber-600 mt-1">{entries[2].score}</p>
                                    <p className="text-xs text-gray-500">
                                        {entries[2].time_taken ? `${Math.floor(entries[2].time_taken / 60)}m ${entries[2].time_taken % 60}s` : "—"}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Full Table */}
                        <div className="glass-card overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium w-12">Rank</th>
                                        <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">Student</th>
                                        <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">Score</th>
                                        <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">Time</th>
                                        <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">Violations</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map((entry, i) => (
                                        <tr key={entry.id} className="border-b border-white/3 hover:bg-white/2 transition">
                                            <td className="px-4 py-3 text-sm font-medium">
                                                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xs">
                                                        {entry.student?.name?.charAt(0) || "?"}
                                                    </div>
                                                    <span className="text-sm text-white font-medium">
                                                        {entry.student?.name || "Unknown"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="badge badge-success font-bold">{entry.score ?? "—"}</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <HiClock className="text-xs" />
                                                    {entry.time_taken
                                                        ? `${Math.floor(entry.time_taken / 60)}m ${entry.time_taken % 60}s`
                                                        : "—"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {entry.violations > 0 ? (
                                                    <span className="badge badge-danger flex items-center gap-1 w-fit">
                                                        <HiExclamation /> {entry.violations}
                                                    </span>
                                                ) : (
                                                    <span className="badge badge-success">Clean ✓</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
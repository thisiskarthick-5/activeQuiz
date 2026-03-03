"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import { Quiz, Question, StudentQuiz, Profile } from "@/lib/types";
import Link from "next/link";
import {
    HiArrowLeft,
    HiClipboardCopy,
    HiClock,
    HiUserGroup,
    HiAcademicCap,
    HiCheckCircle,
    HiXCircle,
} from "react-icons/hi";
import toast from "react-hot-toast";

export default function TeacherQuizDetail() {
    const { quizId } = useParams();
    const { profile } = useAuth();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [results, setResults] = useState<(StudentQuiz & { student?: Profile })[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"questions" | "results">("questions");
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const [quizRes, questionsRes, resultsRes] = await Promise.all([
                supabase.from("quizzes").select("*").eq("id", quizId).single(),
                supabase.from("questions").select("*").eq("quiz_id", quizId),
                supabase
                    .from("student_quiz")
                    .select("*, student:profiles(*)")
                    .eq("quiz_id", quizId)
                    .order("score", { ascending: false }),
            ]);
            setQuiz(quizRes.data);
            setQuestions(questionsRes.data || []);
            setResults(resultsRes.data || []);
            setLoading(false);
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quizId]);

    if (loading) {
        return (
            <div className="min-h-screen gradient-bg">
                <Navbar />
                <div className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 64px)" }}>
                    <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="min-h-screen gradient-bg">
                <Navbar />
                <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                    <p className="text-gray-400">Quiz not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen gradient-bg">
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 py-8">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-6 transition"
                >
                    <HiArrowLeft /> Back to Dashboard
                </Link>

                {/* Quiz Header */}
                <div className="glass-card p-6 mb-6 animate-fade-in-up">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">{quiz.topic}</h1>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-400">
                                <span className="badge badge-primary">{quiz.difficulty}</span>
                                <span className="flex items-center gap-1">
                                    <HiClock /> {quiz.duration} min
                                </span>
                                <span className="flex items-center gap-1">
                                    <HiAcademicCap /> {questions.length} questions
                                </span>
                                <span className="flex items-center gap-1">
                                    <HiUserGroup /> {results.length} attempts
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="glass-card px-4 py-2">
                                <p className="text-xs text-gray-400">Quiz Code</p>
                                <p className="font-mono font-bold text-indigo-300 tracking-wider">
                                    {quiz.quiz_code}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(quiz.quiz_code);
                                    toast.success("Code copied!");
                                }}
                                className="btn-secondary p-2"
                            >
                                <HiClipboardCopy className="text-lg" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 glass-card p-1 w-fit">
                    <button
                        onClick={() => setActiveTab("questions")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "questions"
                                ? "bg-indigo-500 text-white"
                                : "text-gray-400 hover:text-white"
                            }`}
                    >
                        Questions ({questions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("results")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "results"
                                ? "bg-indigo-500 text-white"
                                : "text-gray-400 hover:text-white"
                            }`}
                    >
                        Student Results ({results.length})
                    </button>
                </div>

                {/* Content */}
                {activeTab === "questions" ? (
                    <div className="space-y-4">
                        {questions.map((q, i) => (
                            <div key={q.id} className="glass-card p-5">
                                <p className="font-medium text-white mb-3">
                                    {i + 1}. {q.question_text}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                    {["a", "b", "c", "d"].map((opt) => (
                                        <div
                                            key={opt}
                                            className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${q.correct_answer === opt
                                                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                                                    : "bg-white/3 text-gray-400 border border-white/5"
                                                }`}
                                        >
                                            {q.correct_answer === opt ? (
                                                <HiCheckCircle className="text-emerald-400 flex-shrink-0" />
                                            ) : (
                                                <HiXCircle className="text-gray-600 flex-shrink-0" />
                                            )}
                                            <span className="uppercase font-medium mr-1">{opt}.</span>
                                            {q[`option_${opt}` as keyof Question]}
                                        </div>
                                    ))}
                                </div>
                                {q.explanation && (
                                    <p className="text-xs text-cyan-300 bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/10">
                                        💡 {q.explanation}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>
                        {results.length === 0 ? (
                            <div className="glass-card p-8 text-center">
                                <p className="text-gray-400">No submissions yet</p>
                            </div>
                        ) : (
                            <div className="glass-card overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">Rank</th>
                                            <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">Student</th>
                                            <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">Score</th>
                                            <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">Time</th>
                                            <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">Violations</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map((r, i) => (
                                            <tr key={r.id} className="border-b border-white/3">
                                                <td className="px-4 py-3 text-sm">
                                                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-white">
                                                    {(r.student as Profile)?.name || "Unknown"}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className="badge badge-success">{r.score ?? "—"}/{questions.length}</span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-400">
                                                    {r.time_taken ? `${Math.floor(r.time_taken / 60)}m ${r.time_taken % 60}s` : "—"}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {r.violations > 0 ? (
                                                        <span className="badge badge-danger">{r.violations}</span>
                                                    ) : (
                                                        <span className="badge badge-success">0</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

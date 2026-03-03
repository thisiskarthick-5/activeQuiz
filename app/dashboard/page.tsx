"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import { Quiz, StudentQuiz } from "@/lib/types";
import Link from "next/link";
import toast from "react-hot-toast";
import {
    HiPlusCircle,
    HiClipboardList,
    HiUserGroup,
    HiTrendingUp,
    HiClock,
    HiCode,
    HiExternalLink,
} from "react-icons/hi";

export default function Dashboard() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [loading, user, router]);

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

    if (!profile) return null;

    return (
        <div className="min-h-screen gradient-bg">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome header */}
                <div className="mb-8 animate-fade-in-up">
                    <h1 className="text-3xl font-bold text-white">
                        Welcome back, <span className="gradient-text">{profile.name}</span>!
                    </h1>
                    <p className="text-gray-400 mt-1 capitalize">
                        {profile.role} Dashboard
                    </p>
                </div>

                {profile.role === "teacher" ? (
                    <TeacherDashboard userId={profile.id} />
                ) : (
                    <StudentDashboard userId={profile.id} />
                )}
            </div>
        </div>
    );
}

function TeacherDashboard({ userId }: { userId: string }) {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loadingQuizzes, setLoadingQuizzes] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchQuizzes = async () => {
            const { data } = await supabase
                .from("quizzes")
                .select("*")
                .eq("teacher_id", userId)
                .order("created_at", { ascending: false });
            setQuizzes(data || []);
            setLoadingQuizzes(false);
        };
        fetchQuizzes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 stagger-children">
                <StatCard
                    icon={<HiClipboardList className="text-2xl" />}
                    label="Total Quizzes"
                    value={quizzes.length}
                    gradient="from-indigo-500 to-purple-600"
                />
                <StatCard
                    icon={<HiUserGroup className="text-2xl" />}
                    label="Students Reached"
                    value="—"
                    gradient="from-cyan-500 to-blue-600"
                />
                <StatCard
                    icon={<HiTrendingUp className="text-2xl" />}
                    label="Avg. Score"
                    value="—"
                    gradient="from-emerald-500 to-teal-600"
                />
            </div>

            {/* Create Quiz CTA */}
            <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                <Link
                    href="/dashboard/create-quiz"
                    className="glass-card glass-card-hover p-6 flex items-center gap-4 transition-all duration-300 group block"
                >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <HiPlusCircle className="text-white text-3xl" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Create New Quiz</h3>
                        <p className="text-gray-400 text-sm">
                            Use AI to generate questions on any topic
                        </p>
                    </div>
                </Link>
            </div>

            {/* Quiz List */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">Your Quizzes</h2>
                {loadingQuizzes ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="glass-card p-5 animate-shimmer h-24" />
                        ))}
                    </div>
                ) : quizzes.length === 0 ? (
                    <div className="glass-card p-8 text-center">
                        <p className="text-gray-400">No quizzes created yet. Create your first quiz!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {quizzes.map((quiz) => (
                            <Link
                                key={quiz.id}
                                href={`/dashboard/quiz/${quiz.id}`}
                                className="glass-card glass-card-hover p-5 flex items-center justify-between transition-all block"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                                        <HiClipboardList className="text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">{quiz.topic}</h3>
                                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                            <span className="flex items-center gap-1">
                                                <HiCode /> {quiz.quiz_code}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <HiClock /> {quiz.duration} min
                                            </span>
                                            <span className="badge badge-primary">{quiz.difficulty}</span>
                                        </div>
                                    </div>
                                </div>
                                <HiExternalLink className="text-gray-500 text-lg" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function StudentDashboard({ userId }: { userId: string }) {
    const [attempts, setAttempts] = useState<(StudentQuiz & { quiz?: Quiz })[]>([]);
    const [quizCode, setQuizCode] = useState("");
    const [joiningQuiz, setJoiningQuiz] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchAttempts = async () => {
            const { data } = await supabase
                .from("student_quiz")
                .select("*, quiz:quizzes(*)")
                .eq("student_id", userId)
                .order("started_at", { ascending: false });
            setAttempts(data || []);
        };
        fetchAttempts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const handleJoinQuiz = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quizCode.trim()) return;
        setJoiningQuiz(true);

        try {
            const { data: quiz, error } = await supabase
                .from("quizzes")
                .select("*")
                .eq("quiz_code", quizCode.trim().toUpperCase())
                .single();

            if (error || !quiz) {
                toast.error("Invalid quiz code. Please try again.");
                return;
            }

            const now = new Date();
            const start = new Date(quiz.start_time);
            const end = new Date(quiz.end_time);

            if (now < start) {
                toast.error(`This quiz hasn't started yet. It starts at ${start.toLocaleString()}`);
                return;
            }
            if (now > end) {
                toast.error("This quiz has already ended.");
                return;
            }

            // Check if already attempted
            const { data: existing } = await supabase
                .from("student_quiz")
                .select("id, submitted_at")
                .eq("student_id", userId)
                .eq("quiz_id", quiz.id)
                .single();

            if (existing?.submitted_at) {
                toast.error("You have already submitted this quiz.");
                return;
            }

            router.push(`/quiz/${quiz.id}`);
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setJoiningQuiz(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Join Quiz Card */}
            <div className="glass-card p-6 animate-fade-in-up gradient-border">
                <h2 className="text-xl font-semibold text-white mb-4">
                    🎯 Enter Quiz Code
                </h2>
                <form onSubmit={handleJoinQuiz} className="flex gap-3">
                    <input
                        type="text"
                        placeholder="e.g. QUIZ-ABC123"
                        value={quizCode}
                        onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
                        className="input-field flex-1 uppercase tracking-wider text-center font-mono text-lg"
                    />
                    <button
                        type="submit"
                        disabled={joiningQuiz || !quizCode.trim()}
                        className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {joiningQuiz ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            "Join"
                        )}
                    </button>
                </form>
            </div>

            {/* Past Attempts */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">Past Quizzes</h2>
                {attempts.length === 0 ? (
                    <div className="glass-card p-8 text-center">
                        <p className="text-gray-400">No quizzes taken yet. Enter a quiz code to get started!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {attempts.map((attempt) => (
                            <div key={attempt.id} className="glass-card p-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400">
                                        <HiClipboardList className="text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">
                                            {(attempt.quiz as Quiz)?.topic || "Quiz"}
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                            {attempt.score !== null && (
                                                <span className="badge badge-success">Score: {attempt.score}</span>
                                            )}
                                            {attempt.rank && (
                                                <span className="badge badge-primary">Rank #{attempt.rank}</span>
                                            )}
                                            {attempt.submitted_at ? (
                                                <span className="badge badge-success">Completed</span>
                                            ) : (
                                                <span className="badge badge-warning">In Progress</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {!attempt.submitted_at && (
                                    <Link
                                        href={`/quiz/${attempt.quiz_id}`}
                                        className="btn-primary text-sm py-2 px-4"
                                    >
                                        Resume
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    gradient,
}: {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    gradient: string;
}) {
    return (
        <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
                <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}
                >
                    {icon}
                </div>
                <span className="text-gray-400 text-sm">{label}</span>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    );
}
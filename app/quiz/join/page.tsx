"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import toast from "react-hot-toast";
import { HiSearch, HiArrowRight } from "react-icons/hi";

export default function JoinQuiz() {
    const { user, profile, loading } = useAuth();
    const [quizCode, setQuizCode] = useState("");
    const [joining, setJoining] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quizCode.trim()) return;

        if (!user || !profile) {
            toast.error("Please login first");
            router.push("/login");
            return;
        }

        setJoining(true);

        try {
            const { data: quiz, error } = await supabase
                .from("quizzes")
                .select("*")
                .eq("quiz_code", quizCode.trim().toUpperCase())
                .single();

            if (error || !quiz) {
                toast.error("Invalid quiz code");
                return;
            }

            const now = new Date();
            const start = new Date(quiz.start_time);
            const end = new Date(quiz.end_time);

            if (now < start) {
                toast.error(`Quiz starts at ${start.toLocaleString()}`);
                return;
            }
            if (now > end) {
                toast.error("This quiz has ended");
                return;
            }

            // Check existing attempt
            const { data: existing } = await supabase
                .from("student_quiz")
                .select("id, submitted_at")
                .eq("student_id", profile.id)
                .eq("quiz_id", quiz.id)
                .single();

            if (existing?.submitted_at) {
                toast.error("You already completed this quiz");
                return;
            }

            router.push(`/quiz/${quiz.id}`);
        } catch {
            toast.error("Something went wrong");
        } finally {
            setJoining(false);
        }
    };

    return (
        <div className="min-h-screen gradient-bg">
            <Navbar />
            <div
                className="flex items-center justify-center px-4"
                style={{ minHeight: "calc(100vh - 64px)" }}
            >
                <div className="glass-card p-8 w-full max-w-md animate-fade-in-up gradient-border">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl">
                            <HiSearch className="text-white text-3xl" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Join a Quiz</h1>
                        <p className="text-gray-400 text-sm mt-1">
                            Enter the quiz code shared by your teacher
                        </p>
                    </div>

                    <form onSubmit={handleJoin} className="space-y-4">
                        <input
                            type="text"
                            value={quizCode}
                            onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
                            placeholder="QUIZ-XXXXXX"
                            className="input-field text-center text-2xl font-mono tracking-[0.3em] py-4 uppercase"
                            maxLength={12}
                        />
                        <button
                            type="submit"
                            disabled={joining || !quizCode.trim() || loading}
                            className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {joining ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Join Quiz <HiArrowRight />
                                </>
                            )}
                        </button>
                    </form>

                    {!user && !loading && (
                        <p className="text-center text-sm text-amber-400 mt-4">
                            ⚠️ You need to{" "}
                            <a href="/login" className="underline">
                                login
                            </a>{" "}
                            before joining a quiz
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

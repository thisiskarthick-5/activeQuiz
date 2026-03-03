"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import {
    HiBookOpen,
    HiHashtag,
    HiClock,
    HiAdjustments,
    HiCalendar,
    HiRefresh,
    HiSparkles,
    HiArrowLeft,
} from "react-icons/hi";
import Link from "next/link";

export default function CreateQuiz() {
    const { profile } = useAuth();
    const router = useRouter();
    const supabase = createClient();

    const [topic, setTopic] = useState("");
    const [numQuestions, setNumQuestions] = useState(10);
    const [duration, setDuration] = useState(30);
    const [difficulty, setDifficulty] = useState("medium");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [randomize, setRandomize] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [createdQuiz, setCreatedQuiz] = useState<{
        quizCode: string;
        quizId: string;
    } | null>(null);

    const generateQuizCode = () => {
        return "QUIZ-" + uuidv4().slice(0, 6).toUpperCase();
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        if (!topic.trim()) {
            toast.error("Please enter a topic");
            return;
        }
        if (!startTime || !endTime) {
            toast.error("Please set start and end times");
            return;
        }
        if (new Date(endTime) <= new Date(startTime)) {
            toast.error("End time must be after start time");
            return;
        }

        setGenerating(true);
        const toastId = toast.loading("🤖 AI is generating questions...");

        try {
            // Call AI generation API
            const response = await fetch("/api/quiz/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic,
                    numQuestions,
                    difficulty,
                }),
            });

            const aiData = await response.json();

            if (!response.ok) {
                throw new Error(aiData.error || "Failed to generate questions");
            }

            const quizCode = generateQuizCode();
            const quizId = uuidv4();

            // Create quiz in Supabase
            const { error: quizError } = await supabase.from("quizzes").insert({
                id: quizId,
                teacher_id: profile.id,
                topic,
                duration,
                start_time: new Date(startTime).toISOString(),
                end_time: new Date(endTime).toISOString(),
                quiz_code: quizCode,
                difficulty,
                num_questions: numQuestions,
                randomize,
            });

            if (quizError) {
                throw new Error(quizError.message);
            }

            // Insert questions
            const questions = aiData.questions.map((q: {
                question_text: string;
                option_a: string;
                option_b: string;
                option_c: string;
                option_d: string;
                correct_answer: string;
                explanation: string;
            }) => ({
                id: uuidv4(),
                quiz_id: quizId,
                question_text: q.question_text,
                option_a: q.option_a,
                option_b: q.option_b,
                option_c: q.option_c,
                option_d: q.option_d,
                correct_answer: q.correct_answer,
                explanation: q.explanation,
            }));

            const { error: questionsError } = await supabase
                .from("questions")
                .insert(questions);

            if (questionsError) {
                throw new Error(questionsError.message);
            }

            toast.success("Quiz created successfully! 🎉", { id: toastId });
            setCreatedQuiz({ quizCode, quizId });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to create quiz";
            toast.error(message, { id: toastId });
        } finally {
            setGenerating(false);
        }
    };

    if (createdQuiz) {
        return (
            <div className="min-h-screen gradient-bg">
                <Navbar />
                <div className="max-w-lg mx-auto px-4 py-16">
                    <div className="glass-card p-8 text-center animate-fade-in-up gradient-border">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl">
                            <HiSparkles className="text-white text-4xl" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Quiz Created! 🎉
                        </h1>
                        <p className="text-gray-400 mb-6">
                            Share the quiz code with your students
                        </p>

                        <div className="glass-card p-5 mb-6 animate-pulse-glow">
                            <p className="text-sm text-gray-400 mb-2">Quiz Code</p>
                            <p className="text-3xl font-bold font-mono tracking-widest gradient-text">
                                {createdQuiz.quizCode}
                            </p>
                        </div>

                        <div className="glass-card p-4 mb-6">
                            <p className="text-sm text-gray-400 mb-2">Share Link</p>
                            <p className="text-sm text-indigo-300 break-all">
                                {typeof window !== 'undefined' ? window.location.origin : ''}/quiz/{createdQuiz.quizId}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(createdQuiz.quizCode);
                                    toast.success("Code copied!");
                                }}
                                className="btn-primary flex-1"
                            >
                                Copy Code
                            </button>
                            <Link
                                href={`/dashboard/quiz/${createdQuiz.quizId}`}
                                className="btn-secondary flex-1 text-center"
                            >
                                View Quiz
                            </Link>
                        </div>

                        <Link
                            href="/dashboard"
                            className="block mt-4 text-sm text-gray-400 hover:text-white transition"
                        >
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen gradient-bg">
            <Navbar />
            <div className="max-w-2xl mx-auto px-4 py-8">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-6 transition"
                >
                    <HiArrowLeft /> Back to Dashboard
                </Link>

                <div className="glass-card p-8 animate-fade-in-up">
                    <h1 className="text-2xl font-bold text-white mb-2">Create New Quiz</h1>
                    <p className="text-gray-400 text-sm mb-8">
                        AI will generate unique questions based on your topic
                    </p>

                    <form onSubmit={handleCreate} className="space-y-5">
                        {/* Topic */}
                        <div>
                            <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                                <HiBookOpen /> Topic
                            </label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder='e.g., "Data Structures", "World War II", "Organic Chemistry"'
                                className="input-field"
                                required
                            />
                        </div>

                        {/* Number of Questions & Difficulty */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                                    <HiHashtag /> Questions
                                </label>
                                <select
                                    value={numQuestions}
                                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                                    className="select-field"
                                >
                                    <option value={5}>5 Questions</option>
                                    <option value={10}>10 Questions</option>
                                    <option value={15}>15 Questions</option>
                                    <option value={20}>20 Questions</option>
                                </select>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                                    <HiAdjustments /> Difficulty
                                </label>
                                <select
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    className="select-field"
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                                <HiClock /> Duration (minutes)
                            </label>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                min={5}
                                max={180}
                                className="input-field"
                            />
                        </div>

                        {/* Start & End Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                                    <HiCalendar /> Start Time
                                </label>
                                <input
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                                    <HiCalendar /> End Time
                                </label>
                                <input
                                    type="datetime-local"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="input-field"
                                    required
                                />
                            </div>
                        </div>

                        {/* Randomization */}
                        <div className="flex items-center justify-between glass-card p-4">
                            <div className="flex items-center gap-2">
                                <HiRefresh className="text-indigo-400" />
                                <div>
                                    <p className="text-sm font-medium text-white">Randomize Questions</p>
                                    <p className="text-xs text-gray-400">
                                        Each student gets a different order
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setRandomize(!randomize)}
                                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${randomize ? "bg-indigo-500" : "bg-gray-600"
                                    }`}
                            >
                                <div
                                    className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all duration-300 shadow-md ${randomize ? "left-6" : "left-0.5"
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={generating}
                            className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {generating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    AI is Generating...
                                </>
                            ) : (
                                <>
                                    <HiSparkles /> Generate Quiz with AI
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

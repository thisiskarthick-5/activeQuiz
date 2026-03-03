"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Timer from "@/components/Timer";
import { useAuth } from "@/components/AuthProvider";
import { useAntiCheat } from "@/hooks/useAntiCheat";
import { createClient } from "@/lib/supabase";
import { Quiz, Question } from "@/lib/types";
import toast from "react-hot-toast";
import {
    HiShieldCheck,
    HiClock,
    HiQuestionMarkCircle,
    HiExclamation,
    HiArrowRight,
    HiArrowLeft,
    HiCheckCircle,
    HiXCircle,
    HiLightBulb,
    HiChartBar,
} from "react-icons/hi";

type QuizPhase = "loading" | "instructions" | "taking" | "results";

interface QuizResult {
    score: number;
    total: number;
    timeTaken: number;
    violations: number;
    answers: Record<string, string>;
    weaknessAnalysis: string;
}

export default function QuizPage() {
    const { quizId } = useParams();
    const { user, profile, loading: authLoading } = useAuth();
    const router = useRouter();
    const supabase = createClient();

    const [phase, setPhase] = useState<QuizPhase>("loading");
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
    const [result, setResult] = useState<QuizResult | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const startTimeRef = useRef<number>(0);
    const hasSubmittedRef = useRef(false);

    const handleAutoSubmit = useCallback(() => {
        if (!hasSubmittedRef.current) {
            toast.error("Auto-submitted due to violations!", { icon: "⚠️" });
            handleSubmitQuiz();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const antiCheat = useAntiCheat(5, handleAutoSubmit);

    // Fetch quiz data
    useEffect(() => {
        if (authLoading) return;
        if (!user || !profile) {
            router.push("/login");
            return;
        }

        const fetchQuiz = async () => {
            const [quizRes, questionsRes] = await Promise.all([
                supabase.from("quizzes").select("*").eq("id", quizId).single(),
                supabase.from("questions").select("*").eq("quiz_id", quizId),
            ]);

            if (!quizRes.data) {
                toast.error("Quiz not found");
                router.push("/dashboard");
                return;
            }

            setQuiz(quizRes.data);

            // Randomize questions if enabled
            let qs = questionsRes.data || [];
            if (quizRes.data.randomize) {
                qs = shuffleArray(qs);
                // Also shuffle options for each question
                qs = qs.map((q) => {
                    const options = [
                        { key: "a", text: q.option_a },
                        { key: "b", text: q.option_b },
                        { key: "c", text: q.option_c },
                        { key: "d", text: q.option_d },
                    ];
                    const shuffled = shuffleArray(options);
                    const newCorrect = shuffled.findIndex(
                        (o) => o.key === q.correct_answer
                    );
                    const keys = ["a", "b", "c", "d"] as const;
                    return {
                        ...q,
                        option_a: shuffled[0].text,
                        option_b: shuffled[1].text,
                        option_c: shuffled[2].text,
                        option_d: shuffled[3].text,
                        correct_answer: keys[newCorrect],
                    };
                });
            }

            setQuestions(qs);

            // Check if already submitted
            const { data: existing } = await supabase
                .from("student_quiz")
                .select("*")
                .eq("student_id", profile!.id)
                .eq("quiz_id", quizId)
                .single();

            if (existing?.submitted_at) {
                toast.error("You already completed this quiz");
                router.push("/dashboard");
                return;
            }

            setPhase("instructions");
        };

        fetchQuiz();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, user, quizId]);

    const handleStartQuiz = async () => {
        if (!profile || !quiz) return;

        // Create or update attempt record
        await supabase.from("student_quiz").upsert({
            student_id: profile.id,
            quiz_id: quiz.id,
            started_at: new Date().toISOString(),
            violations: 0,
        }, { onConflict: "student_id,quiz_id" });

        startTimeRef.current = Date.now();
        antiCheat.enterFullscreen();
        setPhase("taking");
    };

    const handleOptionClick = (questionId: string, option: string) => {
        setSelectedAnswers((prev) => ({ ...prev, [questionId]: option }));

        // Auto-save to Supabase
        if (profile) {
            supabase
                .from("student_quiz")
                .update({ answers: { ...selectedAnswers, [questionId]: option } })
                .eq("student_id", profile.id)
                .eq("quiz_id", quizId)
                .then();
        }
    };

    const handleSubmitQuiz = async () => {
        if (hasSubmittedRef.current || submitting) return;
        hasSubmittedRef.current = true;
        setSubmitting(true);

        const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
        antiCheat.exitFullscreen();

        // Calculate score
        let score = 0;
        questions.forEach((q) => {
            if (selectedAnswers[q.id] === q.correct_answer) {
                score++;
            }
        });

        // Get weakness analysis from AI
        let weaknessAnalysis = "";
        try {
            const wrongQuestions = questions
                .filter((q) => selectedAnswers[q.id] !== q.correct_answer)
                .map((q) => ({
                    question_text: q.question_text,
                    correct_answer: q.correct_answer,
                    student_answer: selectedAnswers[q.id] || "not answered",
                }));

            if (wrongQuestions.length > 0) {
                const res = await fetch("/api/quiz/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ wrongQuestions }),
                });
                if (res.ok) {
                    const data = await res.json();
                    weaknessAnalysis = data.analysis;
                }
            } else {
                weaknessAnalysis = "Perfect score! Excellent work! 🌟";
            }
        } catch {
            weaknessAnalysis = "Analysis unavailable";
        }

        // Save results
        if (profile) {
            // Update student_quiz
            await supabase
                .from("student_quiz")
                .update({
                    score,
                    time_taken: timeTaken,
                    violations: antiCheat.violations,
                    submitted_at: new Date().toISOString(),
                    answers: selectedAnswers,
                })
                .eq("student_id", profile.id)
                .eq("quiz_id", quizId);

            // Calculate rank
            const { data: allAttempts } = await supabase
                .from("student_quiz")
                .select("student_id, score, time_taken")
                .eq("quiz_id", quizId)
                .not("submitted_at", "is", null)
                .order("score", { ascending: false })
                .order("time_taken", { ascending: true });

            if (allAttempts) {
                for (let i = 0; i < allAttempts.length; i++) {
                    await supabase
                        .from("student_quiz")
                        .update({ rank: i + 1 })
                        .eq("student_id", allAttempts[i].student_id)
                        .eq("quiz_id", quizId);
                }
            }
        }

        setResult({
            score,
            total: questions.length,
            timeTaken,
            violations: antiCheat.violations,
            answers: selectedAnswers,
            weaknessAnalysis,
        });

        setPhase("results");
        setSubmitting(false);
    };

    const handleTimeUp = useCallback(() => {
        if (!hasSubmittedRef.current) {
            toast("⏰ Time's up! Auto-submitting...");
            handleSubmitQuiz();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Loading
    if (phase === "loading") {
        return (
            <div className="min-h-screen gradient-bg">
                <Navbar />
                <div className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 64px)" }}>
                    <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    // Instructions
    if (phase === "instructions" && quiz) {
        return (
            <div className="min-h-screen gradient-bg">
                <Navbar />
                <div className="max-w-2xl mx-auto px-4 py-12">
                    <div className="glass-card p-8 animate-fade-in-up gradient-border">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-xl">
                                <HiShieldCheck className="text-white text-3xl" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-1">
                                {quiz.topic}
                            </h1>
                            <p className="text-gray-400">Read the instructions before starting</p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <InfoRow
                                icon={<HiClock className="text-indigo-400" />}
                                label="Duration"
                                value={`${quiz.duration} minutes`}
                            />
                            <InfoRow
                                icon={<HiQuestionMarkCircle className="text-cyan-400" />}
                                label="Questions"
                                value={`${questions.length} MCQ questions`}
                            />
                            <InfoRow
                                icon={<HiShieldCheck className="text-emerald-400" />}
                                label="Secure Mode"
                                value="Fullscreen required"
                            />
                        </div>

                        <div className="glass-card p-4 mb-8">
                            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                                <HiExclamation className="text-amber-400" /> Rules
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    The quiz must be taken in fullscreen mode
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    Tab switching or minimizing will count as violations
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    After 5 violations, the quiz will be auto-submitted
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    Copy/paste and right-click are disabled
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    Quiz will auto-submit when time runs out
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    Your answers are auto-saved as you progress
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={handleStartQuiz}
                            className="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2"
                        >
                            Start Quiz <HiArrowRight />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Taking Quiz
    if (phase === "taking" && quiz) {
        const q = questions[currentQuestion];
        const answeredCount = Object.keys(selectedAnswers).length;
        const progress = (answeredCount / questions.length) * 100;

        return (
            <div className="min-h-screen gradient-bg quiz-secure-mode">
                {/* Top Bar */}
                <div className="glass-card px-4 py-3 flex items-center justify-between" style={{ borderRadius: 0 }}>
                    <div className="flex items-center gap-4">
                        <Timer duration={quiz.duration * 60} onTimeUp={handleTimeUp} />
                        <div>
                            <p className="text-sm font-medium text-white">{quiz.topic}</p>
                            <p className="text-xs text-gray-400">
                                Question {currentQuestion + 1} of {questions.length}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {antiCheat.violations > 0 && (
                            <div className="badge badge-danger flex items-center gap-1">
                                <HiExclamation /> {antiCheat.violations}/5 violations
                            </div>
                        )}
                        {!antiCheat.isFullscreen && (
                            <button
                                onClick={antiCheat.enterFullscreen}
                                className="btn-secondary text-xs py-1 px-3"
                            >
                                Enter Fullscreen
                            </button>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>

                {/* Question */}
                <div className="max-w-3xl mx-auto px-4 py-8">
                    <div className="glass-card p-8 animate-fade-in-up">
                        <p className="text-lg font-medium text-white mb-6">
                            <span className="text-indigo-400 mr-2">Q{currentQuestion + 1}.</span>
                            {q.question_text}
                        </p>

                        <div className="space-y-3">
                            {(["a", "b", "c", "d"] as const).map((opt) => {
                                const optionText = q[`option_${opt}` as keyof Question] as string;
                                const isSelected = selectedAnswers[q.id] === opt;

                                return (
                                    <button
                                        key={opt}
                                        onClick={() => handleOptionClick(q.id, opt)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-3 ${isSelected
                                                ? "border-indigo-500 bg-indigo-500/15 text-white"
                                                : "border-white/5 bg-white/3 text-gray-300 hover:border-white/15 hover:bg-white/5"
                                            }`}
                                    >
                                        <span
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${isSelected
                                                    ? "bg-indigo-500 text-white"
                                                    : "bg-white/5 text-gray-500"
                                                }`}
                                        >
                                            {opt.toUpperCase()}
                                        </span>
                                        {optionText}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-6">
                        <button
                            onClick={() => setCurrentQuestion((prev) => Math.max(prev - 1, 0))}
                            disabled={currentQuestion === 0}
                            className="btn-secondary flex items-center gap-1 disabled:opacity-30"
                        >
                            <HiArrowLeft /> Previous
                        </button>

                        {/* Question indicators */}
                        <div className="hidden sm:flex gap-1.5 flex-wrap justify-center max-w-md">
                            {questions.map((q, i) => (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentQuestion(i)}
                                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${currentQuestion === i
                                            ? "bg-indigo-500 text-white scale-110"
                                            : selectedAnswers[q.id]
                                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/20"
                                                : "bg-white/5 text-gray-500 border border-white/5"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        {currentQuestion === questions.length - 1 ? (
                            <button
                                onClick={handleSubmitQuiz}
                                disabled={submitting}
                                className="btn-success flex items-center gap-1"
                            >
                                {submitting ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Submit Quiz</>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={() =>
                                    setCurrentQuestion((prev) =>
                                        Math.min(prev + 1, questions.length - 1)
                                    )
                                }
                                className="btn-primary flex items-center gap-1"
                            >
                                Next <HiArrowRight />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Results
    if (phase === "results" && result) {
        const percentage = Math.round((result.score / result.total) * 100);
        const getGrade = () => {
            if (percentage >= 90) return { grade: "A+", color: "text-emerald-400", msg: "Outstanding! 🌟" };
            if (percentage >= 80) return { grade: "A", color: "text-emerald-400", msg: "Excellent! 🎉" };
            if (percentage >= 70) return { grade: "B", color: "text-cyan-400", msg: "Great job! 👏" };
            if (percentage >= 60) return { grade: "C", color: "text-amber-400", msg: "Good effort! 💪" };
            if (percentage >= 50) return { grade: "D", color: "text-orange-400", msg: "Keep practicing! 📚" };
            return { grade: "F", color: "text-red-400", msg: "Need improvement 📖" };
        };
        const gradeInfo = getGrade();

        return (
            <div className="min-h-screen gradient-bg">
                <Navbar />
                <div className="max-w-3xl mx-auto px-4 py-8">
                    {/* Score Card */}
                    <div className="glass-card p-8 text-center mb-6 animate-fade-in-up gradient-border">
                        <h1 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h1>
                        <p className="text-gray-400 mb-6">{gradeInfo.msg}</p>

                        <div className="flex items-center justify-center gap-8 mb-6">
                            <div>
                                <p className={`text-6xl font-bold ${gradeInfo.color}`}>
                                    {gradeInfo.grade}
                                </p>
                                <p className="text-gray-400 text-sm mt-1">Grade</p>
                            </div>
                            <div className="w-px h-16 bg-white/10" />
                            <div>
                                <p className="text-4xl font-bold text-white">
                                    {result.score}/{result.total}
                                </p>
                                <p className="text-gray-400 text-sm mt-1">Score ({percentage}%)</p>
                            </div>
                        </div>

                        <div className="flex justify-center gap-6 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                                <HiClock className="text-indigo-400" />
                                {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s
                            </span>
                            <span className="flex items-center gap-1">
                                <HiExclamation className={result.violations > 0 ? "text-red-400" : "text-emerald-400"} />
                                {result.violations} violations
                            </span>
                        </div>
                    </div>

                    {/* AI Weakness Analysis */}
                    {result.weaknessAnalysis && (
                        <div className="glass-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                            <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
                                <HiChartBar className="text-cyan-400" /> AI Performance Analysis
                            </h2>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                {result.weaknessAnalysis}
                            </p>
                        </div>
                    )}

                    {/* Question Review */}
                    <div className="space-y-4">
                        <h2 className="font-semibold text-white text-lg">Review Answers</h2>
                        {questions.map((q, i) => {
                            const studentAnswer = result.answers[q.id];
                            const isCorrect = studentAnswer === q.correct_answer;

                            return (
                                <div
                                    key={q.id}
                                    className={`glass-card p-5 border-l-4 ${isCorrect ? "border-emerald-500" : "border-red-500"
                                        } animate-fade-in-up`}
                                    style={{ animationDelay: `${0.05 * i}s` }}
                                >
                                    <div className="flex items-start gap-2 mb-3">
                                        {isCorrect ? (
                                            <HiCheckCircle className="text-emerald-400 text-xl flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <HiXCircle className="text-red-400 text-xl flex-shrink-0 mt-0.5" />
                                        )}
                                        <p className="text-white font-medium">
                                            {i + 1}. {q.question_text}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-7 mb-3">
                                        {(["a", "b", "c", "d"] as const).map((opt) => {
                                            const optText = q[`option_${opt}` as keyof Question] as string;
                                            const isCorrectOpt = opt === q.correct_answer;
                                            const isStudentOpt = opt === studentAnswer;

                                            return (
                                                <div
                                                    key={opt}
                                                    className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${isCorrectOpt
                                                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                                                            : isStudentOpt
                                                                ? "bg-red-500/15 text-red-300 border border-red-500/20"
                                                                : "bg-white/3 text-gray-500 border border-white/5"
                                                        }`}
                                                >
                                                    <span className="uppercase font-bold text-xs">{opt}.</span>
                                                    {optText}
                                                    {isCorrectOpt && <HiCheckCircle className="ml-auto text-emerald-400" />}
                                                    {isStudentOpt && !isCorrectOpt && (
                                                        <HiXCircle className="ml-auto text-red-400" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {q.explanation && (
                                        <div className="ml-7 text-xs text-cyan-300 bg-cyan-500/8 rounded-lg p-3 border border-cyan-500/10 flex items-start gap-2">
                                            <HiLightBulb className="flex-shrink-0 mt-0.5" />
                                            {q.explanation}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Back to Dashboard */}
                    <div className="text-center mt-8">
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="btn-primary px-8 py-3"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

function InfoRow({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between glass-card p-3">
            <div className="flex items-center gap-2 text-sm text-gray-300">
                {icon} {label}
            </div>
            <span className="text-sm font-medium text-white">{value}</span>
        </div>
    );
}

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
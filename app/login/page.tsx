"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";
import toast from "react-hot-toast";
import { HiMail, HiLockClosed, HiUser, HiAcademicCap } from "react-icons/hi";

export default function LoginPage() {
    const [isSignup, setIsSignup] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"teacher" | "student">("student");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            toast.success("Welcome back! 🎉");
            router.push("/dashboard");
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) {
                toast.error(authError.message);
                return;
            }

            if (authData.user) {
                const { error: profileError } = await supabase.from("profiles").insert({
                    id: authData.user.id,
                    name,
                    email,
                    role,
                });

                if (profileError) {
                    toast.error(profileError.message);
                    return;
                }
            }

            toast.success("Account created! Welcome! 🎉");
            router.push("/dashboard");
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen gradient-bg">
            <Navbar />

            <div className="flex justify-center items-center px-4" style={{ minHeight: "calc(100vh - 64px)" }}>
                <div className="glass-card p-8 w-full max-w-md animate-fade-in-up">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg">
                            <HiAcademicCap className="text-white text-3xl" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">
                            {isSignup ? "Create Account" : "Welcome Back"}
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">
                            {isSignup
                                ? "Join QuizMaster AI today"
                                : "Sign in to your account"}
                        </p>
                    </div>

                    <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
                        {isSignup && (
                            <div className="relative">
                                <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input-field pl-11"
                                    required
                                />
                            </div>
                        )}

                        <div className="relative">
                            <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field pl-11"
                                required
                            />
                        </div>

                        <div className="relative">
                            <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field pl-11"
                                required
                                minLength={6}
                            />
                        </div>

                        {isSignup && (
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">I am a...</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRole("teacher")}
                                        className={`p-3 rounded-xl border text-center transition-all ${role === "teacher"
                                                ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                                                : "border-white/10 bg-white/3 text-gray-400 hover:border-white/20"
                                            }`}
                                    >
                                        <span className="text-2xl block mb-1">👨‍🏫</span>
                                        <span className="text-sm font-medium">Teacher</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole("student")}
                                        className={`p-3 rounded-xl border text-center transition-all ${role === "student"
                                                ? "border-cyan-500 bg-cyan-500/10 text-cyan-300"
                                                : "border-white/10 bg-white/3 text-gray-400 hover:border-white/20"
                                            }`}
                                    >
                                        <span className="text-2xl block mb-1">👨‍🎓</span>
                                        <span className="text-sm font-medium">Student</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : isSignup ? (
                                "Create Account"
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    {/* Toggle signup/login */}
                    <div className="text-center mt-6">
                        <p className="text-gray-400 text-sm">
                            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                            <button
                                onClick={() => setIsSignup(!isSignup)}
                                className="text-indigo-400 hover:text-indigo-300 font-medium transition"
                            >
                                {isSignup ? "Sign In" : "Sign Up"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import {
    HiHome,
    HiAcademicCap,
    HiChartBar,
    HiLogin,
    HiLogout,
    HiViewGrid,
} from "react-icons/hi";

export default function Navbar() {
    const { user, profile, loading, signOut } = useAuth();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    return (
        <nav className="glass-card sticky top-0 z-50" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/30 transition-shadow">
                            <HiAcademicCap className="text-white text-lg" />
                        </div>
                        <span className="text-xl font-bold gradient-text">QuizMaster</span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-1">
                        <NavLink href="/" icon={<HiHome />} label="Home" />
                        {!loading && user && profile && (
                            <>
                                <NavLink href="/dashboard" icon={<HiViewGrid />} label="Dashboard" />
                                <NavLink href="/leaderboard" icon={<HiChartBar />} label="Leaderboard" />
                            </>
                        )}
                    </div>

                    {/* Auth section */}
                    <div className="hidden md:flex items-center gap-3">
                        {loading ? (
                            <div className="w-20 h-8 rounded-lg animate-shimmer" />
                        ) : user && profile ? (
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-white">{profile.name}</p>
                                    <p className="text-xs text-indigo-300 capitalize">{profile.role}</p>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                                    {profile.name.charAt(0).toUpperCase()}
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="btn-secondary flex items-center gap-1 text-sm py-2 px-3"
                                >
                                    <HiLogout /> Logout
                                </button>
                            </div>
                        ) : (
                            <Link href="/login" className="btn-primary flex items-center gap-1 text-sm">
                                <HiLogin /> Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile burger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 rounded-lg text-white hover:bg-white/5 transition"
                    >
                        {mobileOpen ? <HiX size={24} /> : <HiMenu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-white/5 px-4 py-4 space-y-2 animate-fade-in-up">
                    <MobileLink href="/" label="Home" onClick={() => setMobileOpen(false)} />
                    {!loading && user && profile && (
                        <>
                            <MobileLink href="/dashboard" label="Dashboard" onClick={() => setMobileOpen(false)} />
                            <MobileLink href="/leaderboard" label="Leaderboard" onClick={() => setMobileOpen(false)} />
                        </>
                    )}
                    {!loading && !user && (
                        <MobileLink href="/login" label="Login" onClick={() => setMobileOpen(false)} />
                    )}
                    {!loading && user && (
                        <button
                            onClick={() => { handleSignOut(); setMobileOpen(false); }}
                            className="w-full text-left px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition"
                        >
                            Logout
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
        >
            {icon}
            {label}
        </Link>
    );
}

function MobileLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="block px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition"
        >
            {label}
        </Link>
    );
}
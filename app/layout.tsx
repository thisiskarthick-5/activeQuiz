import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

export const dynamic = "force-dynamic";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuizMaster AI - Smart Assessment Platform",
  description:
    "AI-Powered Online Quiz & Assessment Platform with secure exam environment, personalized questions, and real-time analytics.",
  keywords: "quiz, assessment, AI, online exam, education, leaderboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {/* Ambient glow orbs */}
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "rgba(20, 20, 35, 0.95)",
                color: "#f0f0f5",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                borderRadius: "12px",
                backdropFilter: "blur(10px)",
              },
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}

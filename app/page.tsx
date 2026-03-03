import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  HiLightningBolt,
  HiShieldCheck,
  HiChartBar,
  HiSparkles,
  HiUserGroup,
  HiClock,
} from "react-icons/hi";

export default function Home() {
  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-300 text-sm mb-8 animate-fade-in-up">
              <HiSparkles className="text-base" />
              AI-Powered Assessment Platform
            </div>

            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              Smart Quizzes.
              <br />
              <span className="gradient-text">Smarter Results.</span>
            </h1>

            <p
              className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              Create AI-generated assessments, conduct secure online exams, and
              analyze student performance — all in one platform.
            </p>

            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              <Link href="/login" className="btn-primary text-lg px-8 py-3">
                Get Started
              </Link>
              <Link
                href="/quiz/join"
                className="btn-secondary text-lg px-8 py-3"
              >
                Join a Quiz
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              A complete assessment ecosystem for teachers and students
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            <FeatureCard
              icon={<HiSparkles className="text-2xl" />}
              title="AI Question Generation"
              description="Generate unique MCQ questions with explanations using Gemini AI. No two students get the same set."
              gradient="from-indigo-500 to-purple-600"
            />
            <FeatureCard
              icon={<HiShieldCheck className="text-2xl" />}
              title="Anti-Cheating System"
              description="Fullscreen enforcement, tab-switch detection, and violation tracking keep exams secure."
              gradient="from-emerald-500 to-teal-600"
            />
            <FeatureCard
              icon={<HiChartBar className="text-2xl" />}
              title="Performance Analytics"
              description="AI-powered weakness analysis, question-wise accuracy, and class performance insights."
              gradient="from-cyan-500 to-blue-600"
            />
            <FeatureCard
              icon={<HiLightningBolt className="text-2xl" />}
              title="Real-time Leaderboard"
              description="Instant rankings based on score, time taken, and integrity. Motivate students to excel."
              gradient="from-amber-500 to-orange-600"
            />
            <FeatureCard
              icon={<HiUserGroup className="text-2xl" />}
              title="Role-Based Access"
              description="Dedicated dashboards for teachers to create quizzes and students to take assessments."
              gradient="from-pink-500 to-rose-600"
            />
            <FeatureCard
              icon={<HiClock className="text-2xl" />}
              title="Timed Assessments"
              description="Set start/end windows, countdown timers, and auto-submit when time runs out."
              gradient="from-violet-500 to-indigo-600"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="glass-card p-12 gradient-border">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Transform Assessments?
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Join thousands of educators using AI to create better, fairer exams.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/login" className="btn-primary text-lg px-8 py-3">
                Start as Teacher 👨‍🏫
              </Link>
              <Link
                href="/login"
                className="btn-secondary text-lg px-8 py-3"
              >
                Join as Student 👨‍🎓
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2026 QuizMaster AI. Built with Next.js, Supabase & Gemini AI.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="glass-card glass-card-hover p-6 transition-all duration-300">
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4 shadow-lg`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
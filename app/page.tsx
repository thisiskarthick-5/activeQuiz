import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center mt-32">
        <h1 className="text-5xl font-bold mb-6">
          Online Quiz Platform
        </h1>
        <p className="text-gray-400 text-lg">
          Create quizzes. Track results. Compete on leaderboard.
        </p>
      </div>
    </div>
  );
}
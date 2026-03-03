import Navbar from "@/components/Navbar";

export default function Leaderboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <div className="p-10">
        <h1 className="text-3xl font-bold mb-6">
          Leaderboard
        </h1>

        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex justify-between border-b border-gray-700 pb-2 mb-4">
            <span>Rank</span>
            <span>Name</span>
            <span>Score</span>
          </div>

          <div className="flex justify-between py-2">
            <span>🥇 1</span>
            <span>Alice</span>
            <span>95</span>
          </div>

          <div className="flex justify-between py-2">
            <span>🥈 2</span>
            <span>Bob</span>
            <span>90</span>
          </div>

          <div className="flex justify-between py-2">
            <span>🥉 3</span>
            <span>Charlie</span>
            <span>85</span>
          </div>
        </div>
      </div>
    </div>
  );
}
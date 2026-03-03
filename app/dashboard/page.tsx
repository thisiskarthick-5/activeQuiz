import Navbar from "@/components/Navbar";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <div className="p-10">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold">Create Quiz</h2>
            <p className="text-gray-400 mt-2">Design new assessments</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold">View Quizzes</h2>
            <p className="text-gray-400 mt-2">Manage existing quizzes</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold">Analytics</h2>
            <p className="text-gray-400 mt-2">Track performance insights</p>
          </div>
        </div>
      </div>
    </div>
  );
}
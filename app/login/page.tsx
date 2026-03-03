import Navbar from "@/components/Navbar";

export default function Login() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <div className="flex justify-center items-center mt-32">
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-96">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Login
          </h2>

          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-4 bg-gray-700 rounded"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-4 bg-gray-700 rounded"
          />

          <button className="w-full bg-blue-500 p-2 rounded hover:bg-blue-600 transition">
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
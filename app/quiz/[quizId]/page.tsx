"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Timer from "@/components/Timer";

interface Question {
  question: string;
  options: string[];
  answer: number; // correct option index
}

export default function QuizPage({ params }: { params: { quizId: string } }) {
  // Sample Questions (Later from DB)
  const questions: Question[] = [
    {
      question: "What is Next.js?",
      options: ["Backend Language", "React Framework", "Database", "CSS Library"],
      answer: 1,
    },
    {
      question: "Which hook is used for state?",
      options: ["useFetch", "useRouter", "useState", "useEffect"],
      answer: 2,
    },
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [timeUp, setTimeUp] = useState(false);

  // Auto submit when time is up
  useEffect(() => {
    if (timeUp) handleSubmit();
  }, [timeUp]);

  const handleOptionClick = (index: number) => {
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[currentQuestion] = index;
    setSelectedAnswers(updatedAnswers);
  };

  const handleSubmit = () => {
    let calculatedScore = 0;

    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.answer) {
        calculatedScore++;
      }
    });

    setScore(calculatedScore);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <div className="p-10 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">
          Quiz ID: {params.quizId}
        </h1>

        {/* Timer */}
        <Timer duration={60} />

        {/* Score Display */}
        {score !== null ? (
          <div className="mt-8 bg-gray-800 p-6 rounded-xl text-center">
            <h2 className="text-2xl font-bold">
              🎉 Your Score: {score} / {questions.length}
            </h2>
          </div>
        ) : (
          <>
            {/* Question Card */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg mt-6">
              <p className="mb-4 text-lg">
                {currentQuestion + 1}. {questions[currentQuestion].question}
              </p>

              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(index)}
                    className={`w-full p-2 rounded transition ${
                      selectedAnswers[currentQuestion] === index
                        ? "bg-blue-600"
                        : "bg-gray-700 hover:bg-blue-500"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() =>
                  setCurrentQuestion((prev) => Math.max(prev - 1, 0))
                }
                className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
              >
                Previous
              </button>

              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="bg-green-600 px-4 py-2 rounded hover:bg-green-500"
                >
                  Submit
                </button>
              ) : (
                <button
                  onClick={() =>
                    setCurrentQuestion((prev) =>
                      Math.min(prev + 1, questions.length - 1)
                    )
                  }
                  className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
                >
                  Next
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
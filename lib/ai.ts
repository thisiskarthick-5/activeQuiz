import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIGeneratedQuestion } from './types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateQuizQuestions(
    topic: string,
    numQuestions: number,
    difficulty: string
): Promise<AIGeneratedQuestion[]> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Generate exactly ${numQuestions} multiple choice questions about "${topic}" at ${difficulty} difficulty level.

Return ONLY a valid JSON array with no markdown formatting, no code blocks, no extra text.

Each object in the array must have exactly these fields:
- "question_text": the question string
- "option_a": first option
- "option_b": second option
- "option_c": third option
- "option_d": fourth option
- "correct_answer": one of "a", "b", "c", or "d"
- "explanation": a brief explanation of why the correct answer is right

Example format:
[
  {
    "question_text": "What is...?",
    "option_a": "Option 1",
    "option_b": "Option 2",
    "option_c": "Option 3",
    "option_d": "Option 4",
    "correct_answer": "a",
    "explanation": "Because..."
  }
]

Generate exactly ${numQuestions} questions. Return ONLY the JSON array.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Clean the response - remove markdown code blocks if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    const questions: AIGeneratedQuestion[] = JSON.parse(cleanedText);
    return questions;
}

export async function analyzeWeakness(
    questions: { question_text: string; correct_answer: string; student_answer: string }[]
): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const wrongAnswers = questions.filter(q => q.student_answer !== q.correct_answer);

    if (wrongAnswers.length === 0) {
        return 'Excellent performance! No weak areas detected.';
    }

    const prompt = `A student answered the following questions incorrectly in a quiz. Analyze their mistakes and identify weak topics/areas they should improve on. Be concise and helpful.

Wrong answers:
${wrongAnswers.map((q, i) => `${i + 1}. Question: "${q.question_text}" — Student chose: "${q.student_answer}", Correct: "${q.correct_answer}"`).join('\n')}

Provide a brief analysis (2-3 sentences) of the student's weak areas and what they should study.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
}

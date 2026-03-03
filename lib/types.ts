export interface Profile {
    id: string;
    name: string;
    email: string;
    role: 'teacher' | 'student';
    created_at: string;
}

export interface Quiz {
    id: string;
    teacher_id: string;
    topic: string;
    duration: number; // minutes
    start_time: string;
    end_time: string;
    quiz_code: string;
    difficulty: 'easy' | 'medium' | 'hard';
    num_questions: number;
    randomize: boolean;
    created_at: string;
}

export interface Question {
    id: string;
    quiz_id: string;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: 'a' | 'b' | 'c' | 'd';
    explanation: string;
}

export interface StudentQuiz {
    id: string;
    student_id: string;
    quiz_id: string;
    answers: Record<string, string>; // question_id -> selected option
    score: number | null;
    time_taken: number | null; // seconds
    violations: number;
    rank: number | null;
    submitted_at: string | null;
    started_at: string;
}

export interface LeaderboardEntry {
    rank: number;
    student_name: string;
    score: number;
    time_taken: number;
    violations: number;
}

export interface AIGeneratedQuestion {
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: 'a' | 'b' | 'c' | 'd';
    explanation: string;
}

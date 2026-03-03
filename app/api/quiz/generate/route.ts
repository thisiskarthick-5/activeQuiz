import { generateQuizQuestions } from '@/lib/ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { topic, numQuestions, difficulty } = await request.json();

        if (!topic || !numQuestions) {
            return NextResponse.json(
                { error: 'Topic and number of questions are required' },
                { status: 400 }
            );
        }

        const questions = await generateQuizQuestions(
            topic,
            numQuestions,
            difficulty || 'medium'
        );

        return NextResponse.json({ questions });
    } catch (error) {
        console.error('Quiz generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate questions. Please try again.' },
            { status: 500 }
        );
    }
}

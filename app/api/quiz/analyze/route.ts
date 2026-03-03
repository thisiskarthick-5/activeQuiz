import { analyzeWeakness } from '@/lib/ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { wrongQuestions } = await request.json();

        if (!wrongQuestions || !Array.isArray(wrongQuestions)) {
            return NextResponse.json(
                { error: 'Wrong questions data is required' },
                { status: 400 }
            );
        }

        const analysis = await analyzeWeakness(wrongQuestions);
        return NextResponse.json({ analysis });
    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json(
            { analysis: 'Analysis unavailable at this time.' },
            { status: 200 }
        );
    }
}

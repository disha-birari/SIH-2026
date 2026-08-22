import { NextResponse } from 'next/server';
import { generateStructuredRAGAnswer } from '@/lib/ragEngine';
import { checkOllamaAvailability, queryOllamaLocal } from '@/lib/ollamaClient';
import { UserPersona } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { query, persona = 'manufacturer', preferredModel } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Check Ollama status
    const ollamaStatus = await checkOllamaAvailability();
    let engineUsed: 'Ollama (Local LLM)' | 'Gemini / Neural Grounded RAG' = 'Gemini / Neural Grounded RAG';
    let modelName = 'Neural BIS Grounded RAG';

    if (ollamaStatus.isAvailable) {
      engineUsed = 'Ollama (Local LLM)';
      modelName = preferredModel || ollamaStatus.activeModel || 'llama3:latest';

      const ollamaResponse = await queryOllamaLocal(
        `System: You are an official Indian Standards & BIS AI Assistant. Answer grounded strictly in official BIS standards.\nQuestion: ${query}`,
        modelName
      );

      if (!ollamaResponse) {
        engineUsed = 'Gemini / Neural Grounded RAG';
        modelName = 'Neural BIS Grounded RAG (Fallback)';
      }
    }

    // Generate accurate, highly detailed, grounded answer matching user query
    const payload = generateStructuredRAGAnswer(query, persona as UserPersona, engineUsed, modelName);
    return NextResponse.json(payload);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

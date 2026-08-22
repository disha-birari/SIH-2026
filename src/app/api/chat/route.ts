import { NextResponse } from 'next/server';
import { generateStructuredRAGAnswer } from '@/lib/ragEngine';
import { checkOllamaAvailability, queryOllamaLocal, queryGeminiAPI, queryOpenRouterAPI } from '@/lib/ollamaClient';
import { UserPersona } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { query, persona = 'manufacturer', preferredModel } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Check Ollama, Gemini and OpenRouter status for multi-pipeline LLM routing
    const ollamaStatus = await checkOllamaAvailability();
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    
    let engineUsed: 'Ollama (Local LLM)' | 'Gemini (Cloud API)' | 'OpenRouter (Cloud API)' | 'Gemini / Neural Grounded RAG' = 'Gemini / Neural Grounded RAG';
    let modelName = 'Neural BIS Grounded RAG';
    let llmResponse = '';

    // Pipeline 1: Local Ollama
    if (ollamaStatus.isAvailable) {
      engineUsed = 'Ollama (Local LLM)';
      modelName = preferredModel || ollamaStatus.activeModel || 'llama3:latest';
      try {
        const ollamaRes = await queryOllamaLocal(
          `System: You are an official Indian Standards & BIS AI Assistant. Answer grounded strictly in official BIS standards.\nQuestion: ${query}`,
          modelName
        );
        if (ollamaRes) {
          llmResponse = ollamaRes;
        }
      } catch (err) {
        console.warn('Ollama chat pipeline failed. Falling back...');
      }
    }

    // Pipeline 2: Google Gemini Cloud API
    if (!llmResponse && geminiApiKey) {
      engineUsed = 'Gemini (Cloud API)';
      modelName = 'gemini-1.5-flash';
      try {
        const geminiRes = await queryGeminiAPI(
          `System: You are an official Indian Standards & BIS AI Assistant. Answer grounded strictly in official BIS standards.\nQuestion: ${query}`,
          geminiApiKey
        );
        if (geminiRes) {
          llmResponse = geminiRes;
        }
      } catch (err) {
        console.warn('Gemini cloud chat pipeline failed. Falling back...');
      }
    }

    // Pipeline 3: OpenRouter API
    if (!llmResponse && openrouterApiKey) {
      engineUsed = 'OpenRouter (Cloud API)';
      modelName = 'gemini-2.0-flash-exp';
      try {
        const openrouterRes = await queryOpenRouterAPI(
          `System: You are an official Indian Standards & BIS AI Assistant. Answer grounded strictly in official BIS standards.\nQuestion: ${query}`,
          openrouterApiKey
        );
        if (openrouterRes) {
          llmResponse = openrouterRes;
        }
      } catch (err) {
        console.warn('OpenRouter cloud chat pipeline failed. Falling back...');
      }
    }

    // Pipeline 4: Fallback (Internal neural rules & database matching)
    // Generate accurate, highly detailed, grounded answer matching user query
    const payload = generateStructuredRAGAnswer(query, persona as UserPersona, engineUsed as any, modelName);
    
    // Override the summary explanation with LLM response if generated
    if (llmResponse) {
      payload.summaryExplanation = llmResponse;
    }

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

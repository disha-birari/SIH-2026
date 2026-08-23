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

    let ollamaResponse: string | null = null;

    if (ollamaStatus.isAvailable) {
      engineUsed = 'Ollama (Local LLM)';
      modelName = preferredModel || ollamaStatus.activeModel || 'llama3:latest';

      const prompt = [
        "You are an expert Indian Standards & BIS (Bureau of Indian Standards) AI Assistant.",
        "Answer the user question in simple, clear, easy-to-understand English.",
        "CRITICAL FORMATTING RULES:",
        "- DO NOT write long continuous paragraphs.",
        "- Use double line breaks between numbered sections and bullet points.",
        "- Always format steps and lists using clean bullet points like 'Step 1:', 'Step 2:'.",
        "",
        `User Role: ${persona}`,
        `Question: ${query}`,
        "",
        "Structure your output strictly as follows:",
        "",
        "📌 1. Applicable BIS Standard & Mandatory Status:",
        "- IS Code & Title",
        "- Mandatory QCO / CRS Scheme status",
        "",
        "🧪 2. Key Technical Safety & Testing Requirements:",
        "- Safety & technical parameters",
        "",
        "📄 3. Required Documents:",
        "- Essential manufacturing & lab test certificates",
        "",
        "🚀 4. Step-by-Step Licensing Procedure:",
        "- Step 1:",
        "- Step 2:",
        "- Step 3:",
        "",
        "⚠️ 5. Non-Compliance Penalty:",
        "- Section 29 penalty of BIS Act 2016"
      ].join('\n');

      ollamaResponse = await queryOllamaLocal(prompt, modelName);

      if (!ollamaResponse) {
        engineUsed = 'Gemini / Neural Grounded RAG';
        modelName = 'Neural BIS Grounded RAG (Fallback)';
      }
    }

    // Generate accurate, highly detailed, grounded answer matching user query
    const payload = generateStructuredRAGAnswer(query, persona as UserPersona, engineUsed, modelName, ollamaResponse);
    return NextResponse.json(payload);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

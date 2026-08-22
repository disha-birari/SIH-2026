import { NextResponse } from 'next/server';
import { getDynamicStandards } from '@/lib/data/bisDatabase';
import { calculateSemanticRelevance } from '@/lib/ragEngine';

export async function POST(req: Request) {
  try {
    const { productName, material, usage, businessType } = await req.json();

    const query = `${productName || ''} ${material || ''} ${usage || ''}`;
    const currentStandards = getDynamicStandards();
    
    const matched = currentStandards.map(std => {
      let score = calculateSemanticRelevance(query, std);
      if (material && std.scope.toLowerCase().includes(material.toLowerCase())) score += 15;
      if (usage && std.scope.toLowerCase().includes(usage.toLowerCase())) score += 15;
      return { standard: std, matchScore: Math.min(99, Math.max(30, score * 1.8 + 25)) };
    }).sort((a, b) => b.matchScore - a.matchScore);

    const primaryMatch = matched[0];

    return NextResponse.json({
      query: { productName, material, usage, businessType },
      primaryMatch: primaryMatch.standard,
      matchConfidence: Math.round(primaryMatch.matchScore),
      secondaryMatches: matched.slice(1, 3).map(m => m.standard),
      recommendations: [
        `Verify if product capacity aligns with ${primaryMatch.standard.isNumber} scope.`,
        `Required testing scheme: ${primaryMatch.standard.applicableScheme}.`,
        `Mandatory QCO Order applies: ${primaryMatch.standard.mandatoryStatus}.`
      ]
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Matcher failed' }, { status: 500 });
  }
}

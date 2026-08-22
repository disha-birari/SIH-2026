'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, ArrowRight, Shield, CheckCircle2, AlertOctagon, 
  BookOpen, Scale, Sparkles, ChevronRight, Layers
} from 'lucide-react';
import { getDynamicStandards } from '@/lib/data/bisDatabase';

export default function ExplainabilityPage() {
  const standards = getDynamicStandards();
  const [selectedId, setSelectedId] = useState<string>(standards[0]?.id || 'is-302-2-3');
  const selected = standards.find(s => s.id === selectedId) || standards[0];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              BIS Statutory Logic
            </span>
            <span className="text-purple-200 text-xs font-semibold">Transparent Legal & Safety Logic Tree</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Statutory Compliance & Explainability Engine
          </h1>
          <p className="text-purple-100 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            Understand the exact legal order, hazard prevention logic, and statutory authority under the BIS Act 2016 behind every compliance requirement and standard assignment.
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href="/evidence-verifier" className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1 border border-white/20">
            <span>Evidence Verifier</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Select Standard to Inspect Reasoning */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <HelpCircle className="w-6 h-6 text-purple-600 flex-shrink-0" />
          <div>
            <label className="text-[11px] font-extrabold uppercase text-slate-500 block">Select Standard to Trace Logic</label>
            <select 
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold rounded-lg p-2.5 mt-0.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              {standards.map(s => (
                <option key={s.id} value={s.id}>
                  {s.isNumber} - {s.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 px-4 py-2 rounded-xl text-purple-900 text-xs font-bold">
          Statutory Authority: BIS Act 2016 Section 16 & 17
        </div>
      </div>

      {/* Step-by-Step Reasoning Flow Tree */}
      <div className="space-y-4">
        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Multi-stage Reasoning Breakdown for {selected.isNumber}</span>
        </h2>

        {/* Step 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-4">
          <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0">
            1
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-purple-700 tracking-wider">Product Categorization & Hazard Risk Assessment</span>
            <h3 className="font-extrabold text-slate-900 text-sm">Why is this product subjected to {selected.isNumber}?</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Product operates under public hazard scope: {selected.scope}. Electrocution, shock, overheating, or physical injury hazards require mandatory standardization under Bureau of Indian Standards guidelines.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-4">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0">
            2
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-indigo-700 tracking-wider">Legal Quality Control Order (QCO) Gazette Mandate</span>
            <h3 className="font-extrabold text-slate-900 text-sm">Why is certification mandatory vs voluntary?</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Status: <strong>{selected.mandatoryStatus}</strong> under Scheme: <strong>{selected.applicableScheme}</strong>. Issued via Official Gazette Notification under Ministry of Consumer Affairs / DPIIT to prevent substandard imports and substandard domestic manufacturing.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-4">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0">
            3
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">Technical Clause Rationale</span>
            <h3 className="font-extrabold text-slate-900 text-sm">Why are specific testing parameters enforced?</h3>
            <div className="space-y-2 pt-1">
              {selected.clauseReferences.map((ref, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs space-y-0.5">
                  <span className="font-bold text-emerald-800">{ref.clause}:</span>
                  <span className="text-slate-700 ml-1">{ref.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-4">
          <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0">
            4
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-amber-700 tracking-wider">Consumer & Economic Protection Value</span>
            <h3 className="font-extrabold text-slate-900 text-sm">What protection does this provide to end consumers?</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Guarantees that uncertified items cannot be imported or sold on e-commerce marketplaces without valid ISI mark or CRS registration number (R-XXXXXXXX), protecting public safety and brand authenticity.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}

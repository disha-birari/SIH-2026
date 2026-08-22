'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Cpu, Send, Shield, CheckCircle2, AlertTriangle, ExternalLink, 
  ThumbsUp, ThumbsDown, BookOpen, Layers, Sparkles, FileText, RefreshCw 
} from 'lucide-react';
import { AIResponsePayload, UserPersona } from '@/lib/types';
import { saveFeedbackLocal } from '@/lib/firebase';

function AssistantContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [persona, setPersona] = useState<UserPersona>('manufacturer');
  const [isLoading, setIsLoading] = useState(false);
  const [responsePayload, setResponsePayload] = useState<AIResponsePayload | null>(null);
  const [feedbackSent, setFeedbackSent] = useState<boolean | null>(null);

  const samplePrompts = [
    "What BIS standards apply to electric irons?",
    "Is ISI mark mandatory for motorcycle helmets?",
    "What are the testing parameters for packaged drinking water?",
    "CRS registration process for LED lamps",
    "Requirements for Fe 500 grade TMT steel bars"
  ];

  const handleSearch = async (queryText?: string) => {
    const textToSearch = queryText || query;
    if (!textToSearch.trim()) return;

    setIsLoading(true);
    setFeedbackSent(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSearch, persona })
      });
      const data = await res.json();
      setResponsePayload(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleFeedback = (isHelpful: boolean) => {
    if (!responsePayload) return;
    saveFeedbackLocal(query, isHelpful);
    setFeedbackSent(isHelpful);
  };

  return (
    <div className="space-y-6 w-full bg-white">
      
      {/* Header Bar */}
      <div className="gov-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-orange-500 bg-white">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-orange-600" />
            <span>AI-Powered BIS Intelligent Assistant</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Official Grounded Retrieval-Augmented Generation (RAG) backed by Bureau of Indian Standards clauses.
          </p>
        </div>

        {/* Persona Buttons */}
        <div className="flex items-center space-x-1 bg-orange-50 p-1 rounded-xl border border-orange-200">
          {(['manufacturer', 'msme', 'consumer', 'importer'] as UserPersona[]).map((p) => (
            <button
              key={p}
              onClick={() => setPersona(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black capitalize transition-all ${
                persona === p 
                  ? 'orange-gradient-btn shadow-sm' 
                  : 'text-slate-700 hover:text-orange-900 hover:bg-orange-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Query Input Box */}
      <div className="gov-card p-6 space-y-4 bg-white">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ask a technical or compliance question (e.g. Which BIS standard applies to electric heaters?)"
              className="w-full px-4 py-3 bg-orange-50/40 border border-orange-200 rounded-xl text-sm text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
            />
          </div>
          <button 
            onClick={() => handleSearch()}
            disabled={isLoading || !query.trim()}
            className="orange-gradient-btn font-extrabold text-sm px-7 py-3 rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Retrieving...</span>
              </>
            ) : (
              <>
                <span>Analyze</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          <span className="text-xs font-black text-slate-500 flex items-center space-x-1 whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>Try asking:</span>
          </span>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(prompt);
                handleSearch(prompt);
              }}
              className="px-3 py-1 bg-orange-50 hover:bg-orange-100 hover:text-orange-900 text-slate-800 text-xs font-extrabold rounded-full border border-orange-200 transition-colors whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* RAG Structured AI Response View */}
      {responsePayload && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Grounding Confidence Gauge */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Confidence Gauge */}
            <div className="gov-card p-4 flex items-center space-x-4 border-l-4 border-l-emerald-600 bg-white">
              <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 font-black text-lg border border-emerald-200">
                {responsePayload.confidenceScore}%
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Grounded Confidence</p>
                <p className="text-sm font-black text-slate-900">
                  {responsePayload.confidenceScore >= 75 ? 'High Precision Match' : 'Uncertain / Specification Required'}
                </p>
                <p className="text-[11px] text-slate-500 font-semibold">Based on vector embedding similarity</p>
              </div>
            </div>

            {/* AI Engine Status */}
            <div className="gov-card p-4 flex items-center space-x-4 border-l-4 border-l-orange-500 bg-white">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-full border border-orange-200">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Inference Engine</p>
                <p className="text-sm font-black text-slate-900">{responsePayload.engineUsed}</p>
                <p className="text-[11px] text-slate-500 font-semibold">Model: {responsePayload.modelName}</p>
              </div>
            </div>

            {/* Anti-Hallucination Status */}
            <div className="gov-card p-4 flex items-center space-x-4 border-l-4 border-l-amber-500 bg-white">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-full border border-amber-200">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Source Grounding</p>
                <p className="text-sm font-black text-slate-900">Zero-Hallucination Mode</p>
                <p className="text-[11px] text-slate-500 font-semibold">Official BIS Documents Only</p>
              </div>
            </div>

          </div>

          {/* Output Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Product Overview & Dynamic Links */}
              <div className="gov-card p-6 space-y-4 bg-white">
                <div className="flex items-center justify-between border-b border-orange-100 pb-3 flex-wrap gap-2">
                  <span className="text-xs font-bold uppercase text-slate-500">Detected Product Scope</span>
                  <div className="flex items-center space-x-2">
                    <span className="bg-orange-100 text-orange-900 font-black px-3 py-1 rounded-full text-xs border border-orange-200">
                      {responsePayload.productDetected}
                    </span>
                    <a 
                      href={responsePayload.citations[0]?.officialSource || "https://www.services.bis.gov.in"} 
                      target="_blank" 
                      rel="noreferrer"
                      className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-1 rounded-full font-bold flex items-center space-x-1 shadow-sm transition"
                    >
                      <span>Official Standard PDF</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 mb-2">Executive Summary ({persona.toUpperCase()} View)</h3>
                  <p className="text-sm text-slate-900 leading-relaxed bg-orange-50/50 p-4 rounded-xl border border-orange-200 font-semibold">
                    {responsePayload.summaryExplanation}
                  </p>
                </div>

                {/* Applicable Standards & Direct Official Portal Links */}
                {responsePayload.relevantStandards.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-slate-500">Applicable Indian Standards & Official Portals</h4>
                    <div className="space-y-2">
                      {responsePayload.relevantStandards.map((std, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-orange-50/70 rounded-xl border border-orange-200 text-xs gap-2">
                          <div className="flex items-center space-x-2 font-black text-slate-900">
                            <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                            <span>{std}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2 shrink-0">
                            <a 
                              href="https://www.manakonline.in" 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-orange-700 hover:text-orange-900 font-extrabold flex items-center space-x-1 bg-white border border-orange-200 px-2.5 py-1 rounded"
                            >
                              <span>Manakonline Application</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic Feature Quick Launch Bar */}
                <div className="pt-2 border-t border-orange-100 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-extrabold uppercase text-slate-500 block w-full mb-1">Launch Dedicated Tools For This Standard:</span>
                  <a 
                    href={`/gap-analyzer`}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1"
                  >
                    <span>Run Gap Analyzer</span>
                    <ExternalLink className="w-3 h-3 text-orange-400" />
                  </a>
                  <a 
                    href={`/comparator`}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1"
                  >
                    <span>Compare Version Diff</span>
                    <ExternalLink className="w-3 h-3 text-blue-400" />
                  </a>
                  <a 
                    href={`/testing-mapper`}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1"
                  >
                    <span>View Test Equipment</span>
                    <ExternalLink className="w-3 h-3 text-emerald-400" />
                  </a>
                  <a 
                    href={`/lab-finder`}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1"
                  >
                    <span>Find NABL Labs</span>
                    <ExternalLink className="w-3 h-3 text-cyan-400" />
                  </a>
                </div>
              </div>

              {/* Technical Requirements */}
              {responsePayload.complianceRequirements.length > 0 && (
                <div className="gov-card p-6 space-y-4 bg-white">
                  <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-orange-600" />
                    <span>Technical & Compliance Requirements</span>
                  </h3>
                  <ul className="space-y-2">
                    {responsePayload.complianceRequirements.map((req, idx) => (
                      <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-900 font-bold">
                        <span className="w-5 h-5 bg-orange-100 text-orange-800 font-black text-xs rounded-full flex items-center justify-center shrink-0 mt-0.5 border border-orange-300">
                          {idx + 1}
                        </span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Roadmap */}
              {responsePayload.actionableSteps.length > 0 && (
                <div className="gov-card p-6 space-y-4 bg-white">
                  <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-emerald-600" />
                    <span>Step-by-Step BIS Guidance Roadmap</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {responsePayload.actionableSteps.map((step, idx) => (
                      <div key={idx} className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-slate-900 space-y-1">
                        <p className="font-black text-emerald-900">Step {idx + 1}</p>
                        <p className="font-bold">{step.replace(/^Step \d+:\s*/, '')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback Panel */}
              <div className="gov-card p-4 flex items-center justify-between bg-orange-50/50">
                <span className="text-xs font-extrabold text-slate-800">Was this grounded answer helpful?</span>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleFeedback(true)}
                    className={`p-2 rounded-lg border text-xs font-black flex items-center space-x-1 transition-colors ${
                      feedbackSent === true 
                        ? 'bg-emerald-600 text-white border-emerald-600' 
                        : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Yes</span>
                  </button>
                  <button 
                    onClick={() => handleFeedback(false)}
                    className={`p-2 rounded-lg border text-xs font-black flex items-center space-x-1 transition-colors ${
                      feedbackSent === false 
                        ? 'bg-rose-600 text-white border-rose-600' 
                        : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>No</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Citations Column */}
            <div className="space-y-6">
              
              <div className="gov-card p-6 space-y-4 bg-white">
                <div className="flex items-center justify-between border-b border-orange-100 pb-3">
                  <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-orange-600" />
                    <span>Official BIS Citations</span>
                  </h3>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>

                {responsePayload.citations.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No specific clause citations for this query.</p>
                ) : (
                  <div className="space-y-3">
                    {responsePayload.citations.map((cite, idx) => (
                      <div key={idx} className="p-3 bg-orange-50/60 border border-orange-200 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-orange-700 text-sm">{cite.standardNumber}</span>
                          <span className="text-[10px] bg-orange-100 text-orange-900 font-extrabold px-1.5 py-0.5 rounded">
                            {cite.clause}
                          </span>
                        </div>
                        <p className="text-slate-800 italic font-bold">"{cite.snippet}"</p>
                        <a 
                          href={cite.officialSource} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-orange-600 hover:underline flex items-center space-x-1 text-[11px] font-black pt-1"
                        >
                          <span>Official Standard Document</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Required Documents */}
              {responsePayload.requiredDocuments.length > 0 && (
                <div className="gov-card p-6 space-y-3 bg-white">
                  <h4 className="text-xs font-bold uppercase text-slate-500">Required Documents</h4>
                  <ul className="space-y-1.5 text-xs text-slate-900 font-bold">
                    {responsePayload.requiredDocuments.map((doc, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-orange-600 font-black">&bull;</span>
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-slate-500 text-sm flex items-center justify-center space-x-2">
        <RefreshCw className="w-5 h-5 animate-spin text-orange-600" />
        <span>Loading BIS Assistant...</span>
      </div>
    }>
      <AssistantContent />
    </Suspense>
  );
}

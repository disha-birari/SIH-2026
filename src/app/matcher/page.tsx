'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';
import { BISStandard } from '@/lib/types';

export default function MatcherPage() {
  const [productName, setProductName] = useState('Electric Iron');
  const [material, setMaterial] = useState('Plastic & Metal');
  const [usage, setUsage] = useState('Domestic');
  const [businessType, setBusinessType] = useState('MSME');

  const [isLoading, setIsLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<{
    primaryMatch: BISStandard;
    matchConfidence: number;
    secondaryMatches: BISStandard[];
    recommendations: string[];
  } | null>(null);

  const handleMatch = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/matcher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, material, usage, businessType })
      });
      const data = await res.json();
      setMatchResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-orange-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Search className="w-6 h-6 text-orange-600" />
            <span>Product-to-Standard Matcher</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Input product specifications to discover mandatory Indian Standards, QCO orders, and testing requirements.
          </p>
        </div>
      </div>

      {/* Filter Form Card */}
      <div className="sap-card p-6 space-y-4">
        <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider border-b border-orange-100 pb-2 flex items-center space-x-2">
          <Filter className="w-4 h-4 text-orange-600" />
          <span>Product Specifications & Scope</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Product Name</label>
            <input 
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Electric Heater, Helmet"
              className="w-full px-3 py-2 bg-orange-50/50 border border-orange-200 rounded-lg text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Primary Material</label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full px-3 py-2 bg-orange-50/50 border border-orange-200 rounded-lg text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="Plastic & Metal">Plastic & Metal</option>
              <option value="Steel & Alloy">Steel & Alloy</option>
              <option value="ABS / Fiberglass">ABS / Fiberglass</option>
              <option value="Glass & Ceramic">Glass & Ceramic</option>
              <option value="Gold / Silver">Gold / Silver</option>
              <option value="Food Grade PET / Polycarbonate">Food Grade PET / Polycarbonate</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Intended Usage</label>
            <select
              value={usage}
              onChange={(e) => setUsage(e.target.value)}
              className="w-full px-3 py-2 bg-orange-50/50 border border-orange-200 rounded-lg text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="Domestic">Domestic / Household</option>
              <option value="Commercial">Commercial / Retail</option>
              <option value="Industrial">Industrial / Construction</option>
              <option value="Medical">Medical / Healthcare</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Manufacturer Scale</label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full px-3 py-2 bg-orange-50/50 border border-orange-200 rounded-lg text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="MSME">Micro / Small / Medium (MSME)</option>
              <option value="Large Industry">Large Industry</option>
              <option value="Importer">Importer / Trader</option>
              <option value="Foreign Factory">Foreign Factory (FMCS)</option>
            </select>
          </div>

        </div>

        <button
          onClick={handleMatch}
          disabled={isLoading || !productName.trim()}
          className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md flex items-center justify-center space-x-2 transition cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Matching Vector Embeddings...</span>
            </>
          ) : (
            <>
              <span>Run Product Matcher</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Match Results Display */}
      {matchResult && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Primary Standard Card */}
          <div className="sap-card p-6 space-y-6 border-l-4 border-l-orange-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-extrabold text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full uppercase">
                  Primary Matched Standard &bull; {matchResult.matchConfidence}% Match
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">{matchResult.primaryMatch.isNumber}</h3>
                <p className="text-sm font-bold text-slate-800">{matchResult.primaryMatch.title}</p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-rose-100 text-rose-800 font-bold text-xs rounded-full border border-rose-200">
                  {matchResult.primaryMatch.mandatoryStatus}
                </span>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 font-bold text-xs rounded-full border border-orange-200">
                  {matchResult.primaryMatch.applicableScheme}
                </span>
              </div>
            </div>

            {/* Scope & Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Standard Scope & Application</h4>
                <p className="text-xs text-slate-800 leading-relaxed bg-orange-50/50 p-3 rounded-lg border border-orange-200 font-medium">
                  {matchResult.primaryMatch.scope}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Testing Parameters & Lab Tests</h4>
                <div className="space-y-1 text-xs text-slate-800 font-medium">
                  {matchResult.primaryMatch.testingParameters.map((tp, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      <span>{tp}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 pt-2 border-t border-slate-100">
              <Link
                href={`/checklist?std=${matchResult.primaryMatch.id}`}
                className="saffron-gradient hover:opacity-95 text-white font-bold text-xs px-4 py-2 rounded-lg shadow flex items-center space-x-1.5"
              >
                <span>Generate Compliance Checklist</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href={`/assistant?q=${encodeURIComponent(matchResult.primaryMatch.isNumber)}`}
                className="bg-orange-50 hover:bg-orange-100 text-orange-900 font-bold text-xs px-4 py-2 rounded-lg border border-orange-200 flex items-center space-x-1.5"
              >
                <span>Ask AI Assistant Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

          {/* Secondary Matches */}
          {matchResult.secondaryMatches.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3">Related Indian Standards</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchResult.secondaryMatches.map((sec) => (
                  <div key={sec.id} className="sap-card p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-orange-700 text-xs">{sec.isNumber}</span>
                      <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-bold">
                        {sec.mandatoryStatus}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 truncate">{sec.title}</p>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{sec.scope}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

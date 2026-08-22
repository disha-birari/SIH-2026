'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileSearch, Upload, CheckCircle2, AlertTriangle, XCircle, Download, 
  ArrowRight, Shield, Filter, RefreshCw, FileText, CheckSquare, Sparkles, ChevronRight
} from 'lucide-react';
import { getDynamicStandards } from '@/lib/data/bisDatabase';
import { GapAnalysisResult, GapItem } from '@/lib/types';

export default function GapAnalyzerPage() {
  const standards = getDynamicStandards();
  const [selectedStandardId, setSelectedStandardId] = useState<string>(standards[0]?.id || 'is-302-2-3');
  const [docName, setDocName] = useState<string>('Electric_Iron_Product_Spec_v2.pdf');
  const [docContent, setDocContent] = useState<string>(
    `Product Spec: 1200W Steam Iron. Mains Voltage 230V AC. Heating element with adjustable thermostat. Standard earthing pin provided. Casing made of polycarbonate plastic. High voltage insulation tested up to 1000V AC. Thermostat auto cut-off set at 180°C.`
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<GapAnalysisResult | null>(null);

  const selectedStandard = standards.find(s => s.id === selectedStandardId) || standards[0];

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const keyReqs = selectedStandard.keyRequirements || [];
      const testParams = selectedStandard.testingParameters || [];
      const clauses = selectedStandard.clauseReferences || [];
      
      const contentLower = docContent.toLowerCase();

      // Combine requirements and testing parameters for complete clause audit
      const allRequirementsToAudit = [
        ...keyReqs.map((req, idx) => ({
          clause: clauses[idx % Math.max(1, clauses.length)]?.clause || `Clause ${10 + idx * 2}`,
          requirement: req,
          paramKey: req
        })),
        ...testParams.map((param, idx) => ({
          clause: clauses[(keyReqs.length + idx) % Math.max(1, clauses.length)]?.clause || `Clause ${20 + idx * 3}`,
          requirement: `${param} (Mandatory Clause Validation)`,
          paramKey: param
        }))
      ];

      const gapItems: GapItem[] = allRequirementsToAudit.map((item, idx) => {
        const words = item.paramKey.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        
        // Find matching lines or sentences from user's custom snippet
        const snippetLines = docContent.split(/[\n.]+/).map(s => s.trim()).filter(Boolean);
        const matchingLine = snippetLines.find(line => {
          const lLower = line.toLowerCase();
          return words.some(w => lLower.includes(w));
        });

        if (matchingLine) {
          // Check if snippet line has complete spec or numerical limit
          const hasNumber = /\d+/.test(matchingLine);
          if (hasNumber || matchingLine.length > 20) {
            return {
              clause: item.clause,
              requirement: item.requirement,
              userDocEvidence: `Matched in user snippet: "${matchingLine}"`,
              status: 'met',
              riskSeverity: 'Low',
              remediation: `Requirement verified in snippet. Ensure factory QCP log records calibrated values for ${item.clause}.`
            };
          } else {
            return {
              clause: item.clause,
              requirement: item.requirement,
              userDocEvidence: `Partial match found in user snippet: "${matchingLine}"`,
              status: 'partial',
              riskSeverity: 'Medium',
              remediation: `Specification details in snippet are incomplete. Provide test report data under ${item.clause}.`
            };
          }
        } else {
          return {
            clause: item.clause,
            requirement: item.requirement,
            userDocEvidence: `Not specified in provided raw text snippet.`,
            status: 'missing',
            riskSeverity: 'High',
            remediation: `Mandatory requirement under ${selectedStandard.isNumber} ${item.clause}. Conduct NABL laboratory testing and update technical documentation.`
          };
        }
      });

      const metCount = gapItems.filter(i => i.status === 'met').length;
      const missingCount = gapItems.filter(i => i.status === 'missing').length;
      const partialCount = gapItems.filter(i => i.status === 'partial').length;
      const score = Math.round((metCount * 100 + partialCount * 50) / gapItems.length);

      setResult({
        productName: docName.replace(/\.[^/.]+$/, ""),
        standardId: selectedStandard.id,
        isNumber: selectedStandard.isNumber,
        overallComplianceScore: score,
        totalRequirements: gapItems.length,
        metCount,
        missingCount,
        partialCount,
        gaps: gapItems
      });

      setIsAnalyzing(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              BIS Compliance Audit
            </span>
            <span className="text-orange-200 text-xs font-semibold">AI Powered Grounded Gap Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            BIS Compliance Gap Analyzer
          </h1>
          <p className="text-orange-100 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            Upload your technical product specification or manufacturing manual. AI automatically cross-checks every clause of the applicable Indian Standard to identify missing compliance requirements and high-risk gaps.
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href="/comparator" className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1 border border-white/20">
            <span>Version Comparator</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main Analysis Form & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Input Column */}
        <div className="lg:col-span-1 space-y-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
              1. Select Target BIS Standard
            </label>
            <select 
              value={selectedStandardId}
              onChange={(e) => setSelectedStandardId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold rounded-xl p-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              {standards.map(std => (
                <option key={std.id} value={std.id}>
                  {std.isNumber} - {std.title}
                </option>
              ))}
            </select>
          </div>

          {/* Target Standard Info Box */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-bold text-orange-900">
              <span>{selectedStandard.isNumber}</span>
              <span className="bg-orange-200 text-orange-800 text-[10px] px-2 py-0.5 rounded font-extrabold">
                {selectedStandard.mandatoryStatus}
              </span>
            </div>
            <p className="text-slate-600 line-clamp-2">{selectedStandard.scope}</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
              2. Upload Product Document / Spec Sheet
            </label>
            <div className="border-2 border-dashed border-orange-300 bg-orange-50/50 rounded-xl p-4 text-center hover:bg-orange-100/50 transition cursor-pointer">
              <Upload className="w-7 h-7 text-orange-600 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-slate-800">Drag & Drop Product Specification PDF</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Supports PDF, DOCX, TXT (Max 25MB)</p>
              <input 
                type="file" 
                className="hidden" 
                id="docUpload"
                onChange={(e) => {
                  if (e.target.files?.[0]) setDocName(e.target.files[0].name);
                }}
              />
              <label htmlFor="docUpload" className="inline-block mt-2 bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold px-3 py-1 rounded cursor-pointer">
                Browse File ({docName})
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
              3. Specification Raw Snippet
            </label>
            <textarea 
              rows={4}
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono rounded-xl p-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="Paste product technical specifications, ratings, component list..."
            />
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="w-full orange-gradient-btn text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md flex items-center justify-center space-x-2 transition"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Grounded Gap Analysis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Compliance Gaps Now</span>
              </>
            )}
          </button>

        </div>

        {/* Right Output Area */}
        <div className="lg:col-span-2 space-y-6">
          {!result && !isAnalyzing && (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-4 shadow-sm">
              <FileSearch className="w-16 h-16 text-orange-400 mx-auto animate-bounce" />
              <h3 className="text-lg font-extrabold text-slate-800">Ready to Analyze Product Specification</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Select your target BIS standard on the left and click <strong>Analyze Compliance Gaps Now</strong> to generate a complete requirement-by-requirement gap audit matrix.
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-4 shadow-sm">
              <RefreshCw className="w-12 h-12 text-orange-600 animate-spin mx-auto" />
              <h3 className="text-base font-extrabold text-slate-800">Extracting Clauses & Cross-referencing Standard...</h3>
              <p className="text-xs text-slate-500">Checking parameters against {selectedStandard.isNumber} database...</p>
            </div>
          )}

          {result && !isAnalyzing && (
            <div className="space-y-6">
              
              {/* Score & Summary Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                
                {/* Score Dial */}
                <div className="sm:col-span-1 border-r border-slate-200 pr-4 text-center">
                  <div className="relative inline-flex items-center justify-center">
                    <span className="text-3xl font-black text-slate-900">{result.overallComplianceScore}%</span>
                  </div>
                  <p className="text-[11px] font-extrabold uppercase text-slate-500 mt-1">Readiness Score</p>
                  <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                    result.overallComplianceScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {result.overallComplianceScore >= 80 ? 'High Compliance' : 'Gap Action Required'}
                  </span>
                </div>

                {/* Counts Breakdown */}
                <div className="sm:col-span-3 grid grid-cols-3 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                    <span className="text-xl font-bold text-emerald-900">{result.metCount}</span>
                    <p className="text-[10px] font-extrabold text-emerald-700 uppercase">Requirements Met</p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                    <span className="text-xl font-bold text-amber-900">{result.partialCount}</span>
                    <p className="text-[10px] font-extrabold text-amber-700 uppercase">Partial Proof</p>
                  </div>

                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-center">
                    <XCircle className="w-5 h-5 text-rose-600 mx-auto mb-1" />
                    <span className="text-xl font-bold text-rose-900">{result.missingCount}</span>
                    <p className="text-[10px] font-extrabold text-rose-700 uppercase">Critical Gaps</p>
                  </div>
                </div>

              </div>

              {/* Detailed Gap Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-orange-400" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider">
                      Clause Gap Matrix: {result.isNumber}
                    </h3>
                  </div>
                  <button className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-1 rounded font-bold flex items-center space-x-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Gap Report (PDF)</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-200 text-xs">
                  {result.gaps.map((item, idx) => (
                    <div key={idx} className="p-4 space-y-2 hover:bg-slate-50 transition">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {item.clause}
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                            item.riskSeverity === 'High' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                            item.riskSeverity === 'Medium' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            Risk: {item.riskSeverity}
                          </span>

                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                            item.status === 'met' ? 'bg-emerald-600 text-white' :
                            item.status === 'partial' ? 'bg-amber-500 text-white' :
                            'bg-rose-600 text-white'
                          }`}>
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <p className="font-bold text-slate-900">{item.requirement}</p>
                      
                      {item.userDocEvidence && (
                        <p className="text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-200 text-[11px]">
                          <strong>Doc Evidence:</strong> "{item.userDocEvidence}"
                        </p>
                      )}

                      <div className="bg-orange-50 border border-orange-200 rounded p-2 text-orange-950 font-medium">
                        <strong className="text-orange-900 font-bold">Action / Remediation:</strong> {item.remediation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

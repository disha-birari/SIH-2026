'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  GitCompare, ArrowRight, Shield, Clock, AlertTriangle, 
  CheckCircle2, PlusCircle, RefreshCcw, Layers, Download, ChevronRight
} from 'lucide-react';
import { getStandardComparisons } from '@/lib/data/bisDatabase';
import { ClauseDiff, StandardComparison } from '@/lib/types';

export default function StandardComparatorPage() {
  const initialComparisons = getStandardComparisons();
  const [comparisons, setComparisons] = useState<StandardComparison[]>(initialComparisons);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // New Custom Comparison Form State
  const [oldVer, setOldVer] = useState<string>('IS 1234:2018');
  const [newVer, setNewVer] = useState<string>('IS 1234:2025');
  const [graceMonths, setGraceMonths] = useState<number>(12);
  const [summary, setSummary] = useState<string>('Comprehensive revision introducing tighter testing limits and mandatory NABL lab validation.');
  const [clauseNum, setClauseNum] = useState<string>('Clause 14.2');
  const [clauseTitle, setClauseTitle] = useState<string>('High Voltage Insulation Test');
  const [oldText, setOldText] = useState<string>('1000V AC applied for 60 seconds.');
  const [newText, setNewText] = useState<string>('1500V AC applied for 60 seconds with leakage threshold reduced to 0.5mA.');
  const [changeType, setChangeType] = useState<'added' | 'modified' | 'deleted'>('modified');
  const [costImpact, setCostImpact] = useState<'High' | 'Medium' | 'Low'>('High');
  const [impactDesc, setImpactDesc] = useState<string>('Upgrade factory high voltage test bench and recalibrate insulation meters.');

  const selected = comparisons[selectedIndex] || comparisons[0];

  const handleAddComparison = (e: React.FormEvent) => {
    e.preventDefault();
    const newComp: StandardComparison = {
      standardBaseId: `custom-${Date.now()}`,
      oldVersion: oldVer,
      newVersion: newVer,
      releaseDate: new Date().toISOString().split('T')[0],
      gracePeriodMonths: graceMonths,
      summary: summary,
      clauseDiffs: [
        {
          clauseNumber: clauseNum,
          title: clauseTitle,
          oldText: oldText,
          newText: newText,
          changeType: changeType,
          impactDescription: impactDesc,
          costImpact: costImpact
        }
      ]
    };

    const updated = [newComp, ...comparisons];
    setComparisons(updated);
    setSelectedIndex(0);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Indian Standards Revision
            </span>
            <span className="text-blue-200 text-xs font-semibold">Clause Diff & Transition Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Standard Version Comparator
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            Side-by-side technical comparison of older vs newly revised Indian Standards. Highlights added testing parameters, modified tolerances, deleted clauses, and business impact.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-white text-blue-900 hover:bg-blue-50 px-3.5 py-2 rounded-lg text-xs font-extrabold transition flex items-center space-x-1.5 shadow-md"
          >
            <PlusCircle className="w-4 h-4 text-blue-600" />
            <span>{showAddForm ? 'Close Form' : 'Add Custom Comparison'}</span>
          </button>
          <Link href="/matcher" className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1 border border-white/20">
            <span>Product Matcher</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Custom Comparison Entry Form */}
      {showAddForm && (
        <form onSubmit={handleAddComparison} className="bg-white p-6 rounded-2xl border-2 border-blue-400 shadow-md space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              <span>Add Custom Standard Version Comparison</span>
            </h3>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded">
              User Dynamic Entry
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-extrabold text-slate-700 block mb-1">Old Version (e.g. IS 1234:2018)</label>
              <input 
                type="text" 
                value={oldVer} 
                onChange={(e) => setOldVer(e.target.value)} 
                required 
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="font-extrabold text-slate-700 block mb-1">New Version (e.g. IS 1234:2025)</label>
              <input 
                type="text" 
                value={newVer} 
                onChange={(e) => setNewVer(e.target.value)} 
                required 
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="font-extrabold text-slate-700 block mb-1">Grace Period (Months)</label>
              <input 
                type="number" 
                value={graceMonths} 
                onChange={(e) => setGraceMonths(Number(e.target.value))} 
                required 
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="font-extrabold text-slate-700 block mb-1">Executive Summary of Changes</label>
            <textarea 
              rows={2} 
              value={summary} 
              onChange={(e) => setSummary(e.target.value)} 
              required 
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900"
            />
          </div>

          {/* Clause Diff Detail Inputs */}
          <div className="border-t border-slate-200 pt-3 space-y-3">
            <span className="text-xs font-extrabold text-blue-900 block">Clause Technical Diff Specification:</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Clause No (e.g. Clause 14.2)</label>
                <input type="text" value={clauseNum} onChange={(e) => setClauseNum(e.target.value)} required className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Clause Title</label>
                <input type="text" value={clauseTitle} onChange={(e) => setClauseTitle(e.target.value)} required className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Change Type</label>
                <select value={changeType} onChange={(e) => setChangeType(e.target.value as any)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold">
                  <option value="added">Added</option>
                  <option value="modified">Modified</option>
                  <option value="deleted">Deleted</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Cost Impact</label>
                <select value={costImpact} onChange={(e) => setCostImpact(e.target.value as any)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold">
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Old Standard Text</label>
                <textarea rows={2} value={oldText} onChange={(e) => setOldText(e.target.value)} required className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">New Standard Text</label>
                <textarea rows={2} value={newText} onChange={(e) => setNewText(e.target.value)} required className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold" />
              </div>
            </div>

            <div className="text-xs">
              <label className="font-bold text-slate-700 block mb-1">Factory Action Needed</label>
              <input type="text" value={impactDesc} onChange={(e) => setImpactDesc(e.target.value)} required className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold" />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg text-xs">Cancel</button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-5 py-2 rounded-lg text-xs shadow-md">Add & View Comparison</button>
          </div>
        </form>
      )}

      {/* Version Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <GitCompare className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <label className="text-[11px] font-extrabold uppercase text-slate-500 block">Select Revision Pair</label>
            <select 
              value={selectedIndex} 
              onChange={(e) => setSelectedIndex(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold rounded-lg p-2 mt-0.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {comparisons.map((c, i) => (
                <option key={i} value={i}>
                  {c.oldVersion} vs {c.newVersion}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Transition Summary Badges */}
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-blue-900 font-bold">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Transition Grace Period: {selected.gracePeriodMonths} Months</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-lg text-slate-800 font-bold">
            <span>Released: {selected.releaseDate}</span>
          </div>
        </div>
      </div>

      {/* Revision Executive Summary */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md space-y-3">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-orange-400" />
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-orange-400">
            Executive Summary: {selected.oldVersion} &rarr; {selected.newVersion}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
          {selected.summary}
        </p>
      </div>

      {/* Side-by-Side Clause Differences */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Clause-by-Clause Technical Diff Matrix</span>
          </h3>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded font-bold flex items-center space-x-1">
            <Download className="w-3.5 h-3.5" />
            <span>Export Diff Summary</span>
          </button>
        </div>

        <div className="divide-y divide-slate-200">
          {selected.clauseDiffs.map((diff: ClauseDiff, idx: number) => (
            <div key={idx} className="p-5 space-y-3 hover:bg-slate-50 transition">
              
              {/* Header line */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-black text-slate-900 text-xs bg-slate-100 px-2.5 py-1 rounded">
                    {diff.clauseNumber}
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-sm">{diff.title}</h4>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase ${
                    diff.changeType === 'added' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    diff.changeType === 'modified' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                    'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}>
                    {diff.changeType === 'added' ? '+ Clause Added' : diff.changeType === 'modified' ? '▲ Clause Modified' : '- Clause Deleted'}
                  </span>

                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                    diff.costImpact === 'High' ? 'bg-rose-600 text-white' :
                    diff.costImpact === 'Medium' ? 'bg-amber-600 text-white' :
                    'bg-slate-600 text-white'
                  }`}>
                    Cost Impact: {diff.costImpact}
                  </span>
                </div>
              </div>

              {/* Side by side comparison grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                
                {/* Old version box */}
                <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-rose-800 tracking-wider block">
                    Old Standard: {selected.oldVersion}
                  </span>
                  <p className="text-slate-800 font-mono text-[11px] leading-relaxed">
                    {diff.oldText}
                  </p>
                </div>

                {/* New version box */}
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider block">
                    New Standard: {selected.newVersion}
                  </span>
                  <p className="text-slate-800 font-mono text-[11px] leading-relaxed">
                    {diff.newText}
                  </p>
                </div>

              </div>

              {/* Impact analysis note */}
              <div className="bg-slate-900 text-slate-200 rounded-lg p-2.5 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-bold">Factory Action Needed:</strong> {diff.impactDescription}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

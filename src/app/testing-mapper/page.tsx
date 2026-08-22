'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  TestTube, Search, Shield, FileText, CheckCircle2, ArrowRight, 
  ExternalLink, Layers, ChevronRight, Filter
} from 'lucide-react';
import { getTestingMappings, getDynamicStandards } from '@/lib/data/bisDatabase';

export default function TestingMapperPage() {
  const standards = getDynamicStandards();
  const [selectedStandard, setSelectedStandard] = useState<string>('all');

  const mappings = getTestingMappings(selectedStandard);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              NABL Testing Matrix
            </span>
            <span className="text-emerald-200 text-xs font-semibold">Requirement &rarr; Laboratory Equipment Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Testing Requirement Mapper
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            Map every clause requirement directly to required laboratory test equipment, test method standards (IS/ISO), sample batch sizes, and acceptable evidence documents.
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href="/lab-finder" className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1 border border-white/20">
            <span>Lab Finder</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <TestTube className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <div>
            <label className="text-[11px] font-extrabold uppercase text-slate-500 block">Filter Standard</label>
            <select 
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold rounded-lg p-2.5 mt-0.5"
            >
              <option value="all">All Standards ({mappings.length} Mapped Parameters)</option>
              {standards.map(s => (
                <option key={s.id} value={s.id}>{s.isNumber} - {s.category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-bold bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-emerald-900">
          NABL Accredited Test Rig Mapping
        </div>
      </div>

      {/* Mappings Grid Cards */}
      <div className="grid grid-cols-1 gap-4">
        {mappings.map(map => (
          <div key={map.requirementId} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-emerald-400 transition">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="bg-emerald-600 text-white font-extrabold text-xs px-2.5 py-0.5 rounded">
                  {map.isNumber}
                </span>
                <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2 py-0.5 rounded">
                  {map.clause}
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm">{map.parameterName}</h3>
              </div>

              <span className="bg-cyan-50 text-cyan-900 border border-cyan-200 text-xs font-extrabold px-3 py-1 rounded-full w-fit">
                Sample Qty: {map.sampleQuantity}
              </span>
            </div>

            {/* Mapping Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Test Method Standard</span>
                <p className="font-bold text-slate-900">{map.testMethodStandard}</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Required Laboratory Equipment</span>
                <p className="font-bold text-slate-900">{map.requiredEquipment}</p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-emerald-800 block">Acceptance Criteria</span>
                <p className="font-bold text-emerald-950">{map.acceptanceCriteria}</p>
              </div>

            </div>

            {/* Required Evidence */}
            <div className="bg-slate-900 text-slate-200 p-3 rounded-xl text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-orange-400" />
                <span>Required Audit Evidence: <strong>{map.requiredEvidenceDocument}</strong></span>
              </div>
              <span className="text-emerald-400 font-bold text-[11px]">NABL / BIS Audit Verified</span>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

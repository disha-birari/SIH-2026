'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, Clock, CheckCircle2, ArrowRight, Shield, Download, 
  Building2, ChevronRight, Layers, FileText
} from 'lucide-react';
import { getTimelineMilestones } from '@/lib/data/bisDatabase';

export default function ComplianceTimelinePage() {
  const milestones = getTimelineMilestones();
  const [scheme, setScheme] = useState<string>('Scheme-I (ISI Mark)');
  const [unitType, setUnitType] = useState<string>('Domestic MSME Unit');

  const totalDays = milestones.reduce((sum, m) => sum + m.durationDays, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-orange-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-orange-100 text-orange-800 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              BIS License SLA
            </span>
            <span className="text-slate-500 text-xs font-semibold">Interactive Milestone & SLA Gantt Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-slate-900">
            BIS Compliance Roadmap & Timeline Generator
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            Generate customized step-by-step milestone timelines for your ISI mark or CRS application. Track official government SLAs and deliverable deadlines.
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href="/testing-mapper" className="bg-orange-600 hover:bg-orange-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1 shadow-sm">
            <span>Testing Mapper</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-5 rounded-xl border border-orange-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <div>
            <label className="text-[11px] font-extrabold uppercase text-slate-500 block">BIS Scheme</label>
            <select 
              value={scheme} 
              onChange={(e) => setScheme(e.target.value)}
              className="bg-orange-50/50 border border-orange-200 text-slate-900 text-xs font-bold rounded-lg p-2 mt-0.5"
            >
              <option value="Scheme-I (ISI Mark)">Scheme-I (ISI Mark Standard)</option>
              <option value="CRS (Compulsory Registration)">CRS Electronics Registration</option>
              <option value="FMCS (Foreign Manufacturer)">FMCS Foreign Units</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-extrabold uppercase text-slate-500 block">Unit Type</label>
            <select 
              value={unitType} 
              onChange={(e) => setUnitType(e.target.value)}
              className="bg-orange-50/50 border border-orange-200 text-slate-900 text-xs font-bold rounded-lg p-2 mt-0.5"
            >
              <option value="Domestic MSME Unit">Domestic MSME Unit</option>
              <option value="Large Manufacturing Plant">Large Manufacturing Plant</option>
              <option value="Overseas Unit">Overseas Unit</option>
            </select>
          </div>
        </div>

        {/* Total Estimated SLA Box */}
        <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl flex items-center space-x-3 text-orange-900">
          <Clock className="w-6 h-6 text-orange-600 flex-shrink-0" />
          <div>
            <span className="text-[10px] font-extrabold uppercase text-orange-700 block">Total Estimated Time</span>
            <span className="text-base font-black">{totalDays} Calendar Days (~{Math.round(totalDays/30 * 10)/10} Months)</span>
          </div>
        </div>
      </div>

      {/* Milestone Timeline Flow */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-orange-600" />
            <span>Step-by-Step License Acquisition Roadmap</span>
          </h2>
          <button className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3.5 py-1.5 rounded-lg font-bold flex items-center space-x-1 shadow-sm">
            <Download className="w-3.5 h-3.5" />
            <span>Download Timeline PDF</span>
          </button>
        </div>

        <div className="space-y-6 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-orange-200">
          {milestones.map(m => (
            <div key={m.stage} className="relative flex items-start space-x-4 group">
              
              {/* Step circle */}
              <div className="w-12 h-12 rounded-full bg-orange-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0 z-10 shadow-md group-hover:scale-110 transition-transform">
                {m.stage}
              </div>

              {/* Card content */}
              <div className="flex-1 bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-2 group-hover:border-orange-300 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{m.title}</h3>
                  <span className="bg-orange-100 text-orange-900 text-xs font-black px-2.5 py-0.5 rounded-full w-fit">
                    SLA: {m.durationDays} Days
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">{m.description}</p>

                <div className="pt-2">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 block mb-1">Required Deliverables:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {m.deliverables.map((del: string, i: number) => (
                      <span key={i} className="bg-white border border-slate-300 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-orange-600" />
                        <span>{del}</span>
                      </span>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

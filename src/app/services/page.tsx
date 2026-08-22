'use client';

import React, { useState } from 'react';
import { BookOpen, Clock, DollarSign, Building2, ChevronRight } from 'lucide-react';
import { BIS_SERVICES } from '@/lib/data/bisDatabase';

export default function ServicesPage() {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(BIS_SERVICES[0].id);

  const activeService = BIS_SERVICES.find(s => s.id === selectedServiceId) || BIS_SERVICES[0];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-orange-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-orange-600" />
            <span>BIS Service Navigator</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Explore official certification schemes, step-by-step application procedures, fees, and timelines.
          </p>
        </div>
      </div>

      {/* Scheme Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {BIS_SERVICES.map((srv) => (
          <button
            key={srv.id}
            onClick={() => setSelectedServiceId(srv.id)}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedServiceId === srv.id
                ? 'sap-tile-active border-orange-500 shadow-md'
                : 'bg-white border-orange-200 hover:border-orange-300'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
              {srv.code}
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-2">{srv.name}</h3>
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">{srv.description}</p>
          </button>
        ))}
      </div>

      {/* Selected Service Detailed Workflow View */}
      <div className="sap-card p-6 space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-orange-100 pb-4">
          <div>
            <span className="text-xs font-bold text-orange-800 bg-orange-100 px-3 py-1 rounded-full uppercase">
              {activeService.code} Scheme Overview
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-2">{activeService.name}</h3>
            <p className="text-xs text-slate-600 mt-1">{activeService.description}</p>
          </div>

          <div className="flex items-center space-x-4 bg-orange-50/60 p-3 rounded-xl border border-orange-200">
            <div className="flex items-center space-x-1.5 text-xs text-slate-800 font-semibold">
              <Clock className="w-4 h-4 text-orange-600" />
              <span>Timeline: <strong>{activeService.typicalTimeline}</strong></span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-800 font-semibold">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>For: <strong>{activeService.target}</strong></span>
            </div>
          </div>
        </div>

        {/* Step-by-Step Interactive Workflow */}
        <div>
          <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-4">
            Step-by-Step Certification Workflow
          </h4>

          <div className="space-y-3">
            {activeService.steps.map((step, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-3.5 bg-orange-50/40 border border-orange-200 rounded-xl">
                <div className="w-7 h-7 saffron-gradient text-white font-bold text-xs rounded-full flex items-center justify-center shrink-0 shadow-sm">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-bold text-slate-900">{step}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Verified BIS standard operating procedure clause.</p>
                </div>
                <ChevronRight className="w-4 h-4 text-orange-400 shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Fee Structure Box */}
        <div className="bg-orange-50 border border-orange-300 rounded-xl p-4 flex items-start space-x-3">
          <DollarSign className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-orange-900 uppercase">Government Fee Structure</h5>
            <p className="text-xs text-slate-800 font-medium mt-1">{activeService.feeStructure}</p>
          </div>
        </div>

      </div>

    </div>
  );
}

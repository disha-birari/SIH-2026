'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, Search, Phone, Mail, Building2, CheckCircle2, Clock, 
  ExternalLink, Shield, Send, ChevronRight
} from 'lucide-react';
import { getTestingLabs } from '@/lib/data/bisDatabase';

export default function LabFinderPage() {
  const labs = getTestingLabs();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [inquirySent, setInquirySent] = useState<string | null>(null);

  const filteredLabs = labs.filter(lab => {
    const matchesSearch = lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lab.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lab.standardsCovered.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesState = selectedState === 'all' || lab.state === selectedState;
    return matchesSearch && matchesState;
  });

  const handleSendInquiry = (labId: string) => {
    setInquirySent(labId);
    setTimeout(() => setInquirySent(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              NABL & BIS Directory
            </span>
            <span className="text-blue-200 text-xs font-semibold">Authoritative NABL & BIS Lab Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            BIS Recognized Lab Finder
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            Locate officially recognized NABL and BIS testing laboratories across India. Filter by standard, state, turn-around time, and send testing inquiry requests.
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href="/evidence-verifier" className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1 border border-white/20">
            <span>Evidence Verifier</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lab name, standard (e.g. 'IS 302'), or city..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <select 
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full py-3 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All States / Regions</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Haryana">Haryana</option>
            <option value="West Bengal">West Bengal</option>
          </select>
        </div>
      </div>

      {/* Labs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredLabs.map(lab => (
          <div key={lab.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-blue-400 transition flex flex-col justify-between">
            
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="bg-blue-100 text-blue-900 text-[10px] font-extrabold px-2 py-0.5 rounded">
                    {lab.labType}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base mt-1">{lab.name}</h3>
                </div>

                <div className="flex items-center space-x-1 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold px-2 py-1 rounded-full flex-shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>BIS Recognized</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-xs text-slate-600 font-medium">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{lab.location}, {lab.state}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Avg {lab.avgTurnaroundDays} Days Turnaround</span>
                </span>
              </div>

              {/* Scope Standards Tags */}
              <div>
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Accredited Testing Scope:</span>
                <div className="flex flex-wrap gap-1.5">
                  {lab.standardsCovered.map((std: string, i: number) => (
                    <span key={i} className="bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded">
                      {std}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions & Contact */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[11px] text-slate-500 space-y-0.5">
                <p>Email: <strong className="text-slate-800">{lab.contactEmail}</strong></p>
                <p>Phone: <strong className="text-slate-800">{lab.contactPhone}</strong></p>
              </div>

              {inquirySent === lab.id ? (
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-xl">
                  Inquiry Sent!
                </span>
              ) : (
                <button 
                  onClick={() => handleSendInquiry(lab.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Request Testing Quote</span>
                </button>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

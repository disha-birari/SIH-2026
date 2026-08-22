'use client';

import React, { useState, useEffect } from 'react';
import { CheckSquare, Printer } from 'lucide-react';
import { getDynamicStandards } from '@/lib/data/bisDatabase';
import { ComplianceCheckItem, BISStandard } from '@/lib/types';

export default function ChecklistPage() {
  const [standards, setStandards] = useState<BISStandard[]>([]);
  const [selectedStandardId, setSelectedStandardId] = useState<string>('');
  const [items, setItems] = useState<ComplianceCheckItem[]>([]);

  useEffect(() => {
    const list = getDynamicStandards();
    setStandards(list);
    if (list.length > 0) {
      setSelectedStandardId(list[0].id);
      loadItemsForStandard(list[0]);
    }
  }, []);

  const loadItemsForStandard = (std: BISStandard) => {
    setItems([
      ...std.keyRequirements.map((req, idx) => ({
        id: `req-${idx}`,
        standardId: std.id,
        title: req,
        category: "Technical Requirement",
        mandatory: true,
        status: (idx === 0 ? 'passed' : idx === 1 ? 'passed' : 'pending') as 'passed' | 'pending' | 'failed' | 'not_applicable',
        notes: ""
      })),
      ...std.requiredDocuments.map((doc, idx) => ({
        id: `doc-${idx}`,
        standardId: std.id,
        title: `Documentation: ${doc}`,
        category: "Documentation",
        mandatory: true,
        status: (idx === 0 ? 'passed' : 'pending') as 'passed' | 'pending' | 'failed' | 'not_applicable',
        notes: ""
      }))
    ]);
  };

  const handleStandardChange = (id: string) => {
    setSelectedStandardId(id);
    const std = standards.find(s => s.id === id);
    if (std) loadItemsForStandard(std);
  };

  const handleStatusToggle = (id: string, newStatus: 'passed' | 'pending' | 'failed') => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const passedCount = items.filter(i => i.status === 'passed').length;
  const progressPercent = items.length > 0 ? Math.round((passedCount / items.length) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-orange-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
            <CheckSquare className="w-6 h-6 text-orange-600" />
            <span>Interactive BIS Compliance Checklist</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track implementation progress, document uploads, and lab test readiness for BIS licensing.
          </p>
        </div>

        <button 
          onClick={() => window.print()}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow flex items-center space-x-2"
        >
          <Printer className="w-4 h-4 text-orange-400" />
          <span>Export / Print Report</span>
        </button>
      </div>

      {/* Standard Selector & Progress Bar */}
      <div className="sap-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-orange-100 pb-4">
          <div className="w-full sm:w-72">
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Target Indian Standard</label>
            <select
              value={selectedStandardId}
              onChange={(e) => handleStandardChange(e.target.value)}
              className="w-full px-3 py-2 bg-orange-50/50 border border-orange-200 rounded-lg text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {standards.map(std => (
                <option key={std.id} value={std.id}>{std.isNumber}: {std.category}</option>
              ))}
            </select>
          </div>

          {/* Meter */}
          <div className="flex-1 max-w-md bg-orange-50/70 p-4 rounded-xl border border-orange-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Audit Readiness Score</span>
              <span className="font-extrabold text-orange-700">{progressPercent}% ({passedCount}/{items.length} Completed)</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-orange-500 to-emerald-500 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-orange-200 text-slate-600 text-xs font-bold bg-orange-50/70">
                <th className="py-3 px-4">Requirement / Task</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Compliance Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-orange-50/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 max-w-sm">{item.title}</td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{item.category}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex rounded-lg p-0.5 bg-orange-50 border border-orange-200">
                      <button
                        onClick={() => handleStatusToggle(item.id, 'passed')}
                        className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                          item.status === 'passed' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:text-emerald-700'
                        }`}
                      >
                        Passed
                      </button>
                      <button
                        onClick={() => handleStatusToggle(item.id, 'pending')}
                        className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                          item.status === 'pending' ? 'bg-amber-500 text-white shadow' : 'text-slate-600 hover:text-amber-700'
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => handleStatusToggle(item.id, 'failed')}
                        className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                          item.status === 'failed' ? 'bg-rose-600 text-white shadow' : 'text-slate-600 hover:text-rose-700'
                        }`}
                      >
                        Action Req
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <input 
                      type="text"
                      value={item.notes}
                      onChange={(e) => {
                        const val = e.target.value;
                        setItems(prev => prev.map(i => i.id === item.id ? { ...i, notes: val } : i));
                      }}
                      placeholder="Add lab test log or remarks..."
                      className="w-full px-2 py-1 bg-white border border-orange-200 rounded text-slate-700 focus:outline-none focus:border-orange-500 text-xs"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}

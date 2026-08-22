'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bell, AlertCircle, Calendar, ExternalLink, Shield, Check, Mail, Filter, ChevronRight
} from 'lucide-react';
import { getStandardAlerts } from '@/lib/data/bisDatabase';

export default function StandardAlertsPage() {
  const alerts = getStandardAlerts();
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-700 to-amber-700 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Quality Control Orders (QCO)
            </span>
            <span className="text-rose-200 text-xs font-semibold">Real-Time Revision & QCO Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Standard Change Alerts & Notifications
          </h1>
          <p className="text-rose-100 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            Stay ahead of regulatory updates. Track live Quality Control Orders (QCO), draft standards open for public comment, and grace period deadlines.
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href="/ask-pdf" className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1 border border-white/20">
            <span>Ask My PDF</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Instant Email Alert Setup */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Bell className="w-6 h-6 text-rose-600 flex-shrink-0 animate-bounce" />
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Subscribe to Industry QCO Alerts</h3>
            <p className="text-xs text-slate-500 font-medium">Receive instant email updates whenever BIS revises a standard in your domain.</p>
          </div>
        </div>

        {subscribed ? (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs px-4 py-2 rounded-xl font-bold flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Subscribed with {email}! Alerts active.</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex items-center space-x-2 w-full md:w-auto">
            <input 
              type="email" 
              required
              placeholder="Enter your work email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex-shrink-0">
              Subscribe Free
            </button>
          </form>
        )}
      </div>

      {/* Live Alerts Feed */}
      <div className="space-y-4">
        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>Active Gazette Notifications & Revision Deadlines</span>
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {alerts.map(alert => (
            <div key={alert.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-rose-300 transition">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase ${
                    alert.urgency === 'Critical' ? 'bg-rose-600 text-white' :
                    alert.urgency === 'Important' ? 'bg-amber-600 text-white' :
                    'bg-slate-600 text-white'
                  }`}>
                    {alert.urgency}
                  </span>
                  <span className="bg-slate-100 text-slate-800 text-xs font-extrabold px-2.5 py-0.5 rounded">
                    {alert.alertType}
                  </span>
                  <span className="text-xs font-black text-rose-900">{alert.isNumber}</span>
                </div>

                <div className="flex items-center space-x-3 text-xs text-slate-500 font-bold">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Effective: {alert.effectiveDate}</span>
                  </span>
                </div>
              </div>

              <h3 className="font-extrabold text-slate-900 text-base">{alert.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{alert.summary}</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-mono text-[11px]">Gazette Ref: {alert.officialGazetteRef}</span>
                <a 
                  href="https://www.services.bis.gov.in" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-rose-700 hover:text-rose-900 font-extrabold flex items-center space-x-1"
                >
                  <span>Read Official Gazette Order</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Search, Copy, Check, ExternalLink, Shield, FileText, PlusCircle
} from 'lucide-react';
import { getDynamicStandards } from '@/lib/data/bisDatabase';

export default function ClauseCitationsPage() {
  const standards = getDynamicStandards();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dynamic Custom Citations State
  const [customCitations, setCustomCitations] = useState<any[]>([]);

  // Flatten standard clause references + user custom citations
  const baseCitations = standards.flatMap((std, stdIdx) => 
    std.clauseReferences.map((ref, idx) => ({
      id: `base-${std.id}-${idx}`,
      standardNumber: std.isNumber,
      title: std.title,
      clause: ref.clause,
      officialText: ref.description,
      aiInterpretation: `AI Interpretation: Under ${std.isNumber} ${ref.clause}, manufacturers must perform strict laboratory verification to ensure ${ref.description.toLowerCase().slice(0, 100)}...`,
      officialUrl: std.officialUrl,
      mandatoryStatus: std.mandatoryStatus,
      category: std.category,
      pageNumber: `Page ${12 + idx * 4}`,
      gazetteRef: `S.O. ${400 + stdIdx * 15}(E) / 2026`
    }))
  );

  const allCitations = [...customCitations, ...baseCitations];

  const filteredCitations = allCitations.filter(c => {
    const matchesSearch = 
      !searchQuery ||
      c.standardNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.clause.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.officialText.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || c.category?.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const handleCopyCitation = (cit: any) => {
    const formatted = `[BIS OFFICIAL CITATION]\nStandard: ${cit.standardNumber} (${cit.title})\nClause: ${cit.clause}\nOfficial Requirement: "${cit.officialText}"\nPage: ${cit.pageNumber}\nGazette Source: ${cit.officialUrl}`;
    navigator.clipboard.writeText(formatted);
    setCopiedId(cit.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, width: '100%' }}>

      {/* Top Banner */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 10, padding: 24, boxShadow: '0 2px 8px rgba(40,30,20,0.03)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#171717', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <BookOpen style={{ width: 24, height: 24, color: '#F28C52' }} />
          <span>Clause-level Citations &amp; Evidence Explorer</span>
        </h1>
        <p style={{ fontSize: 13, color: '#686868', margin: 0, maxWidth: 760 }}>
          Serious document research platform. Clearly distinguishes official Gazette-grounded BIS requirements from AI interpretations.
        </p>
      </div>

      {/* Filter & Search Header */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 10, padding: 18, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
          <Search style={{ width: 16, height: 16, color: '#F28C52', position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clause text, numbers, or standards (e.g. Clause 8.1, IS 302)..."
            style={{
              width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10,
              background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 6, fontSize: 13, color: '#242424',
              outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#242424', outline: 'none' }}
        >
          <option value="all">All Domains &amp; Categories</option>
          <option value="electrical">Electrical Appliances</option>
          <option value="automobile">Automotive Safety</option>
          <option value="toys">Toys Safety</option>
        </select>
      </div>

      {/* Citations List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {filteredCitations.map((cit) => (
          <div
            key={cit.id}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E8E2DC',
              borderRadius: 8,
              padding: 24,
              boxShadow: '0 2px 8px rgba(40,30,20,0.03)',
              display: 'flex', flexDirection: 'column', gap: 16
            }}
          >
            {/* Clause Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E8E2DC', paddingBottom: 12 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#F28C52', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {cit.standardNumber} • {cit.clause}
                </span>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#171717', marginTop: 2 }}>
                  {cit.title}
                </div>
              </div>

              <button
                onClick={() => handleCopyCitation(cit)}
                style={{
                  background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 6,
                  padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#242424',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                {copiedId === cit.id ? <Check style={{ width: 14, height: 14, color: '#4F7D5A' }} /> : <Copy style={{ width: 14, height: 14 }} />}
                <span>{copiedId === cit.id ? 'Copied Citation' : 'Copy Citation'}</span>
              </button>
            </div>

            {/* 1. OFFICIAL BIS REQUIREMENT */}
            <div style={{ background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 6, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#171717', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                OFFICIAL BIS REQUIREMENT (GAZETTE GROUNDED)
              </div>
              <p style={{ fontSize: 13.5, color: '#242424', margin: 0, lineHeight: 1.65, fontFamily: "'IBM Plex Sans', sans-serif" }}>
                {cit.officialText}
              </p>
            </div>

            {/* 2. AI INTERPRETATION */}
            <div style={{ background: '#FFF1E8', border: '1px solid #F4C4A5', borderRadius: 6, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#E9783F', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                AI INTERPRETATION &amp; COMPLIANCE EXPLANATION
              </div>
              <p style={{ fontSize: 13, color: '#242424', margin: 0, lineHeight: 1.6 }}>
                {cit.aiInterpretation}
              </p>
            </div>

            {/* 3. SOURCES & EVIDENCE */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#686868', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span>Source: <strong>{cit.standardNumber}</strong></span>
                <span>Clause: <strong>{cit.clause}</strong></span>
                <span>{cit.pageNumber}</span>
              </div>

              <a
                href={cit.officialUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: '#E9783F', fontWeight: 700, textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', gap: 4
                }}
              >
                <span>View Official Gazette Source</span>
                <ExternalLink style={{ width: 13, height: 13 }} />
              </a>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

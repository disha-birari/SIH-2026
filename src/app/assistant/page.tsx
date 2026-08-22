'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Cpu, Send, Shield, CheckCircle2, AlertTriangle, ExternalLink, 
  ThumbsUp, ThumbsDown, BookOpen, Sparkles, FileText, RefreshCw,
  CheckSquare, Calendar, Landmark, ListChecks, ArrowUpRight, ShieldCheck, HelpCircle
} from 'lucide-react';
import { AIResponsePayload, UserPersona } from '@/lib/types';
import { saveFeedbackLocal } from '@/lib/firebase';

function AssistantContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [persona, setPersona] = useState<UserPersona>('manufacturer');
  const [isLoading, setIsLoading] = useState(false);
  const [responsePayload, setResponsePayload] = useState<AIResponsePayload | null>(null);
  const [feedbackSent, setFeedbackSent] = useState<boolean | null>(null);
  
  // Tab control for right-hand Agent panel
  const [activeTab, setActiveTab] = useState<'roadmap' | 'checklist' | 'documents' | 'citations'>('checklist');
  // Local state for ticked checklist items to calculate compliance score dynamically
  const [checkedRequirements, setCheckedRequirements] = useState<Record<number, boolean>>({});

  const samplePrompts = [
    "How does IS 302 apply to this product?",
    "Is ISI mark mandatory for motorcycle helmets under IS 4151?",
    "What are the testing parameters for electrical appliances under IS 302-2-3?",
    "CRS registration requirements for electronic goods",
    "Requirements for Fe 500 grade TMT steel bars under IS 1786"
  ];

  const handleSearch = async (queryText?: string) => {
    const textToSearch = queryText || query;
    if (!textToSearch.trim()) return;

    setIsLoading(true);
    setFeedbackSent(null);
    setCheckedRequirements({});

    // Auto-switch tabs based on query context to show live changes
    if (/roadmap|timeline|steps|plan|milestone|schedule|gold/i.test(textToSearch)) {
      setActiveTab('roadmap');
    } else if (/checklist|criteria|rules|requirements|clauses|test/i.test(textToSearch)) {
      setActiveTab('checklist');
    } else if (/document|file|paper|certificate|license|agreement/i.test(textToSearch)) {
      setActiveTab('documents');
    } else if (/citation|evidence|clause|source|gazette|reference/i.test(textToSearch)) {
      setActiveTab('citations');
    } else {
      setActiveTab('checklist'); // default fallback
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSearch, persona })
      });
      const data = await res.json();
      setResponsePayload(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleFeedback = (isHelpful: boolean) => {
    if (!responsePayload) return;
    saveFeedbackLocal(query, isHelpful);
    setFeedbackSent(isHelpful);
  };

  const toggleCheck = (idx: number) => {
    setCheckedRequirements(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Calculate compliance completion score
  const totalReqs = responsePayload?.complianceRequirements?.length || 0;
  const completedReqs = Object.values(checkedRequirements).filter(Boolean).length;
  const complianceScore = totalReqs > 0 ? Math.round((completedReqs / totalReqs) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      
      {/* Header Bar */}
      <div style={{ 
        background: '#FFFFFF', 
        border: '1px solid #E8E2DC', 
        borderRadius: 10, 
        padding: '20px 24px', 
        boxShadow: '0 2px 8px rgba(40,30,20,0.03)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        gap: 16 
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#171717', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Cpu style={{ width: 22, height: 22, color: '#F28C52' }} />
            <span>BIS AI Research Assistant</span>
          </h1>
          <p style={{ fontSize: 12.5, color: '#686868', margin: 0 }}>
            Source-grounded research assistant providing clause-level citations, timelines, and interactive compliance checklists.
          </p>
        </div>

        {/* Persona Selector */}
        <div style={{ display: 'flex', gap: 4, background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 6, padding: 3 }}>
          {(['manufacturer', 'msme', 'consumer', 'importer'] as UserPersona[]).map((p) => (
            <button
              key={p}
              onClick={() => setPersona(p)}
              style={{
                background: persona === p ? '#F28C52' : 'transparent',
                color: persona === p ? '#FFFFFF' : '#686868',
                border: 'none', borderRadius: 4, padding: '4px 10px',
                fontSize: 11.5, fontWeight: 700, textTransform: 'capitalize', cursor: 'pointer'
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split-Pane Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'start' }}>
        
        {/* Left Column: AI Assistant Chat & Query */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Query Input Box */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 10, padding: 20, boxShadow: '0 2px 8px rgba(40,30,20,0.03)' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ask about standards, mandatory QCOs, clause requirements, or lab testing..."
                style={{
                  flex: 1, padding: '10px 14px', background: '#FFFCF8',
                  border: '1px solid #E8E2DC', borderRadius: 8,
                  fontSize: 13, color: '#242424', outline: 'none'
                }}
              />
              <button
                onClick={() => handleSearch()}
                disabled={isLoading || !query.trim()}
                style={{
                  background: '#F28C52', color: '#FFFFFF',
                  border: 'none', borderRadius: 8,
                  padding: '10px 18px', fontSize: 13, fontWeight: 700,
                  cursor: isLoading || !query.trim() ? 'not-allowed' : 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6
                }}
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send style={{ width: 14, height: 14 }} />}
                <span>Ask BIS AI</span>
              </button>
            </div>

            {/* Suggested Queries */}
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#686868' }}>Suggested:</span>
              {samplePrompts.slice(0, 3).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(prompt);
                    handleSearch(prompt);
                  }}
                  style={{
                    background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 4,
                    padding: '3px 8px', fontSize: 11, color: '#242424', cursor: 'pointer'
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Response Text Display */}
          {responsePayload ? (
            <div style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 10, padding: 20, boxShadow: '0 2px 8px rgba(40,30,20,0.03)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: '#E9783F', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck style={{ width: 14, height: 14 }} />
                  <span>BIS AI Grounded Response</span>
                </div>
                <p style={{ fontSize: 13.5, color: '#242424', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {responsePayload.summaryExplanation}
                </p>
              </div>

              {/* Feedback buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #E8E2DC', fontSize: 11.5, color: '#686868' }}>
                <span>Was this answer grounded and accurate?</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => handleFeedback(true)}
                    style={{ background: feedbackSent === true ? '#EBF4EE' : '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: feedbackSent === true ? '#4F7D5A' : '#686868' }}
                  >
                    <ThumbsUp style={{ width: 12, height: 12 }} />
                    <span>Yes</span>
                  </button>
                  <button
                    onClick={() => handleFeedback(false)}
                    style={{ background: feedbackSent === false ? '#FDF2F0' : '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: feedbackSent === false ? '#B85C52' : '#686868' }}
                  >
                    <ThumbsDown style={{ width: 12, height: 12 }} />
                    <span>No</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: '#FFFFFF', border: '1px dashed #E8E2DC', borderRadius: 10, padding: '40px 20px', textAlign: 'center', color: '#686868' }}>
              <Cpu style={{ width: 36, height: 36, color: '#F28C52', margin: '0 auto 12px', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>Waiting for your compliance query...</p>
              <p style={{ margin: '4px 0 0', fontSize: 11.5, opacity: 0.8 }}>Type a query above to fetch official standards and load the workspace.</p>
            </div>
          )}

        </div>

        {/* Right Column: AI Compliance Agent Workspace */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 10, padding: 20, boxShadow: '0 2px 8px rgba(40,30,20,0.03)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E8E2DC', paddingBottom: 12 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#171717', margin: 0 }}>
                Interactive Compliance Workspace
              </h2>
              <span style={{ fontSize: 11.5, color: '#686868' }}>Live generated assets from standard queries</span>
            </div>
            {responsePayload && (
              <span style={{ 
                fontSize: 10.5, 
                fontWeight: 700, 
                background: '#FFF1E8', 
                color: '#E9783F', 
                border: '1px solid #F4C4A5', 
                borderRadius: 4, 
                padding: '2px 8px' 
              }}>
                Confidence: {responsePayload.confidenceScore}%
              </span>
            )}
          </div>

          {/* Workspace Tabs Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 8, padding: 3 }}>
            {[
              { id: 'checklist', label: 'Checklist', icon: CheckSquare },
              { id: 'roadmap', label: 'Roadmap', icon: Calendar },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'citations', label: 'Citations', icon: BookOpen }
            ].map(t => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  style={{
                    background: active ? '#FFFFFF' : 'transparent',
                    color: active ? '#E9783F' : '#686868',
                    border: active ? '1px solid #E8E2DC' : '1px solid transparent',
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.03)' : 'none',
                    borderRadius: 6,
                    padding: '6px 4px',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'all 0.15s'
                  }}
                >
                  <Icon style={{ width: 14, height: 14 }} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Panel */}
          <div style={{ minHeight: 280 }}>
            {!responsePayload ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#686868' }}>
                <ListChecks style={{ width: 32, height: 32, color: '#E8E2DC', margin: '0 auto 10px' }} />
                <p style={{ margin: 0, fontSize: 12, fontStyle: 'italic' }}>Workspace assets will appear once query runs.</p>
              </div>
            ) : (
              <>
                {/* 1. CHECKLIST TAB */}
                {activeTab === 'checklist' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Compliance Progress Indicator */}
                    <div style={{ background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 8, padding: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, fontWeight: 700, color: '#171717', marginBottom: 6 }}>
                        <span>Interactive Compliance Checklist</span>
                        <span style={{ color: '#E9783F' }}>{complianceScore}% Ready</span>
                      </div>
                      <div style={{ width: '100%', height: 6, background: '#E8E2DC', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${complianceScore}%`, height: '100%', background: '#4F7D5A', borderRadius: 3, transition: 'width 0.3s ease' }}></div>
                      </div>
                      <div style={{ fontSize: 11, color: '#686868', marginTop: 4 }}>
                        {completedReqs} of {totalReqs} requirements checked.
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {responsePayload.complianceRequirements?.map((req, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => toggleCheck(idx)}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'start', 
                            gap: 10, 
                            padding: '10px 12px', 
                            border: '1px solid #E8E2DC', 
                            borderRadius: 8, 
                            background: checkedRequirements[idx] ? '#EBF4EE' : '#FFFCF8',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          <input 
                            type="checkbox" 
                            checked={!!checkedRequirements[idx]} 
                            onChange={() => {}} // handled by parent div click
                            style={{ marginTop: 2, accentColor: '#4F7D5A', cursor: 'pointer' }}
                          />
                          <span style={{ 
                            fontSize: 12, 
                            color: checkedRequirements[idx] ? '#171717' : '#242424',
                            textDecoration: checkedRequirements[idx] ? 'line-through' : 'none',
                            fontWeight: 500,
                            lineHeight: 1.4
                          }}>
                            {req}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. ROADMAP TAB */}
                {activeTab === 'roadmap' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#171717', paddingBottom: 4, borderBottom: '1px solid #E8E2DC' }}>
                      Milestone Timeline Roadmap
                    </div>
                    
                    <div style={{ position: 'relative', paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {/* Vertical line indicator */}
                      <div style={{ 
                        position: 'absolute', 
                        left: 9, 
                        top: 10, 
                        bottom: 10, 
                        width: 2, 
                        background: '#E8E2DC', 
                        borderStyle: 'dashed' 
                      }}></div>

                      {responsePayload.actionableSteps?.map((step, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                          {/* Circle bullet */}
                          <div style={{ 
                            position: 'absolute', 
                            left: -24, 
                            top: 2, 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            background: idx === 0 ? '#E9783F' : '#FFFFFF', 
                            border: `2px solid ${idx === 0 ? '#E9783F' : '#E8E2DC'}`, 
                            boxShadow: '0 0 0 3px #FFFFFF' 
                          }}></div>

                          <div style={{ background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 8, padding: 10 }}>
                            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#171717', marginBottom: 2 }}>
                              Milestone {idx + 1}
                            </div>
                            <p style={{ fontSize: 12, color: '#242424', margin: 0, lineHeight: 1.45 }}>
                              {step}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. DOCUMENTS TAB */}
                {activeTab === 'documents' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#171717', paddingBottom: 4, borderBottom: '1px solid #E8E2DC' }}>
                      Required Registration Documents
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {responsePayload.requiredDocuments && responsePayload.requiredDocuments.length > 0 ? (
                        responsePayload.requiredDocuments.map((doc, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 10, border: '1px solid #E8E2DC', borderRadius: 8, background: '#FFFCF8' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <FileText style={{ width: 14, height: 14, color: '#F28C52' }} />
                              <span style={{ fontSize: 12, color: '#242424', fontWeight: 500 }}>{doc}</span>
                            </div>
                            <span style={{ fontSize: 9.5, fontWeight: 850, textTransform: 'uppercase', background: '#FFF1E8', color: '#E9783F', paddingLeft: 6, paddingRight: 6, paddingTop: 2, paddingBottom: 2, borderRadius: 4 }}>
                              Required
                            </span>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '40px 10px', textAlign: 'center', color: '#686868', fontSize: 11.5 }}>
                          No specific documents mapped for this query standard. General registration records apply.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. CITATIONS TAB */}
                {activeTab === 'citations' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#171717', paddingBottom: 4, borderBottom: '1px solid #E8E2DC' }}>
                      Grounded Citations &amp; Gazette Sources
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {responsePayload.citations && responsePayload.citations.length > 0 ? (
                        responsePayload.citations.map((cit, idx) => (
                          <div key={idx} style={{ background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, fontWeight: 700 }}>
                              <span style={{ color: '#171717' }}>{cit.standardNumber} &bull; Clause {cit.clause}</span>
                              <span style={{ color: '#4F7D5A', background: '#EBF4EE', paddingLeft: 6, paddingRight: 6, paddingTop: 1, paddingBottom: 1, borderRadius: 4, fontSize: 9 }}>
                                {cit.relevanceScore}% Match
                              </span>
                            </div>
                            <p style={{ fontSize: 11.5, fontStyle: 'italic', color: '#686868', margin: 0, fontFamily: 'Georgia, serif' }}>
                              &ldquo;{cit.snippet.slice(0, 160)}...&rdquo;
                            </p>
                            <a
                              href={cit.officialSource || '#'}
                              target="_blank"
                              rel="noreferrer"
                              style={{ 
                                alignSelf: 'flex-end',
                                color: '#E9783F', 
                                fontWeight: 700, 
                                fontSize: 11,
                                textDecoration: 'none', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 3 
                              }}
                            >
                              <span>Official Gazette Link</span>
                              <ArrowUpRight style={{ width: 12, height: 12 }} />
                            </a>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '40px 10px', textAlign: 'center', color: '#686868', fontSize: 11.5 }}>
                          No specific gazette citations retrieved for this general request.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: '#686868' }}>Loading BIS AI Assistant...</div>}>
      <AssistantContent />
    </Suspense>
  );
}

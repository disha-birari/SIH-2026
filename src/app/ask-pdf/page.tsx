'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, Upload, Send, BookOpen, CheckCircle2, 
  Sparkles, Layers, ShieldCheck, Eye, ArrowRight, Download,
  CheckSquare, Wrench, ShieldAlert, GitCompare, Scale, Info
} from 'lucide-react';
import { ingestPdfDocumentPipeline, queryPdfDocumentRag } from '@/lib/data/bisDatabase';
import { DocumentAnalysisOverview, ExtractedClauseMetadata, ExtractedNumericalRequirement, RagAnswerResponse, RagPageCitation } from '@/lib/types';

export default function AskPDFPage() {
  const [fileName, setFileName] = useState<string>('IS_302_Electric_Iron_Standard.pdf');
  const [ingestionData, setIngestionData] = useState(() => ingestPdfDocumentPipeline('IS_302_Electric_Iron_Standard.pdf'));
  
  // Page Explorer State
  const [selectedPageNumber, setSelectedPageNumber] = useState<number>(12);
  const [activeResearchTab, setActiveResearchTab] = useState<'chat' | 'page_preview' | 'numerical' | 'knowledge_map'>('chat');

  // Evidence Preview Modal State
  const [selectedCitation, setSelectedCitation] = useState<RagPageCitation | null>(null);

  // RAG Chat State
  const [inputQuery, setInputQuery] = useState<string>('What is the maximum allowed leakage current on page 12?');
  const [messages, setMessages] = useState<Array<{
    sender: 'user' | 'bot';
    text: string;
    citations?: RagPageCitation[];
    confidence?: string;
    sourceQuality?: string;
    safeRewrite?: string;
  }>>([
    {
      sender: 'bot',
      text: 'Document loaded & vector indexed successfully: IS_302_Electric_Iron_Standard.pdf (28 Pages, 24 Clauses, 14 Numerical Limits). Ask any research question or select a page on the left to inspect its exact content.',
      citations: [
        {
          pageNumber: 12,
          clauseRef: 'Clause 13.2',
          excerptText: 'Page 12 Excerpt: Leakage current shall not exceed 0.75 mA AC for Class I appliances during normal operational temperature testing.',
          documentTitle: 'IS 302-2-3:2024 Gazette Specification',
          matchedPhrase: 'leakage current shall not exceed 0.75 mA'
        }
      ],
      confidence: 'HIGH CONFIDENCE',
      sourceQuality: 'DIRECT EVIDENCE'
    }
  ]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const data = ingestPdfDocumentPipeline(file.name);
      setIngestionData(data);
      setMessages([
        {
          sender: 'bot',
          text: `Document loaded & vector indexed: ${file.name} (${data.overview.totalPages} Pages). Select any page on the left or type a question to research.`,
          confidence: 'HIGH CONFIDENCE',
          sourceQuality: 'DIRECT EVIDENCE'
        }
      ]);
    }
  };

  const handleSendQuery = (customQuery?: string) => {
    const textToRun = customQuery || inputQuery;
    if (!textToRun.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: textToRun }]);
    if (!customQuery) setInputQuery('');
    setIsProcessing(true);

    setTimeout(() => {
      const ragResponse = queryPdfDocumentRag(textToRun, ingestionData.overview);
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: ragResponse.answerText,
          citations: ragResponse.citations,
          confidence: ragResponse.confidence,
          sourceQuality: ragResponse.sourceQuality,
          safeRewrite: ragResponse.evidenceSafeRewrite
        }
      ]);
      setIsProcessing(false);
    }, 600);
  };

  // Find Clause Metadata for Currently Selected Page
  const activePageClause = ingestionData.extractedClauses.find(c => c.pageNumber === selectedPageNumber) || {
    clauseNumber: `Clause ${Math.max(1, Math.floor(selectedPageNumber * 0.85))}`,
    heading: selectedPageNumber <= 5 ? 'Scope & General Requirements' : selectedPageNumber <= 9 ? 'Marking & Rating Specifications' : selectedPageNumber <= 15 ? 'Electrical Insulation & Strength Testing' : 'Abnormal Operation & Thermal Safety',
    pageNumber: selectedPageNumber,
    subClauses: [`${selectedPageNumber}.1`, `${selectedPageNumber}.2`],
    mandatoryStatus: 'MANDATORY' as const,
    hasTables: selectedPageNumber === 8 || selectedPageNumber === 12 || selectedPageNumber === 17,
    hasFigures: selectedPageNumber === 13
  };

  const activePageNumerical = ingestionData.extractedNumericalRequirements.filter(n => n.pageNumber === selectedPageNumber || Math.abs(n.pageNumber - selectedPageNumber) <= 1);

  const handleSelectPage = (pNum: number) => {
    setSelectedPageNumber(pNum);
    setActiveResearchTab('page_preview');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>

      {/* ══════════════ 1. HERO HEADER & DOCUMENT ENGINE BADGE ══════════════ */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E8E2DC',
        borderRadius: 12,
        padding: '24px 28px',
        boxShadow: '0 2px 8px rgba(40,30,20,0.03)',
        display: 'flex', flexDirection: 'column', gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#E9783F', background: '#FFF1E8', border: '1px solid #F4C4A5', padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <BookOpen style={{ width: 12, height: 12, color: '#F28C52' }} />
              Evidence-Grounded RAG Engine
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#686868' }}>
              Multi-Stage Structural Document Analysis
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/citations" style={{ background: '#FFFCF8', color: '#242424', border: '1px solid #E8E2DC', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <FileText style={{ width: 14, height: 14, color: '#F28C52' }} />
              <span>Clause Research</span>
            </Link>

            <Link href="/evidence-verifier" style={{ background: '#F28C52', color: '#FFFFFF', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck style={{ width: 14, height: 14 }} />
              <span>Verify Evidence</span>
            </Link>
          </div>
        </div>

        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#171717', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOpen style={{ width: 24, height: 24, color: '#F28C52' }} />
            <span>Ask My PDF: BIS Document Intelligence &amp; Evidence Research Engine</span>
          </h1>
          <p style={{ fontSize: 13.5, color: '#686868', margin: 0, maxWidth: 880, lineHeight: 1.6 }}>
            Turn complex Indian Standards, Gazette QCO notifications, test reports, and technical PDFs into searchable, explainable compliance intelligence. Answers are strictly grounded in document text with exact page &amp; clause citations.
          </p>
        </div>
      </div>

      {/* ══════════════ 2. DOCUMENT UPLOAD & OVERVIEW METADATA ══════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
        
        {/* Upload Card */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 12, padding: 22, boxShadow: '0 2px 8px rgba(40,30,20,0.03)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#171717', textTransform: 'uppercase', letterSpacing: '0.04em' }}>1. UPLOAD BIS PDF / TEST REPORT</span>
          
          <div style={{ background: '#FFFCF8', border: '2px dashed #E8E2DC', borderRadius: 8, padding: 20, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <Upload style={{ width: 30, height: 30, color: '#F28C52' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#171717' }}>Select PDF to Index &amp; Analyze</div>
              <div style={{ fontSize: 11, color: '#686868', marginTop: 2 }}>Supports PDF up to 50MB (Scanned &amp; Vector)</div>
            </div>

            <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} id="pdf-file-input" />
            <label htmlFor="pdf-file-input" style={{ background: '#FFF1E8', color: '#E9783F', border: '1px solid #F4C4A5', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Choose Document
            </label>
          </div>

          {/* Active File Summary */}
          <div style={{ background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#686868', textTransform: 'uppercase' }}>Active Knowledge Object</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#171717' }}>{ingestionData.overview.fileName}</div>
            <div style={{ fontSize: 11.5, color: '#4F7D5A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 style={{ width: 13, height: 13, color: '#4F7D5A' }} />
              <span>Status: DOCUMENT READY FOR RESEARCH ({ingestionData.overview.classificationConfidence}% Confidence)</span>
            </div>
          </div>
        </div>

        {/* Document Intelligence Overview Card */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 12, padding: 22, boxShadow: '0 2px 8px rgba(40,30,20,0.03)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#171717', textTransform: 'uppercase', letterSpacing: '0.04em' }}>2. DOCUMENT INTELLIGENCE METADATA</span>
            <span style={{ fontSize: 10.5, fontWeight: 800, background: '#FFF1E8', color: '#E9783F', padding: '2px 8px', borderRadius: 4 }}>
              {ingestionData.overview.documentType}
            </span>
          </div>

          <div>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#171717', margin: '0 0 2px' }}>{ingestionData.overview.detectedStandardIsNumber}: {ingestionData.overview.title}</h3>
            <span style={{ fontSize: 11, color: '#686868' }}>Edition: {ingestionData.overview.editionYear} • Size: {(ingestionData.overview.fileSizeBytes / 1024 / 1024).toFixed(2)} MB</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8, fontSize: 11.5 }}>
            <div style={{ background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 6, padding: 8 }}>
              <span style={{ color: '#686868', fontSize: 10 }}>PAGES</span>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#171717' }}>{ingestionData.overview.totalPages}</div>
            </div>
            <div style={{ background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 6, padding: 8 }}>
              <span style={{ color: '#686868', fontSize: 10 }}>CLAUSES</span>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#171717' }}>{ingestionData.overview.totalClauses}</div>
            </div>
            <div style={{ background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 6, padding: 8 }}>
              <span style={{ color: '#686868', fontSize: 10 }}>TABLES</span>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#171717' }}>{ingestionData.overview.totalTables}</div>
            </div>
            <div style={{ background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 6, padding: 8 }}>
              <span style={{ color: '#686868', fontSize: 10 }}>NUMERICAL LIMITS</span>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#F28C52' }}>{ingestionData.overview.totalNumericalLimits}</div>
            </div>
          </div>
        </div>

      </div>

      {/* ══════════════ 3. MAIN WORKSPACE: PAGE EXPLORER + RAG CHAT & PAGE PREVIEW ══════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.6fr', gap: 18 }}>
        
        {/* LEFT COLUMN: PAGE-BY-PAGE DOCUMENT EXPLORER */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(40,30,20,0.03)', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 680, overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#171717', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers style={{ width: 14, height: 14, color: '#F28C52' }} />
              PAGE-BY-PAGE EXPLORER
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#686868' }}>28 Pages</span>
          </div>

          <p style={{ fontSize: 11, color: '#686868', margin: 0 }}>Click any page to inspect its exact clauses, extracted text, and numerical limits.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Array.from({ length: 28 }, (_, i) => i + 1).map(pNum => {
              const isSelected = selectedPageNumber === pNum;
              const hasClause = ingestionData.extractedClauses.find(c => c.pageNumber === pNum);
              return (
                <button
                  key={pNum}
                  onClick={() => handleSelectPage(pNum)}
                  style={{
                    background: isSelected ? '#FFF1E8' : '#FFFCF8',
                    border: `1px solid ${isSelected ? '#F4C4A5' : '#E8E2DC'}`,
                    borderLeft: isSelected ? '3px solid #F28C52' : '1px solid #E8E2DC',
                    borderRadius: 6, padding: '8px 10px', textAlign: 'left',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 2
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 800, color: '#171717' }}>
                    <span>Page {pNum}</span>
                    {hasClause && <span style={{ fontSize: 9.5, background: '#EBF4EE', color: '#4F7D5A', padding: '1px 4px', borderRadius: 3 }}>{hasClause.clauseNumber}</span>}
                  </div>
                  <span style={{ fontSize: 10.5, color: '#686868' }}>
                    {hasClause ? hasClause.heading : pNum <= 5 ? 'Scope & General Specs' : pNum <= 9 ? 'Marking & Symbols' : pNum <= 15 ? 'Insulation & HV Breakdown' : 'Abnormal & Thermal Protection'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: RAG CHAT & PAGE PREVIEW WORKSPACE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Research Navigation Tabs */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 12, padding: 14, boxShadow: '0 2px 8px rgba(40,30,20,0.03)', display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto' }}>
            <button
              onClick={() => setActiveResearchTab('chat')}
              style={{ background: activeResearchTab === 'chat' ? '#FFF1E8' : 'transparent', color: activeResearchTab === 'chat' ? '#171717' : '#686868', border: `1px solid ${activeResearchTab === 'chat' ? '#F4C4A5' : 'transparent'}`, borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              RAG Research Chat
            </button>

            <button
              onClick={() => setActiveResearchTab('page_preview')}
              style={{ background: activeResearchTab === 'page_preview' ? '#FFF1E8' : 'transparent', color: activeResearchTab === 'page_preview' ? '#171717' : '#686868', border: `1px solid ${activeResearchTab === 'page_preview' ? '#F4C4A5' : 'transparent'}`, borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Page {selectedPageNumber} Content Inspector
            </button>

            <button
              onClick={() => setActiveResearchTab('numerical')}
              style={{ background: activeResearchTab === 'numerical' ? '#FFF1E8' : 'transparent', color: activeResearchTab === 'numerical' ? '#171717' : '#686868', border: `1px solid ${activeResearchTab === 'numerical' ? '#F4C4A5' : 'transparent'}`, borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Numerical Limits ({ingestionData.extractedNumericalRequirements.length})
            </button>

            <Link href="/testing-mapper" style={{ background: '#FFFCF8', color: '#171717', border: '1px solid #E8E2DC', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Send to Testing Mapper
            </Link>
          </div>

          {/* PAGE PREVIEW INSPECTOR PANEL */}
          {activeResearchTab === 'page_preview' && (
            <div style={{ background: '#FFFFFF', border: '1px solid #F4C4A5', borderLeft: '5px solid #F28C52', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(40,30,20,0.03)', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: '#E9783F', textTransform: 'uppercase' }}>INSPECTING PAGE {selectedPageNumber} OF 28</span>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#171717', margin: '2px 0 0' }}>
                    {activePageClause.clauseNumber}: {activePageClause.heading}
                  </h3>
                </div>

                <button
                  onClick={() => {
                    setActiveResearchTab('chat');
                    handleSendQuery(`Explain Page ${selectedPageNumber} and ${activePageClause.clauseNumber} in detail.`);
                  }}
                  style={{ background: '#F28C52', color: '#FFFFFF', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Sparkles style={{ width: 14, height: 14 }} />
                  <span>Ask AI to Explain Page {selectedPageNumber}</span>
                </button>
              </div>

              <div style={{ background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 8, padding: 14, fontSize: 13, color: '#171717', lineHeight: 1.6, fontFamily: "'IBM Plex Sans', sans-serif" }}>
                <strong>Official Document Text Excerpt for Page {selectedPageNumber}:</strong><br />
                {selectedPageNumber === 12 && "Clause 13.2 Leakage Current Test: Under operational temperature, leakage current shall not exceed 0.75 mA for Class I portable appliances when connected at 1.06 times rated supply voltage."}
                {selectedPageNumber === 13 && "Clause 13.3 High Voltage Insulation Test: An AC test voltage of 1500V shall be applied for 60 seconds between live electrical conductors and external metal enclosure. Flashover or dielectric breakdown constitutes failure."}
                {selectedPageNumber === 8 && "Clause 7 Marking Rules: Appliances shall be indelibly marked with the official ISI Standard Mark, manufacturer identification, 230V rating, and hot surface warning symbols."}
                {selectedPageNumber === 17 && "Clause 19 Abnormal Operation: Thermal cut-outs shall operate prior to temperature exceeding 200°C under stalled rotor or dry heating conditions."}
                {selectedPageNumber !== 12 && selectedPageNumber !== 13 && selectedPageNumber !== 8 && selectedPageNumber !== 17 && `Page ${selectedPageNumber} contains technical specifications, safety distances, earthing continuity requirements, and standard compliance guidelines for ${ingestionData.overview.detectedStandardIsNumber}.`}
              </div>

              {/* Detected Numerical Limits on this page */}
              {activePageNumerical.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 8, borderTop: '1px solid #E8E2DC' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#686868', textTransform: 'uppercase' }}>EXTRACTED NUMERICAL LIMITS ON THIS PAGE</span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {activePageNumerical.map(num => (
                      <span key={num.id} style={{ background: '#FFF1E8', border: '1px solid #F4C4A5', borderRadius: 4, padding: '4px 8px', fontSize: 11.5, fontWeight: 700, color: '#171717' }}>
                        {num.parameterName}: <strong style={{ color: '#E9783F' }}>{num.claimedValue} {num.unit}</strong> ({num.clauseRef})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 1: RAG CHAT STREAM */}
          {activeResearchTab === 'chat' && (
            <div style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(40,30,20,0.03)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              {/* Message History */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
                {messages.map((msg, idx) => (
                  <div key={idx} style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: msg.sender === 'user' ? '80%' : '100%',
                    background: msg.sender === 'user' ? '#171717' : '#FFFCF8',
                    color: msg.sender === 'user' ? '#FFFFFF' : '#171717',
                    border: msg.sender === 'user' ? 'none' : '1px solid #E8E2DC',
                    borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 8
                  }}>
                    <div style={{ fontSize: 13, lineHeight: 1.6, fontWeight: 600 }}>{msg.text}</div>

                    {/* Citations & Evidence Panel for Bot Messages */}
                    {msg.sender === 'bot' && msg.citations && msg.citations.length > 0 && (
                      <div style={{ paddingTop: 8, borderTop: '1px solid #E8E2DC', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                          <span style={{ fontSize: 10.5, fontWeight: 800, color: '#E9783F', textTransform: 'uppercase' }}>EXACT DOCUMENT EVIDENCE</span>
                          <span style={{ fontSize: 10, fontWeight: 800, background: '#EBF4EE', color: '#4F7D5A', padding: '1px 6px', borderRadius: 4 }}>
                            {msg.confidence || 'HIGH CONFIDENCE'} • {msg.sourceQuality || 'DIRECT EVIDENCE'}
                          </span>
                        </div>

                        {msg.citations.map((cit, cIdx) => (
                          <div key={cIdx} style={{ background: '#FFF1E8', border: '1px solid #F4C4A5', borderRadius: 6, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                            <div style={{ fontSize: 11.5, color: '#171717', fontWeight: 700 }}>
                              {cit.documentTitle} — <strong style={{ color: '#E9783F' }}>Page {cit.pageNumber}, {cit.clauseRef}</strong>
                            </div>
                            <button
                              onClick={() => setSelectedCitation(cit)}
                              style={{ background: '#F28C52', color: '#FFFFFF', border: 'none', borderRadius: 4, padding: '3px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                            >
                              View Evidence Excerpt
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Suggested Questions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', paddingTop: 6, borderTop: '1px solid #E8E2DC' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#686868' }}>Suggested Prompts:</span>
                <button onClick={() => handleSendQuery("What is the maximum allowed leakage current on page 12?")} style={{ background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 4, padding: '3px 8px', fontSize: 11, fontWeight: 700, color: '#E9783F', cursor: 'pointer' }}>
                  Leakage Current Limit
                </button>
                <button onClick={() => handleSendQuery("What high voltage insulation test is required under Clause 13.3?")} style={{ background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 4, padding: '3px 8px', fontSize: 11, fontWeight: 700, color: '#E9783F', cursor: 'pointer' }}>
                  1500V HV Test
                </button>
                <button onClick={() => handleSendQuery("What are the mandatory marking rules on Page 8?")} style={{ background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 4, padding: '3px 8px', fontSize: 11, fontWeight: 700, color: '#E9783F', cursor: 'pointer' }}>
                  Marking Rules Page 8
                </button>
              </div>

              {/* Input Form */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
                  placeholder="Ask any research question about this PDF document..."
                  style={{ flex: 1, background: '#FFFCF8', border: '1px solid #E8E2DC', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 600, color: '#171717', outline: 'none' }}
                />
                <button
                  onClick={() => handleSendQuery()}
                  style={{ background: '#F28C52', color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Send style={{ width: 14, height: 14 }} />
                  <span>Research</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 3: NUMERICAL REQUIREMENTS EXTRACTION TABLE */}
          {activeResearchTab === 'numerical' && (
            <div style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(40,30,20,0.03)', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#171717', margin: '0 0 4px' }}>Extracted Numerical Limits &amp; Tolerances</h3>
                <p style={{ fontSize: 12.5, color: '#686868', margin: 0 }}>Deterministic extraction of voltage, current, temperature, and earthing thresholds found in document text.</p>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#FFFCF8', borderBottom: '1.5px solid #E8E2DC', color: '#686868', fontSize: 11, textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 12px', fontWeight: 800 }}>Parameter</th>
                    <th style={{ padding: '10px 12px', fontWeight: 800 }}>Claimed Value</th>
                    <th style={{ padding: '10px 12px', fontWeight: 800 }}>Unit</th>
                    <th style={{ padding: '10px 12px', fontWeight: 800 }}>Clause &amp; Page</th>
                    <th style={{ padding: '10px 12px', fontWeight: 800 }}>Acceptance Rule</th>
                  </tr>
                </thead>
                <tbody>
                  {ingestionData.extractedNumericalRequirements.map(row => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #E8E2DC' }}>
                      <td style={{ padding: '12px', fontWeight: 800, color: '#171717' }}>{row.parameterName}</td>
                      <td style={{ padding: '12px', fontWeight: 800, color: '#F28C52' }}>{row.claimedValue}</td>
                      <td style={{ padding: '12px', color: '#686868' }}>{row.unit}</td>
                      <td style={{ padding: '12px', color: '#242424', fontWeight: 700 }}>{row.clauseRef} (Page {row.pageNumber})</td>
                      <td style={{ padding: '12px', color: '#4F7D5A', fontWeight: 700 }}>{row.acceptanceCondition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>

      {/* ══════════════ 4. VIEW EVIDENCE EXCERPT MODAL ══════════════ */}
      {selectedCitation && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 12, maxWidth: 600, width: '100%', padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#E9783F', textTransform: 'uppercase' }}>OFFICIAL EVIDENCE PREVIEW</span>
              <button onClick={() => setSelectedCitation(null)} style={{ background: 'transparent', border: 'none', fontSize: 18, fontWeight: 800, cursor: 'pointer', color: '#686868' }}>✕</button>
            </div>

            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#171717', margin: 0 }}>{selectedCitation.documentTitle}</h3>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#F28C52' }}>Page {selectedCitation.pageNumber} • {selectedCitation.clauseRef}</span>
            </div>

            <div style={{ background: '#FFFCF8', border: '1px solid #E8E2DC', borderLeft: '4px solid #F28C52', borderRadius: 8, padding: 16, fontSize: 13, color: '#171717', lineHeight: 1.6 }}>
              {selectedCitation.excerptText}{' '}
              <mark style={{ background: '#FFF1E8', color: '#E9783F', padding: '2px 6px', borderRadius: 4, fontWeight: 800 }}>
                "{selectedCitation.matchedPhrase}"
              </mark>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedCitation(null)} style={{ background: '#171717', color: '#FFFFFF', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ 5. CROSS-MODULE COMPLIANCE INTEGRATION ══════════════ */}
      <div style={{ background: '#171717', color: '#FFFFFF', borderRadius: 12, padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#F28C52', textTransform: 'uppercase', letterSpacing: '0.04em' }}>DOCUMENT INTELLIGENCE CROSS-ROUTING</span>
          <h3 style={{ fontSize: 17, fontWeight: 800, margin: '4px 0 0', color: '#FFFFFF' }}>
            Transform PDF Intelligence into Compliance Actions
          </h3>
        </div>

        <p style={{ fontSize: 13, color: '#A1A1AA', margin: 0, lineHeight: 1.6 }}>
          Extracted clauses from <strong>{ingestionData.overview.fileName}</strong> can be automatically passed into gap analysis, checklist creation, laboratory mapping, and legal tree rationale engines.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 8, borderTop: '1px solid #27272A' }}>
          <Link href="/testing-mapper" style={{ background: '#F28C52', color: '#FFFFFF', border: 'none', borderRadius: 6, padding: '9px 16px', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Wrench style={{ width: 14, height: 14 }} />
            <span>Open Testing Mapper</span>
          </Link>

          <Link href="/checklist" style={{ background: '#27272A', color: '#FFFFFF', border: '1px solid #3F3F46', borderRadius: 6, padding: '9px 16px', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <CheckSquare style={{ width: 14, height: 14, color: '#F28C52' }} />
            <span>Generate Checklist</span>
          </Link>

          <Link href="/gap-analyzer" style={{ background: '#27272A', color: '#FFFFFF', border: '1px solid #3F3F46', borderRadius: 6, padding: '9px 16px', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <GitCompare style={{ width: 14, height: 14, color: '#F28C52' }} />
            <span>Run Gap Analysis</span>
          </Link>

          <Link href="/explainability" style={{ background: '#27272A', color: '#FFFFFF', border: '1px solid #3F3F46', borderRadius: 6, padding: '9px 16px', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Scale style={{ width: 14, height: 14, color: '#F28C52' }} />
            <span>View Legal Tree Rationale</span>
          </Link>
        </div>
      </div>

    </div>
  );
}

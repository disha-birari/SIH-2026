'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, Upload, Send, Bot, User, BookOpen, CheckCircle2, 
  Sparkles, RefreshCw, ChevronRight, FileCheck, AlertTriangle, BookOpenCheck
} from 'lucide-react';

interface Citation {
  pageNumber: number;
  snippet: string;
  relevanceScore: number | null;
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
  pageRef?: string;
  citations?: Citation[];
}

export default function AskPDFPage() {
  const [fileName, setFileName] = useState<string>('IS_302_Electric_Iron_Standard.pdf');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'Sample document IS_302_Electric_Iron_Standard.pdf loaded. To chat with a custom PDF standard, choose a file below to parse, embed, and index it locally in the database.',
      pageRef: 'Sample Document'
    }
  ]);
  const [inputQuery, setInputQuery] = useState<string>('Summarize this document');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [chunksCount, setChunksCount] = useState<number>(0);
  const [isIndexed, setIsIndexed] = useState<boolean>(false);

  // Ingest and index custom PDF
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setIsUploading(true);
    setUploadStatus('Uploading PDF...');
    setIsIndexed(false);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      setUploadStatus('Parsing text & generating vector embeddings...');
      const response = await fetch('/api/pdf/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process PDF file.');
      }
      
      setChunksCount(data.chunksCount);
      setIsIndexed(true);
      setUploadStatus('Indexing complete!');
      setMessages([
        {
          sender: 'bot',
          text: `Document successfully parsed, embedded and stored in database: "${file.name}" (${data.chunksCount} chunks).\n\nAsk any question (e.g., "Summarize this PDF" or technical questions) and I will search the vector database and answer using local AI.`,
          pageRef: 'Doc Indexing Ready'
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setUploadStatus('Indexing failed.');
      setMessages([
        {
          sender: 'bot',
          text: `Error indexing document: ${err.message || err}. Please verify that the local Ollama server is running and the "nomic-embed-text" model is pulled.`,
          pageRef: 'Error'
        }
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputQuery.trim()) return;

    const userText = inputQuery;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInputQuery('');
    setIsProcessing(true);

    // If they haven't indexed a custom document and are querying the mock document
    if (!isIndexed && fileName === 'IS_302_Electric_Iron_Standard.pdf') {
      setTimeout(() => {
        let botResponse = '';
        let citations: Citation[] = [];
        let pageRef = 'Page 12, Clause 13.2';

        if (/summarize|summary|overview/i.test(userText)) {
          botResponse = `### Executive Summary: IS 302-2-3 (Electric Irons)
This standard covers safety and testing requirements for household dry and steam electric irons.
- **Key Safety Metric**: Insulation breakdown voltage must resist 1500V AC. Earthing resistance must be under 0.1 Ohm.
- **Parameters**: Leakage current threshold is limited to 0.75mA. Thermostat control should maintain soleplate temperature within calibration limits (110°C to 220°C).
- **Compliance Scheme**: Scheme-I (ISI Mark) is mandatory.`;
          pageRef = 'Summary';
        } else {
          botResponse = `According to Page 12, Clause 13.2 of the uploaded document: "The leakage current shall not exceed 0.75 mA for Class I portable electrical appliances when operated at 1.06 times rated voltage." High-voltage insulation test must be conducted at 1500V AC.`;
          citations = [
            {
              pageNumber: 12,
              snippet: 'The leakage current shall not exceed 0.75 mA for Class I portable electrical appliances when operated at 1.06 times rated voltage.',
              relevanceScore: 98
            }
          ];
        }
        
        setMessages(prev => [
          ...prev, 
          { 
            sender: 'bot', 
            text: botResponse,
            pageRef: pageRef,
            citations: citations.length > 0 ? citations : undefined
          }
        ]);
        setIsProcessing(false);
      }, 1000);
      return;
    }

    try {
      const response = await fetch('/api/pdf/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userText,
          fileName: fileName
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to query PDF standard.');
      }

      let pageRef = 'Local LLM';
      if (data.isSummary) {
        pageRef = 'Doc Summary';
      } else if (data.citations && data.citations.length > 0) {
        const pages = Array.from(new Set(data.citations.map((c: any) => c.pageNumber))).sort((a: any, b: any) => a - b);
        pageRef = `Page ${pages.join(', ')}`;
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: data.answer,
          pageRef: pageRef,
          citations: data.citations
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `Error retrieving answer: ${err.message || err}. Ensure local Ollama service is active.`,
          pageRef: 'Query Error'
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-emerald-800 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              BIS Document RAG
            </span>
            <span className="text-teal-200 text-xs font-semibold">Custom Document Vector RAG Chat</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Ask My PDF (Document AI Assistant)
          </h1>
          <p className="text-teal-100 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            Upload any BIS standard PDF, test report, or factory layout manual. Chat directly with your document to receive exact page-level citations and grounded summaries.
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href="/multilingual" className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1 border border-white/20">
            <span>Multi-Language</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - PDF Upload & Status */}
        <div className="lg:col-span-1 space-y-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
              1. Upload BIS PDF / Test Report
            </label>
            <div className="border-2 border-dashed border-teal-300 bg-teal-50/50 rounded-xl p-4 text-center hover:bg-teal-100/50 transition cursor-pointer relative">
              <Upload className="w-8 h-8 text-teal-600 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-slate-800">Select PDF File to Index</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Supports PDF up to 50MB</p>
              <input 
                type="file" 
                className="hidden" 
                id="pdfUpload"
                accept=".pdf"
                disabled={isUploading}
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                }}
              />
              <label htmlFor="pdfUpload" className={`inline-block mt-2 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold px-3 py-1.5 rounded cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                Choose Document
              </label>
            </div>
          </div>

          {/* Active File Info */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center space-x-2 text-teal-900 font-extrabold text-xs">
              <FileCheck className="w-4 h-4 text-teal-600" />
              <span className="truncate">{fileName}</span>
            </div>
            <div className="text-[11px] text-slate-600 space-y-1 font-medium">
              <p>&bull; Status: <strong className={isIndexed ? "text-emerald-700" : isUploading ? "text-amber-600" : "text-slate-500"}>
                {isUploading ? uploadStatus : isIndexed ? `Vector Indexed (${chunksCount} Chunks)` : 'Sample Document (Mock)'}
              </strong></p>
              <p>&bull; Embedding Model: <strong>nomic-embed-text / RAG</strong></p>
              <p>&bull; Citation Precision: <strong>Exact Page Level</strong></p>
            </div>
          </div>

          {isUploading && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-xs flex items-start space-x-2 font-medium">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold">Indexing Document...</p>
                <p className="text-[10px] text-amber-800 mt-0.5">Please wait. Processing standard text and building vector representations on local database.</p>
              </div>
            </div>
          )}

          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs space-y-2">
            <h4 className="font-bold text-orange-400 uppercase text-[11px]">Suggested Questions</h4>
            <ul className="space-y-1.5 text-slate-300 font-medium cursor-pointer">
              <li onClick={() => setInputQuery("Summarize this document")} className="hover:text-white hover:underline">
                &bull; Summarize this document
              </li>
              <li onClick={() => setInputQuery("List all testing equipment mentioned in this document.")} className="hover:text-white hover:underline">
                &bull; List all testing equipment mentioned.
              </li>
              <li onClick={() => setInputQuery("Identify the mandatory quality inspection rules.")} className="hover:text-white hover:underline">
                &bull; Identify mandatory quality inspection rules.
              </li>
            </ul>
          </div>

        </div>

        {/* Right Column - RAG Chat Box */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[560px]">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-900 text-white rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-teal-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider truncate max-w-[250px] sm:max-w-none">
                Document Vector Chat: {fileName}
              </h3>
            </div>
            <span className="bg-teal-500/20 border border-teal-400/40 text-teal-200 text-[10px] px-2 py-0.5 rounded font-extrabold">
              Grounded PDF Reader
            </span>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 space-y-2 ${
                  msg.sender === 'user' 
                    ? 'bg-teal-600 text-white font-medium rounded-tr-none' 
                    : 'bg-slate-100 text-slate-900 border border-slate-200 rounded-tl-none'
                }`}>
                  <div className="flex items-center justify-between font-bold text-[10px] opacity-80 border-b border-black/10 pb-1">
                    <span>{msg.sender === 'user' ? 'You' : 'Document Assistant'}</span>
                    {msg.pageRef && (
                      <span className="bg-white/40 text-slate-900 font-extrabold px-1.5 py-0.5 rounded">
                        {msg.pageRef}
                      </span>
                    )}
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {/* Grounded Excerpts & Citations collapsible box */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-350 space-y-1.5">
                      <details className="group">
                        <summary className="text-[10px] font-bold uppercase text-slate-500 hover:text-slate-800 cursor-pointer flex items-center space-x-1 select-none">
                          <BookOpenCheck className="w-3.5 h-3.5 text-teal-600" />
                          <span>View Grounded Excerpts & Citations</span>
                          <span className="text-[9px] bg-slate-200 text-slate-700 px-1 py-0.25 rounded font-extrabold">
                            {msg.citations.length} sources
                          </span>
                        </summary>
                        <div className="mt-2 pl-2 border-l-2 border-teal-500 space-y-2 max-h-[180px] overflow-y-auto pr-1">
                          {msg.citations.map((cit, idx) => (
                            <div key={idx} className="bg-white p-2 rounded border border-slate-200 space-y-1">
                              <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
                                <span>Page {cit.pageNumber}</span>
                                {cit.relevanceScore !== null && (
                                  <span className="text-[8px] px-1 py-0.25 rounded bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-100">
                                    {cit.relevanceScore}% match
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] italic text-slate-700 font-serif leading-normal">
                                "{cit.snippet}"
                              </p>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3 text-slate-600 flex items-center space-x-2 text-xs">
                  <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
                  <span>Searching document vector embeddings & retrieving page citation...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask any question about your uploaded PDF document..."
                className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <button 
                onClick={handleSendMessage}
                disabled={isProcessing || isUploading}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-1 disabled:opacity-50"
              >
                <span>Ask PDF</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

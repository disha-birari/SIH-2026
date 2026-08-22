'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, Upload, Send, Bot, User, BookOpen, CheckCircle2, 
  Sparkles, RefreshCw, ChevronRight, FileCheck
} from 'lucide-react';

export default function AskPDFPage() {
  const [fileName, setFileName] = useState<string>('IS_302_Electric_Iron_Standard.pdf');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; pageRef?: string }>>([
    {
      sender: 'bot',
      text: 'Document loaded successfully: IS_302_Electric_Iron_Standard.pdf (28 Pages). Ask any question about this document and I will provide answers with exact page number citations.',
      pageRef: 'Doc Indexing Ready'
    }
  ]);
  const [inputQuery, setInputQuery] = useState<string>('What is the maximum allowed leakage current on page 12?');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleSendMessage = () => {
    if (!inputQuery.trim()) return;

    const userText = inputQuery;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInputQuery('');
    setIsProcessing(true);

    setTimeout(() => {
      // Simulate RAG response on PDF document
      const botResponse = `According to Page 12, Clause 13.2 of the uploaded document: "The leakage current shall not exceed 0.75 mA for Class I portable electrical appliances when operated at 1.06 times rated voltage." High-voltage insulation test must be conducted at 1500V AC.`;
      
      setMessages(prev => [
        ...prev, 
        { 
          sender: 'bot', 
          text: botResponse,
          pageRef: 'Page 12, Clause 13.2'
        }
      ]);
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-orange-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-orange-100 text-orange-800 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              BIS Document RAG
            </span>
            <span className="text-slate-500 text-xs font-semibold">Custom Document Vector RAG Chat</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-slate-900">
            Ask My PDF (Document AI Assistant)
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            Upload any BIS standard PDF, test report, or factory layout manual. Chat directly with your document to receive exact page-level citations and grounded summaries.
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href="/assistant" className="bg-orange-600 hover:bg-orange-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1 shadow-sm">
            <span>AI Assistant</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - PDF Upload & Status */}
        <div className="lg:col-span-1 space-y-5 bg-white p-5 rounded-xl border border-orange-200 shadow-sm">
          
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
              1. Upload BIS PDF / Test Report
            </label>
            <div className="border-2 border-dashed border-orange-300 bg-orange-50/40 rounded-xl p-4 text-center hover:bg-orange-100/50 transition cursor-pointer">
              <Upload className="w-8 h-8 text-orange-600 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-slate-800">Select PDF File to Index</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Supports PDF up to 50MB</p>
              <input 
                type="file" 
                className="hidden" 
                id="pdfUpload"
                onChange={(e) => {
                  if (e.target.files?.[0]) setFileName(e.target.files[0].name);
                }}
              />
              <label htmlFor="pdfUpload" className="inline-block mt-2 bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold px-3 py-1.5 rounded cursor-pointer shadow-sm">
                Choose Document
              </label>
            </div>
          </div>

          {/* Active File Info */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center space-x-2 text-orange-950 font-extrabold text-xs">
              <FileCheck className="w-4 h-4 text-orange-600" />
              <span className="truncate">{fileName}</span>
            </div>
            <div className="text-[11px] text-slate-600 space-y-1 font-medium">
              <p>&bull; Status: <strong className="text-orange-900">Vector Indexed (28 Chunks)</strong></p>
              <p>&bull; Embedding Model: <strong>nomic-embed-text / RAG</strong></p>
              <p>&bull; Citation Precision: <strong>Exact Page Level</strong></p>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs space-y-2">
            <h4 className="font-bold text-orange-400 uppercase text-[11px]">Suggested Questions</h4>
            <ul className="space-y-1.5 text-slate-300 font-medium cursor-pointer">
              <li onClick={() => setInputQuery("What is the high voltage insulation breakdown requirement?")} className="hover:text-white hover:underline">
                &bull; What is the high voltage breakdown requirement?
              </li>
              <li onClick={() => setInputQuery("List all mandatory testing equipment in this document.")} className="hover:text-white hover:underline">
                &bull; List mandatory testing equipment.
              </li>
              <li onClick={() => setInputQuery("What are the marking and ISI logo printing rules?")} className="hover:text-white hover:underline">
                &bull; What are the marking and ISI logo printing rules?
              </li>
            </ul>
          </div>

        </div>

        {/* Right Column - RAG Chat Box */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[560px]">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-900 text-white rounded-t-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-orange-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider">
                Document Vector Chat: {fileName}
              </h3>
            </div>
            <span className="bg-orange-500/20 border border-orange-400/40 text-orange-200 text-[10px] px-2 py-0.5 rounded font-extrabold">
              Grounded PDF Reader
            </span>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl p-4 space-y-2 ${
                  msg.sender === 'user' 
                    ? 'bg-orange-600 text-white font-medium rounded-tr-none shadow-sm' 
                    : 'bg-orange-50/50 text-slate-900 border border-orange-200 rounded-tl-none'
                }`}>
                  <div className="flex items-center justify-between font-bold text-[10px] opacity-90 border-b border-black/10 pb-1">
                    <span>{msg.sender === 'user' ? 'You' : 'Document Assistant'}</span>
                    {msg.pageRef && (
                      <span className="bg-white/60 text-slate-900 font-extrabold px-1.5 py-0.5 rounded">
                        {msg.pageRef}
                      </span>
                    )}
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-slate-600 flex items-center space-x-2 text-xs">
                  <RefreshCw className="w-4 h-4 animate-spin text-orange-600" />
                  <span>Searching document vector embeddings & retrieving page citation...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 rounded-b-xl">
            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask any question about your uploaded PDF document..."
                className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
              <button 
                onClick={handleSendMessage}
                disabled={isProcessing}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-1 shadow-sm"
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

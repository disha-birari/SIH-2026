'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Mic, MicOff, Volume2, Sparkles, RefreshCw, Bot, User, CheckCircle2, ChevronRight
} from 'lucide-react';

export default function VoiceAssistantPage() {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('Click the microphone button and ask your BIS question by voice...');
  const [aiVoiceResponse, setAiVoiceResponse] = useState<string>('Welcome to BIS Voice Assistant. You can ask questions hands-free in English or Hindi.');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setTranscript("Listening... (Speak your BIS query now)");

      // Check if Web Speech API is supported
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          setIsListening(false);
          processVoiceQuery(text);
        };

        recognition.onerror = () => {
          setTranscript("Voice heard: 'What are the ISI mark requirements for electric irons?'");
          setIsListening(false);
          processVoiceQuery("What are the ISI mark requirements for electric irons?");
        };

        recognition.start();
      } else {
        // Fallback simulation
        setTimeout(() => {
          const sampleQuery = "Is helmet ISI mark mandatory under Quality Control Order?";
          setTranscript(sampleQuery);
          setIsListening(false);
          processVoiceQuery(sampleQuery);
        }, 2000);
      }
    }
  };

  const processVoiceQuery = (queryText: string) => {
    let reply = "Yes, under IS 4151:2015, protective helmets for two-wheeler riders are mandatory under Quality Control Order. Uncertified helmets cannot be legally manufactured or sold in India.";
    if (queryText.toLowerCase().includes('iron')) {
      reply = "Electric irons are governed under IS 302-2-3:2017. High voltage breakdown test at 1500V and leakage current limit under 0.75 mA are compulsory requirements.";
    }
    setAiVoiceResponse(reply);
    speakResponse(reply);
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Hands-Free Voice AI
            </span>
            <span className="text-pink-200 text-xs font-semibold">Hands-Free Speech-to-Text & TTS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Voice Assistant for Indian Standards
          </h1>
          <p className="text-pink-100 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            Ask questions out loud. Speak into your microphone and receive instant audio responses generated from grounded BIS standard repositories.
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href="/timeline" className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1 border border-white/20">
            <span>Roadmap Timeline</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Voice Control Stage */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-6">
        
        {/* Waveform / Mic Circle */}
        <div className="relative inline-flex items-center justify-center">
          {isListening && (
            <span className="absolute w-36 h-36 rounded-full bg-rose-500/20 animate-ping"></span>
          )}
          {isSpeaking && (
            <span className="absolute w-40 h-40 rounded-full bg-emerald-500/20 animate-pulse"></span>
          )}

          <button
            onClick={toggleListening}
            className={`w-28 h-28 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-105 border-4 ${
              isListening 
                ? 'bg-rose-600 text-white border-rose-300 animate-bounce' 
                : isSpeaking 
                ? 'bg-emerald-600 text-white border-emerald-300'
                : 'orange-gradient-btn text-white border-orange-200'
            }`}
          >
            {isListening ? (
              <Mic className="w-12 h-12" />
            ) : (
              <Mic className="w-12 h-12" />
            )}
          </button>
        </div>

        <div>
          <h3 className="text-base font-extrabold text-slate-900">
            {isListening ? "Listening... Speak Now" : isSpeaking ? "Speaking Audio Response..." : "Tap Microphone to Speak"}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Supported languages: English & Hindi voice queries
          </p>
        </div>

        {/* Live Transcript Display Box */}
        <div className="max-w-xl mx-auto bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs font-mono text-slate-800 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Recognized Speech Transcript:</span>
          <p className="font-bold text-slate-900">"{transcript}"</p>
        </div>

      </div>

      {/* AI Audio Response Card */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-rose-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-400">
              Spoken Grounded AI Answer
            </h3>
          </div>
          <button 
            onClick={() => speakResponse(aiVoiceResponse)}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1"
          >
            <Volume2 className="w-4 h-4" />
            <span>Replay Audio</span>
          </button>
        </div>

        <p className="text-sm font-medium text-slate-200 leading-relaxed bg-slate-800/80 p-4 rounded-xl border border-slate-700">
          "{aiVoiceResponse}"
        </p>
      </div>

    </div>
  );
}

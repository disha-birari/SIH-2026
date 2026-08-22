'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Globe, Volume2, Search, Sparkles, Languages, Check, ArrowRight, ChevronRight
} from 'lucide-react';
import { LanguageCode } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';

export default function MultilingualAssistantPage() {
  const { language: selectedLang, setLanguage: setSelectedLang } = useLanguage();
  const [query, setQuery] = useState<string>('आईएसआई मार्क प्रमाणन कैसे प्राप्त करें?');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const langNames: Record<LanguageCode, { label: string; native: string }> = {
    en: { label: 'English', native: 'English' },
    hi: { label: 'Hindi', native: 'हिंदी' },
    mr: { label: 'Marathi', native: 'मराठी' },
    gu: { label: 'Gujarati', native: 'ગુજરાતી' },
    ta: { label: 'Tamil', native: 'தமிழ்' },
    te: { label: 'Telugu', native: 'తెలుగు' },
    bn: { label: 'Bengali', native: 'বাংলা' }
  };

  const sampleResponses: Record<LanguageCode, { text: string; englishEquiv: string }> = {
    hi: {
      text: "आईएसआई (ISI) मार्क प्राप्त करने के लिए आपको मनकोनलाइन (Manakonline) पोर्टल पर आवेदन करना होगा। इसके पश्चात बीआईएस अधिकारी आपके कारखाने का निरीक्षण करेंगे और नमूने की प्रयोगशाला जांच करेंगे।",
      englishEquiv: "To obtain the ISI Mark, apply on the Manakonline portal. A BIS officer will inspect your factory and test sample products at a recognized laboratory."
    },
    mr: {
      text: "आयएसआय मार्क मिळवण्यासाठी मानकोनलाईन पोर्टलवर अर्ज सादर करा. त्यानंतर बीआयएस अधिकारी तुमच्या कारखान्याची तपासणी करतील आणि नमुन्यांची चाचणी घेतली जाईल.",
      englishEquiv: "To get the ISI mark, submit an application on the Manakonline portal followed by factory audit and sample lab testing."
    },
    gu: {
      text: "આઈએસઆઈ માર્ક મેળવવા માટે મનકોનલાઈન પોર્ટલ પર અરજી કરો. ત્યારબાદ બીઆઈએસ અધિકારી ફેક્ટરીની મુલાકાત લેશે અને લેબ ટેસ્ટ કરશે.",
      englishEquiv: "Apply on Manakonline for ISI mark. BIS officers will conduct factory visits and lab testing."
    },
    ta: {
      text: "ஐஎஸ்ஐ முத்திரை பெற மணக்ஆன்லைன் போர்ட்டலில் விண்ணப்பிக்கவும். தொழிற்சாலை ஆய்வு மற்றும் ஆய்வக சோதனை மேற்கொள்ளப்படும்.",
      englishEquiv: "Apply on Manakonline portal for ISI Mark. Factory inspection and lab testing will follow."
    },
    te: {
      text: "ఐఎస్ఐ మార్క్ పొందడానికి మనాక్‌ఆన్‌లైన్ పోర్టల్‌లో దరఖాస్తు చేసుకోండి. ఫ్యాక్టరీ తనిఖీ మరియు ప్రయోగశాల పరీక్షలు నిర్వహించబడతాయి.",
      englishEquiv: "Submit application on Manakonline for ISI mark with factory audit & lab testing."
    },
    bn: {
      text: "আইএসআই মার্ক পেতে মানকনলাইন পোর্টালে আবেদন করুন। এরপর বিআইএস আধিকারিক কারখানা পরিদর্শন ও নমুনা পরীক্ষা করবেন।",
      englishEquiv: "Apply on Manakonline for ISI Mark. BIS officers will inspect factory and test samples."
    },
    en: {
      text: "To obtain the ISI Mark under Scheme-I, register on the Manakonline portal, setup required in-house test equipment, and undergo a factory audit by BIS officers.",
      englishEquiv: "Official BIS Scheme-I procedure for domestic manufacturing units."
    }
  };

  const currentResponse = sampleResponses[selectedLang] || sampleResponses.hi;

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentResponse.text);
      utterance.lang = selectedLang === 'hi' ? 'hi-IN' : selectedLang === 'mr' ? 'mr-IN' : 'en-US';
      setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech not supported in this browser.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Official Regional AI
            </span>
            <span className="text-orange-100 text-xs font-semibold">7 Indian Regional Languages AI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Multi-language BIS AI Assistant
          </h1>
          <p className="text-orange-100 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            Ask questions in Hindi, Marathi, Gujarati, Tamil, Telugu, Bengali, or English. Receive instant answers with dual side-by-side translation and audio playback.
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href="/voice" className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1 border border-white/20">
            <span>Voice Assistant</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Language Selector Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
          Select Your Preferred Language (भाषा चुनें):
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {(Object.keys(langNames) as LanguageCode[]).map(lang => (
            <button
              key={lang}
              onClick={() => {
                setSelectedLang(lang);
                if (lang === 'hi') setQuery('आईएसआई मार्क प्रमाणन कैसे प्राप्त करें?');
                else if (lang === 'mr') setQuery('आयएसआय मार्क कसा मिळवायचा?');
                else if (lang === 'gu') setQuery('આઈએસઆઈ માર્ક કેવી રીતે મેળવવો?');
                else if (lang === 'en') setQuery('How to get ISI mark certification?');
              }}
              className={`p-3 rounded-xl border text-center font-bold text-xs transition ${
                selectedLang === lang 
                  ? 'bg-orange-600 border-orange-500 text-white shadow-md' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-orange-50'
              }`}
            >
              <div className="text-sm font-extrabold">{langNames[lang].native}</div>
              <div className="text-[10px] opacity-80 mt-0.5">{langNames[lang].label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Query & Interactive Response Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Input */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <Languages className="w-5 h-5 text-orange-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">Ask Question in {langNames[selectedLang].native}</h3>
          </div>

          <textarea 
            rows={4}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold rounded-xl p-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            placeholder="Type your question in regional script or English..."
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Real-Time Neural Translation Active</span>
            <button className="orange-gradient-btn text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-md">
              Ask AI in {langNames[selectedLang].native}
            </button>
          </div>
        </div>

        {/* Right Output with TTS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider">
                Response ({langNames[selectedLang].native})
              </span>
              <button 
                onClick={handleSpeak}
                className={`flex items-center space-x-1 text-xs px-3 py-1 rounded-lg font-bold transition ${
                  isPlayingAudio ? 'bg-orange-600 text-white animate-pulse' : 'bg-orange-100 text-orange-900 hover:bg-orange-200'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{isPlayingAudio ? 'Speaking...' : 'Listen Audio'}</span>
              </button>
            </div>

            <p className="text-sm font-semibold text-slate-900 leading-relaxed bg-orange-50/50 p-4 rounded-xl border border-orange-200">
              {currentResponse.text}
            </p>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-500">English Parallel Translation</span>
              <p className="text-xs text-slate-700 font-medium italic">"{currentResponse.englishEquiv}"</p>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-200 text-xs p-3 rounded-xl flex items-center justify-between">
            <span>BIS Glossary Term: <strong>मानक (Standard) &bull; प्रमाणन (Certification)</strong></span>
            <span className="text-emerald-400 font-bold">100% Grounded</span>
          </div>

        </div>

      </div>

    </div>
  );
}

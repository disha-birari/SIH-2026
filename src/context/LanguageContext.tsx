'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageCode } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/translations';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: typeof TRANSLATIONS['en'];
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: TRANSLATIONS['en'],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bis_app_language') as LanguageCode;
      if (saved && TRANSLATIONS[saved]) {
        setLanguageState(saved);
      }
    } catch (e) {
      console.warn("LocalStorage warning", e);
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('bis_app_language', lang);
      
      // Trigger Google Translate DOM Translation for 100% full-site translation
      const cookieVal = lang === 'en' ? '' : `/en/${lang}`;
      document.cookie = `googtrans=${cookieVal}; path=/; domain=${window.location.hostname}`;
      document.cookie = `googtrans=${cookieVal}; path=/;`;
      
      const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (combo) {
        combo.value = lang;
        combo.dispatchEvent(new Event('change'));
      } else {
        // If combo not ready yet, reload with googtrans cookie set
        window.location.reload();
      }
    } catch (e) {
      console.warn("LocalStorage warning", e);
    }
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

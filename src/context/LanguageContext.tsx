'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { translations, Language, LocaleTranslations } from '@/locales';

interface LanguageContextType {
  lang: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  // Load saved language on mount
  useEffect(() => {
    try {
      const savedLang = (Cookies.get('lang') || localStorage.getItem('lang')) as Language;
      if (savedLang === 'en' || savedLang === 'bn') {
        setLangState(savedLang);
      }
    } catch {
      // ignore in environments without localStorage
    }
  }, []);

  const setLanguage = useCallback((newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('lang', newLang);
      Cookies.set('lang', newLang, { expires: 365, path: '/' });
      // Update HTML lang attribute
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLang;
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(lang === 'en' ? 'bn' : 'en');
  }, [lang, setLanguage]);

  // Nested translation lookup helper (e.g. 'nav.dashboard' or 'common.save')
  const t = useCallback(
    (key: string, fallback?: string): string => {
      const keys = key.split('.');
      let current: unknown = translations[lang];

      for (const k of keys) {
        if (current && typeof current === 'object' && k in (current as Record<string, unknown>)) {
          current = (current as Record<string, unknown>)[k];
        } else {
          // Fallback to English if missing in target language
          let enCurrent: unknown = translations.en;
          for (const ek of keys) {
            if (enCurrent && typeof enCurrent === 'object' && ek in (enCurrent as Record<string, unknown>)) {
              enCurrent = (enCurrent as Record<string, unknown>)[ek];
            } else {
              return fallback || key;
            }
          }
          return typeof enCurrent === 'string' ? enCurrent : fallback || key;
        }
      }

      return typeof current === 'string' ? current : fallback || key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

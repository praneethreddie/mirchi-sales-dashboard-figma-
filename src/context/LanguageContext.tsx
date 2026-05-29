import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Lang } from '../lib/translations';

const LanguageContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
} | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('app_lang') as Lang | null;
      if (saved) setLang(saved);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('app_lang', lang);
    } catch (e) {
      // ignore
    }
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

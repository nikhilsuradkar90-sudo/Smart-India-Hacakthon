import { createContext, useContext, type ReactNode } from 'react';
import type { LanguageCode } from '@/types';
import { DEFAULT_LANGUAGE, LANGUAGES } from '@/data/constants';

// ============================================================
// Language context — maintains selected language across the app
// Phase 2 will add full UI translations and multilingual AI
// ============================================================

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  languages: typeof LANGUAGES;
}

export const LanguageContext = createContext<LanguageContextValue>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  languages: LANGUAGES,
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({
  language,
  setLanguage,
  children,
}: {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  children: ReactNode;
}) {
  const handleSetLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    
    // Google Translate Auto-Translate Hack
    const code = lang === 'en' ? '' : lang;
    
    // Set cookies so Google Translate picks it up on reload
    if (lang === 'en') {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${window.location.hostname}; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.localhost; path=/;`;
    } else {
      document.cookie = `googtrans=/en/${code}; path=/;`;
      document.cookie = `googtrans=/en/${code}; domain=${window.location.hostname}; path=/;`;
      document.cookie = `googtrans=/en/${code}; domain=.localhost; path=/;`;
    }

    // Reload the page so Google Translate applies cleanly to the original DOM. 
    // This prevents the duplicate translation bug when changing languages multiple times!
    setTimeout(() => {
      window.location.reload();
    }, 150);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

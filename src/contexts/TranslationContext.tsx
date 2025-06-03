
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translateText, getLanguageFromCountry } from '@/services/translationService';
import { getUserLocation } from '@/services/webScraping';

interface TranslationContextType {
  currentLanguage: string;
  translate: (text: string) => Promise<string>;
  isTranslating: boolean;
  setCurrentLanguage: (lang: string) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationCache, setTranslationCache] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    detectUserLanguage();
  }, []);

  const detectUserLanguage = async () => {
    try {
      const location = await getUserLocation();
      const language = getLanguageFromCountry(location.countryCode);
      setCurrentLanguage(language);
      
      // Store in localStorage for persistence
      localStorage.setItem('userLanguage', language);
    } catch (error) {
      console.error('Failed to detect user language:', error);
      // Check localStorage for previously detected language
      const savedLanguage = localStorage.getItem('userLanguage');
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
      }
    }
  };

  const translate = async (text: string): Promise<string> => {
    if (currentLanguage === 'en' || !text.trim()) {
      return text;
    }

    // Check cache first
    const cacheKey = `${text}-${currentLanguage}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    setIsTranslating(true);
    try {
      const translated = await translateText(text, currentLanguage);
      
      // Cache the translation
      setTranslationCache(prev => new Map(prev).set(cacheKey, translated));
      
      return translated;
    } catch (error) {
      console.error('Translation failed:', error);
      return text;
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <TranslationContext.Provider value={{
      currentLanguage,
      translate,
      isTranslating,
      setCurrentLanguage
    }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

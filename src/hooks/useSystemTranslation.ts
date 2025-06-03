
import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

export const useSystemTranslation = (text: string) => {
  const [translatedText, setTranslatedText] = useState(text);
  const { translate, currentLanguage } = useTranslation();

  useEffect(() => {
    if (currentLanguage === 'en') {
      setTranslatedText(text);
      return;
    }

    translate(text).then(setTranslatedText);
  }, [text, translate, currentLanguage]);

  return translatedText;
};

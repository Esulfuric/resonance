
// Free translation service using Google Translate
const GOOGLE_TRANSLATE_API = 'https://translate.googleapis.com/translate_a/single';

// Language mappings based on country codes
const COUNTRY_LANGUAGE_MAP: Record<string, string> = {
  'US': 'en',
  'GB': 'en',
  'CA': 'en',
  'AU': 'en',
  'ES': 'es',
  'MX': 'es',
  'AR': 'es',
  'CO': 'es',
  'PE': 'es',
  'FR': 'fr',
  'BE': 'fr',
  'CH': 'fr',
  'DE': 'de',
  'AT': 'de',
  'IT': 'it',
  'PT': 'pt',
  'BR': 'pt',
  'RU': 'ru',
  'JP': 'ja',
  'KR': 'ko',
  'CN': 'zh',
  'TW': 'zh',
  'IN': 'hi',
  'NL': 'nl',
  'SE': 'sv',
  'NO': 'no',
  'DK': 'da',
  'FI': 'fi',
  'PL': 'pl',
  'TR': 'tr',
  'GR': 'el',
  'HU': 'hu',
  'CZ': 'cs',
  'RO': 'ro',
  'BG': 'bg',
  'HR': 'hr',
  'SI': 'si',
  'SK': 'sk',
  'LT': 'lt',
  'LV': 'lv',
  'EE': 'et'
};

export const getLanguageFromCountry = (countryCode: string): string => {
  return COUNTRY_LANGUAGE_MAP[countryCode] || 'en';
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (targetLanguage === 'en' || !text.trim()) {
    return text;
  }

  try {
    const url = `${GOOGLE_TRANSLATE_API}?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    }
    
    return text;
  } catch (error) {
    console.error('Translation failed:', error);
    return text;
  }
};

export const detectLanguage = async (text: string): Promise<string> => {
  try {
    const url = `${GOOGLE_TRANSLATE_API}?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text.substring(0, 100))}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data[2]) {
      return data[2];
    }
    
    return 'en';
  } catch (error) {
    console.error('Language detection failed:', error);
    return 'en';
  }
};

export const shouldShowTranslateButton = (userLanguage: string, contentLanguage: string): boolean => {
  return userLanguage !== 'en' && contentLanguage !== userLanguage && contentLanguage !== 'en';
};

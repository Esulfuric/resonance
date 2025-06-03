
import React from 'react';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LANGUAGE_NAMES: Record<string, string> = {
  'en': 'English',
  'es': 'Español',
  'fr': 'Français',
  'de': 'Deutsch',
  'it': 'Italiano',
  'pt': 'Português',
  'ru': 'Русский',
  'ja': '日本語',
  'ko': '한국어',
  'zh': '中文',
  'hi': 'हिन्दी',
  'nl': 'Nederlands',
  'sv': 'Svenska',
  'no': 'Norsk',
  'da': 'Dansk',
  'fi': 'Suomi',
  'pl': 'Polski',
  'tr': 'Türkçe',
  'el': 'Ελληνικά',
  'hu': 'Magyar',
  'cs': 'Čeština',
  'ro': 'Română',
  'bg': 'Български',
  'hr': 'Hrvatski',
  'si': 'Slovenščina',
  'sk': 'Slovenčina',
  'lt': 'Lietuvių',
  'lv': 'Latviešu',
  'et': 'Eesti'
};

export const LanguageToggle: React.FC = () => {
  const { currentLanguage, setCurrentLanguage } = useTranslation();

  // Only show if user is not in English
  if (currentLanguage === 'en') {
    return null;
  }

  const currentLanguageName = LANGUAGE_NAMES[currentLanguage] || currentLanguage.toUpperCase();

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    localStorage.setItem('userLanguage', language);
    // Reload the page to apply the language change
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          <span className="text-sm">{currentLanguageName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
          🇺🇸 English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange(currentLanguage)}>
          🌐 {currentLanguageName} (Current)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

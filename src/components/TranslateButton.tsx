
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Languages, Loader2 } from 'lucide-react';
import { translateText, detectLanguage, shouldShowTranslateButton } from '@/services/translationService';
import { useTranslation } from '@/contexts/TranslationContext';

interface TranslateButtonProps {
  content: string;
  onTranslate: (translatedContent: string) => void;
  className?: string;
}

export const TranslateButton: React.FC<TranslateButtonProps> = ({
  content,
  onTranslate,
  className = ""
}) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [originalContent, setOriginalContent] = useState('');
  const { currentLanguage } = useTranslation();

  const handleTranslate = async () => {
    if (isTranslated) {
      // Revert to original
      onTranslate(originalContent);
      setIsTranslated(false);
      return;
    }

    setIsTranslating(true);
    try {
      // Detect content language
      const contentLanguage = await detectLanguage(content);
      
      if (shouldShowTranslateButton(currentLanguage, contentLanguage)) {
        setOriginalContent(content);
        const translated = await translateText(content, currentLanguage);
        onTranslate(translated);
        setIsTranslated(true);
      }
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  // Don't show button if user's language is English
  if (currentLanguage === 'en') {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleTranslate}
      className={`gap-1 text-muted-foreground hover:text-primary ${className}`}
      disabled={isTranslating}
    >
      {isTranslating ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Languages className="h-3 w-3" />
      )}
      <span className="text-xs">
        {isTranslated ? 'Original' : 'Translate'}
      </span>
    </Button>
  );
};

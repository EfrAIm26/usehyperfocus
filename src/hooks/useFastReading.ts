// Custom hook for Fast Reading (Bionic Reading)
import { useMemo } from 'react';
import type { FontStyle } from '../types';

/**
 * Apply Bionic Reading algorithm to text
 * Makes the first part of words bold to enable faster reading
 */
export function applyBionicReading(text: string): { __html: string } {
  // Process each word
  const words = text.split(/(\s+)/); // Split but keep whitespace
  
  const processedWords = words.map(word => {
    // Skip whitespace
    if (/^\s+$/.test(word)) {
      return word;
    }

    // Skip very short words
    if (word.length <= 1) {
      return word;
    }

    // Calculate how many characters to bold based on word length
    let boldLength = 1;
    
    if (word.length >= 2 && word.length <= 3) {
      boldLength = 1; // 1 char bold (50% for 2-char words)
    } else if (word.length >= 4 && word.length <= 5) {
      boldLength = Math.ceil(word.length * 0.5); // 50% bold
    } else if (word.length >= 6 && word.length <= 8) {
      boldLength = Math.ceil(word.length * 0.4); // 40% bold
    } else if (word.length >= 9) {
      boldLength = Math.ceil(word.length * 0.35); // 35% bold
    }

    const boldPart = word.slice(0, boldLength);
    const normalPart = word.slice(boldLength);

    return `<strong>${boldPart}</strong>${normalPart}`;
  });

  return { __html: processedWords.join('') };
}

/**
 * Hook to apply reading style to text
 */
export function useFastReading(text: string, fontStyle: FontStyle) {
  const processedText = useMemo(() => {
    if (fontStyle === 'bionic') {
      return applyBionicReading(text);
    }
    
    // For normal and dyslexic, return plain text
    return { __html: text };
  }, [text, fontStyle]);

  const fontClass = useMemo(() => {
    switch (fontStyle) {
      case 'bionic':
        return 'font-sans';
      case 'dyslexic':
        return 'font-dyslexic';
      case 'lexend':
        return 'font-lexend';
      case 'normal':
      default:
        return 'font-sans';
    }
  }, [fontStyle]);

  return {
    processedText,
    fontClass,
  };
}


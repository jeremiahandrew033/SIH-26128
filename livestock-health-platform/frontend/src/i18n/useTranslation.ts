import { useState } from 'react';
import { Language, translations } from './translations';

export function useTranslation() {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('farmer_language') as Language) || 'en';
  });

  const changeLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('farmer_language', newLang);
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return { lang, changeLanguage, t };
}

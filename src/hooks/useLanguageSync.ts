import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Hook to sync language preference with localStorage and user profile
export function useLanguageSync() {
  const { i18n } = useTranslation();
  const { user } = useAuth();

  // Load language from profile on login
  useEffect(() => {
    const loadLanguageFromProfile = async () => {
      if (!user) return;

      // Use localStorage as primary source since preferred_language column may not exist
      const savedLang = localStorage.getItem('language');
      if (savedLang && savedLang !== i18n.language) {
        i18n.changeLanguage(savedLang);
        updateDocumentDirection(savedLang);
      }
    };

    loadLanguageFromProfile();
  }, [user, i18n]);

  // Update document direction for RTL languages
  const updateDocumentDirection = useCallback((lang: string) => {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    const isRtl = rtlLanguages.includes(lang);
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, []);

  // Change language and save to localStorage
  const changeLanguage = useCallback(async (lang: string) => {
    // Change language immediately
    await i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    updateDocumentDirection(lang);
  }, [i18n, updateDocumentDirection]);

  // Set initial direction
  useEffect(() => {
    updateDocumentDirection(i18n.language);
  }, [i18n.language, updateDocumentDirection]);

  return { changeLanguage, currentLanguage: i18n.language };
}

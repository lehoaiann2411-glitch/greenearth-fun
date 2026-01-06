import { vi, enUS, zhCN, es, fr, de, pt, ja, ru, ar, hi } from 'date-fns/locale';
import type { Locale } from 'date-fns';

const localeMap: Record<string, Locale> = {
  vi,
  en: enUS,
  zh: zhCN,
  es,
  fr,
  de,
  pt,
  ja,
  ru,
  ar,
  hi,
};

export const getDateLocale = (langCode: string): Locale => 
  localeMap[langCode] || enUS;

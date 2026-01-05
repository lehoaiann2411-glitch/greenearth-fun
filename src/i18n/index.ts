import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import vi from './vi.json';
import en from './en.json';
import zh from './zh.json';
import es from './es.json';
import hi from './hi.json';
import ar from './ar.json';
import fr from './fr.json';
import pt from './pt.json';
import ru from './ru.json';
import ja from './ja.json';
import de from './de.json';

const savedLanguage = typeof window !== 'undefined' 
  ? localStorage.getItem('language') || 'vi' 
  : 'vi';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
      zh: { translation: zh },
      es: { translation: es },
      hi: { translation: hi },
      ar: { translation: ar },
      fr: { translation: fr },
      pt: { translation: pt },
      ru: { translation: ru },
      ja: { translation: ja },
      de: { translation: de },
    },
    lng: savedLanguage,
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

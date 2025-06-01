import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en/common.json';
import viTranslations from './locales/vi/common.json';

const resources = {
  en: {
    translation: enTranslations
  },
  vi: {
    translation: viTranslations
  }
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'vi', // Default to Vietnamese
    lng: 'vi', // Default language
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false // React already does escaping
    },

    detection: {
      // Order of language detection methods
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Keys to look for language in localStorage
      lookupLocalStorage: 'i18nextLng',
      // Cache user language
      caches: ['localStorage'],
      // Exclude certain routes from detection
      excludeCacheFor: ['cimode']
    },

    // Namespace configuration
    defaultNS: 'translation',
    ns: ['translation'],

    // React specific options
    react: {
      // Trigger a rerender when language changes
      useSuspense: false,
      // Bind i18n instance to React component
      bindI18n: 'languageChanged',
      // Bind store to React component  
      bindI18nStore: 'added removed',
      // Transform i18n options for React component
      transEmptyNodeValue: '',
      // Set default parent element for Trans component
      transSupportBasicHtmlNodes: true,
      // Set which events trigger a re-render
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p']
    }
  });

export default i18n;

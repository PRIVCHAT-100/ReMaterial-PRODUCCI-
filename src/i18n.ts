import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import es from './locales/es.json';
import ca from './locales/ca.json';
import en from './locales/en.json';

const resources = { es: { translation: es }, ca: { translation: ca }, en: { translation: en } };

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('lang') || 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
});

export function setLanguage(lng: 'es' | 'ca' | 'en') {
  i18n.changeLanguage(lng);
  try { localStorage.setItem('lang', lng); } catch {}
}

export default i18n;

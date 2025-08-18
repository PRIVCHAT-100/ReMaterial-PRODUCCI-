import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import es from './locales/es.json';
import ca from './locales/ca.json';
import en from './locales/en.json';

// Auto-generated bundles (no pasa nada si no existen en el primer commit)
import esAuto from './locales/es.auto.json';
import caAuto from './locales/ca.auto.json';
import enAuto from './locales/en.auto.json';

const resources = {
  es: { translation: { ...es, ...(esAuto as any) } },
  ca: { translation: { ...ca, ...(caAuto as any) } },
  en: { translation: { ...en, ...(enAuto as any) } },
};

i18n.use(initReactI18next).init({
  resources,
  lng: (typeof localStorage !== 'undefined' && localStorage.getItem('lang')) || 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
});

export function setLanguage(lng: 'es' | 'ca' | 'en') {
  i18n.changeLanguage(lng);
  try { localStorage.setItem('lang', lng); } catch {}
}

export default i18n;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import esBase from './locales/es.json';
import caBase from './locales/ca.json';
import enBase from './locales/en.json';

import esAuto from './locales/es.auto.json';
import caAuto from './locales/ca.auto.json';
import enAuto from './locales/en.auto.json';

// Convierte claves planas con puntos en objetos anidados.
function expandFlatKeys(obj: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [flatKey, value] of Object.entries(obj || {})) {
    const parts = flatKey.split('.');
    let ptr = out;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (i === parts.length - 1) {
        ptr[p] = value;
      } else {
        if (typeof ptr[p] !== 'object' || ptr[p] == null) ptr[p] = {};
        ptr = ptr[p] as Record<string, any>;
      }
    }
  }
  return out;
}

// Mezcla profunda: b tiene prioridad sobre a.
function deepMerge<T extends Record<string, any>>(a: T, b: T): T {
  const out = { ...(a || {}) } as T;
  for (const [k, v] of Object.entries(b || {})) {
    if (v && typeof v === 'object' && !Array.isArray(v) && typeof out[k] === 'object' && out[k] !== null) {
      (out as any)[k] = deepMerge((out as any)[k], v);
    } else {
      (out as any)[k] = v;
    }
  }
  return out;
}

const esAutoExpanded = expandFlatKeys(esAuto as any);
const enAutoExpanded = expandFlatKeys(enAuto as any);
const caAutoExpanded = expandFlatKeys(caAuto as any);

// Damos prioridad a los textos curados (Base) sobre los auto.
const esMerged = deepMerge(esAutoExpanded, esBase as any);
const enMerged = deepMerge(enAutoExpanded, enBase as any);
const caMerged = deepMerge(caAutoExpanded, caBase as any);

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: esMerged },
      en: { translation: enMerged },
      ca: { translation: caMerged },
    },
    lng: (typeof localStorage !== 'undefined' && localStorage.getItem('lang')) || 'es',
    fallbackLng: 'es',
    interpolation: { escapeValue: false },
    ns: ['translation'],
    defaultNS: 'translation',
    // Fallback legible si alguna clave puntual faltara.
    parseMissingKeyHandler: (key) => {
      const last = (key || '').split('.').pop() || key;
      const cleaned = last.replace(/[-_]/g, ' ');
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    },
  });

export function setLanguage(lng: 'es' | 'ca' | 'en') {
  i18n.changeLanguage(lng);
  try { localStorage.setItem('lang', lng); } catch {}
}

export default i18n;

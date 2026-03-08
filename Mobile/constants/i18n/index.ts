import { bg } from './bg';
import { en } from './en';
import { useLanguageStore } from '../../store/useLanguageStore';

export type { TranslationKeys } from './bg';
export { bg, en };

const translations = { bg, en };

export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  const dict = translations[language] || bg;

  function t(key: string): string {
    const parts = key.split('.');
    let result: any = dict;
    for (const part of parts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part];
      } else {
        let fallback: any = bg;
        for (const p of parts) {
          if (fallback && typeof fallback === 'object' && p in fallback) {
            fallback = fallback[p];
          } else {
            return key;
          }
        }
        return typeof fallback === 'string' ? fallback : key;
      }
    }
    return typeof result === 'string' ? result : key;
  }

  return { t, language };
}

export function localizedField(
  obj: Record<string, any>,
  field: string,
  language: string
): string {
  const langField = `${field}_${language}`;
  const fallbackField = `${field}_bg`;
  return obj[langField] || obj[fallbackField] || obj[field] || '';
}

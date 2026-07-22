import { useGlobalStore } from '../stores/globalStore';
import { translations } from './translations';

export const useLanguage = () => {
  const { config } = useGlobalStore();
  const language = config?.lang?.toLowerCase() || 'en';
  const langText = (translations as any)[language] || (translations as any)['en'];

  const t = (key: string) => {
    return langText[key] || key;
  };

  return { t, language, langText };
};
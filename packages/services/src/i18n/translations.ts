import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import ptBr from './locales/pt-br.json';
import de from './locales/de.json';
import pl from './locales/pl.json';
import zh from './locales/zh.json';
import zhHans from './locales/zh-hans.json';
import zhHant from './locales/zh-hant.json';
import zhYue from './locales/zh-yue.json';
import cmn from './locales/cmn.json';
import yue from './locales/yue.json';

export const translations: Record<string, any> = {
  en,
  es,
  pt,
  'pt-br': ptBr,
  de,
  pl,
  zh,
  'zh-hans': zhHans,
  'zh-hant': zhHant,
  'zh-yue': zhYue,
  cmn,
  yue,
};

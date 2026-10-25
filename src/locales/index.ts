import { en, LocaleTranslations } from './en';
import { bn } from './bn';

export type Language = 'en' | 'bn';

export const translations: Record<Language, LocaleTranslations> = {
  en,
  bn,
};

export { en, bn };
export type { LocaleTranslations };

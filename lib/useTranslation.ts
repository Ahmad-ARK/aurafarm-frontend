'use client';

import { translations } from './translations';

type Lang = 'ur' | 'en' | 'pa';

export function useTranslation() {
    const lang = (
        typeof window !== 'undefined'
            ? (localStorage.getItem('farmerLanguage') || 'ur')
            : 'ur'
    ) as Lang;

    const dict = translations[lang] || translations.ur;
    const fallback = translations.en;

    function t(key: string, vars?: Record<string, string | number>): string {
        let str = dict[key] ?? fallback[key] ?? key;
        if (vars) {
            Object.entries(vars).forEach(([k, v]) => {
                str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
            });
        }
        return str;
    }

    return { t, lang, isUrdu: lang === 'ur' };
}

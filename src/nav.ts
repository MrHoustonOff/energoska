// Навигация для компонентов вне экрана (кнопки в шапке). Экран при монтировании регистрирует go(); Shell не меняется.
let goFn: ((id: string) => void) | null = null;
export const registerGo = (fn: (id: string) => void) => { goFn = fn; };
export const navigate = (id: string) => goFn?.(id);

/** Параметры перехода между экранами блока (какая банка открыта и т.п.). */
export const navParams: { drinkId: string; shopId: string; brandId: string; from: string } = { drinkId: 'burn-apple-kiwi', shopId: '', brandId: '', from: '' };

import { SCREEN_BY_ID } from './screens';
/** Заголовок в шапке Shell задаётся реестром; для экранов с названием банки меняем его перед переходом. */
export const setTitle = (id: string, title: string) => { if (SCREEN_BY_ID[id]) SCREEN_BY_ID[id].title = title; };

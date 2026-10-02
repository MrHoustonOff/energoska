// Навигация для компонентов вне экрана (кнопки в шапке). Экран при монтировании регистрирует go(); Shell не меняется.
let goFn: ((id: string) => void) | null = null;
export const registerGo = (fn: (id: string) => void) => { goFn = fn; };
export const navigate = (id: string) => goFn?.(id);

/** Параметры перехода между экранами блока (какая банка открыта и т.п.). */
export const navParams: { drinkId: string; shopId: string; brandId: string; from: string } = { drinkId: 'burn-apple-kiwi', shopId: '', brandId: '', from: '' };

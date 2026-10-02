// Состояние оценки живёт, пока человек идёт по ней: шаг, значения фейдеров и поля шага 2 (магазин выбирается на экране «пикеры» и возвращается сюда).
export const rate = $state({ step: 1 as 1 | 2, vals: [] as number[], shop: '', price: '', currency: 'BYN' as 'BYN' | 'RUB', comment: '' });
export const resetRate = () => Object.assign(rate, { step: 1, vals: [], shop: '', price: '', currency: 'BYN', comment: '' });

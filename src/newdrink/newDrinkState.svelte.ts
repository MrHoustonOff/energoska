// Состояние мастера «Новая банка»: живёт, пока приложение открыто; сбрасывается после «К списку».
export interface NTag { name: string; color: string }
const fresh = () => ({ step: 1 as 1 | 2 | 3, name: '', energy: true, brand: '', brandColor: 'var(--can-gorilla)', country: 'by' as 'by' | 'ru', sugar: true,
  tags: [] as NTag[], kcal: '', protein: '', fat: '', carb: '' });
export const nd = $state(fresh());
export const resetNd = () => Object.assign(nd, fresh());

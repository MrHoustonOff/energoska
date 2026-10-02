// Состояние каталога живёт, пока открыто приложение: «назад» из карточки возвращает чип, фильтры и прокрутку.
export type Kind = 'all' | 'energy' | 'non';
export type Country = 'all' | 'by' | 'ru';

export const cat = $state({ chip: 'all', scroll: 0, filtersOpen: false, kind: 'all' as Kind, country: 'all' as Country });

export const activeFilters = () => (cat.kind !== 'all' ? 1 : 0) + (cat.country !== 'all' ? 1 : 0);
export const resetFilters = () => { cat.kind = 'all'; cat.country = 'all'; };

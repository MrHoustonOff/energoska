// Модуль реактивного состояния каталога (Svelte 5 runes).
import type { Drink, Rating } from '../api/types';
import type { QuickFilter, TypeFilter, CountryFilter } from '../domain';
import * as store from '../store';

export interface NewDrinkDraft {
  id?: string;
  name: string;
  brand: string;
  is_energy: boolean;
  volume_ml: number;
  sugar_g_per_100ml: number | null;
  country: 'BY' | 'RU';
  tags: string[];
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
}

const defaultDraft = (): NewDrinkDraft => ({
  name: '',
  brand: '',
  is_energy: true,
  volume_ml: 450,
  sugar_g_per_100ml: 110,
  country: 'BY',
  tags: [],
  calories: 45,
  proteins: 0,
  fats: 0,
  carbs: 11,
});

class CatalogState {
  selectedDrinkId = $state<string | null>(store.get('catalog_drink_id', null));
  searchOpen = $state(false);
  searchQuery = $state('');
  filtersOpen = $state(false);

  quickFilter = $state<QuickFilter>('all');
  typeFilter = $state<TypeFilter>('all');
  countryFilter = $state<CountryFilter>('all');

  /** Кэш оценок по id банки. */
  ratingsCache = $state<Record<string, Rating[]>>({});
  /** Черновик новой банки при создании. */
  draft = $state<NewDrinkDraft>(defaultDraft());
  /** Последняя сохранённая банка для экрана NewDrinkSaved. */
  lastSavedDrink = $state<Drink | null>(null);

  /** Число активных фильтров шторки (тип и страна, если не «Все»). */
  get activeFiltersCount(): number {
    let c = 0;
    if (this.typeFilter !== 'all') c++;
    if (this.countryFilter !== 'all') c++;
    return c;
  }

  selectDrink(id: string) {
    this.selectedDrinkId = id;
    store.set('catalog_drink_id', id);
  }

  setRatings(drinkId: string, ratings: Rating[]) {
    this.ratingsCache = { ...this.ratingsCache, [drinkId]: ratings };
  }

  resetFilters() {
    this.quickFilter = 'all';
    this.typeFilter = 'all';
    this.countryFilter = 'all';
    this.searchQuery = '';
  }

  resetDraft() {
    this.draft = defaultDraft();
  }
}

export const catalogState = new CatalogState();

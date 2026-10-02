// MOCK-DEMO: действующие лица и каталог банок демо (имена и числа взяты из макетов docs-src/components/*/preview.html).
// Правишь здесь — меняется всё демо. Оценки в десятых (85 = 8.5). Сахар в десятых грамма на 100 мл (110 = 11,0 г).

export interface Person { login: string; password: string; name: string; color: string; invite: string }

/** Я: тестовый аккаунт admin / admin. */
export const ME: Person = { login: 'admin', password: 'admin', name: 'Влад', color: '#c6f135', invite: 'EV-1000' };
/** Партнёр(ша). Пароль ≥ 8 символов, чтобы входить обычным способом. */
export const HER: Person = { login: 'dasha', password: 'dasha1234', name: 'Даша', color: '#ff4fa3', invite: 'EV-2000' };

export interface DemoDrink {
  brand: string; name: string; volume_ml: number; sugar: number | null; country: 'BY' | 'RU'; energy: boolean;
  /** Цвет банки. */ color: string;
  /** Средняя оценка в десятых: я / партнёр. */ me: number; her: number;
  /** Есть ли фото (иначе «фото скоро»). */ photo: boolean;
  /** Как часто берут, вес. */ weight: number;
}

/** Первые N банок попадают в каталог профиля (профили задают N), поэтому самые «своё» стоят в начале. */
export const DRINKS: DemoDrink[] = [
  { brand: 'Gorilla', name: 'Gorilla Mango Coconut', volume_ml: 450, sugar: 110, country: 'BY', energy: true, color: '#f2a73b', me: 85, her: 70, photo: true, weight: 9 },
  { brand: 'Lit', name: 'Lit Strawberry', volume_ml: 450, sugar: 105, country: 'BY', energy: true, color: '#ff4f8b', me: 75, her: 82, photo: true, weight: 8 },
  { brand: 'Burn', name: 'Burn Apple', volume_ml: 449, sugar: 110, country: 'RU', energy: true, color: '#7cc242', me: 70, her: 64, photo: true, weight: 6 },
  { brand: 'Monster', name: 'Monster Energy Ultra', volume_ml: 500, sugar: 0, country: 'RU', energy: true, color: '#c9ced6', me: 78, her: 55, photo: true, weight: 6 },
  { brand: 'Adrenaline', name: 'Adrenaline Rush', volume_ml: 449, sugar: 116, country: 'RU', energy: true, color: '#1766d6', me: 58, her: 50, photo: true, weight: 4 },
  { brand: 'Gorilla', name: 'Gorilla Cherry', volume_ml: 450, sugar: 110, country: 'BY', energy: true, color: '#c0213f', me: 72, her: 78, photo: false, weight: 5 },
  { brand: 'Lit', name: 'Lit Energy', volume_ml: 450, sugar: 105, country: 'BY', energy: true, color: '#3aa0ff', me: 66, her: 60, photo: false, weight: 5 },
  { brand: 'Burn', name: 'Burn Original', volume_ml: 449, sugar: 113, country: 'RU', energy: true, color: '#e0262b', me: 62, her: 58, photo: true, weight: 4 },
  { brand: 'Red Bull', name: 'Red Bull', volume_ml: 250, sugar: 110, country: 'RU', energy: true, color: '#1e3f8f', me: 55, her: 68, photo: true, weight: 4 },
  { brand: 'Monster', name: 'Monster Energy', volume_ml: 500, sugar: 112, country: 'RU', energy: true, color: '#86c440', me: 80, her: 72, photo: true, weight: 4 },
  { brand: 'Flash Up', name: 'Flash Up Energy', volume_ml: 450, sugar: 100, country: 'RU', energy: true, color: '#f26a1b', me: 48, her: 52, photo: false, weight: 3 },
  { brand: 'Tornado', name: 'Tornado Energy', volume_ml: 450, sugar: 108, country: 'RU', energy: true, color: '#3a3f9e', me: 52, her: 45, photo: false, weight: 3 },
  { brand: 'E-ON', name: 'E-ON Energy', volume_ml: 450, sugar: 104, country: 'RU', energy: true, color: '#23b1c4', me: 57, her: 61, photo: false, weight: 3 },
  { brand: 'Drive Me', name: 'Drive Me Classic', volume_ml: 500, sugar: 100, country: 'RU', energy: true, color: '#d4222a', me: 44, her: 40, photo: false, weight: 2 },
  { brand: 'Hell', name: 'Hell Energy Strong', volume_ml: 250, sugar: 111, country: 'BY', energy: true, color: '#e2231a', me: 60, her: 50, photo: true, weight: 2 },
  { brand: 'Pit Bull', name: 'Pit Bull Energy', volume_ml: 450, sugar: 107, country: 'BY', energy: true, color: '#2a2a2a', me: 50, her: 46, photo: false, weight: 2 },
  // Не энергетик: в лимит 2 в день не входит (проверка правила на реальных данных).
  { brand: 'Coca-Cola', name: 'Coca-Cola Zero', volume_ml: 500, sugar: 0, country: 'BY', energy: false, color: '#b01c24', me: 60, her: 60, photo: false, weight: 1 },
];

/** Короткие комментарии к оценкам (часть оценок идёт с комментарием). */
export const COMMENTS = [
  'Прям топ', 'Кисловато, но бодрит', 'Слишком сладко', 'Запах как у жвачки', 'Берём ещё', 'После вкус химический',
  'Лёгкий, но заряжает', 'Крепкий, прям пробрало', 'Норм, но не вау', 'Любимая', 'Больше не буду',
];

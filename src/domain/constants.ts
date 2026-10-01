// Константы бизнес-правил. Единственное место, где они заданы: мок, тесты и (по контракту) бэкенд берут значения отсюда.

/** Максимум энергетиков в день на человека; третья и далее только с over_limit. */
export const DAILY_LIMIT = 2;

/**
 * ОТКРЫТЫЙ ВОПРОС (docs-src/docs/06-decisions.md, «Открыто» №2): когда начинается новый день.
 * РЕШЕНО владельцем: новый день начинается в 04:00 по часовому поясу пары (ночные банки идут в «вчера»).
 */
export const DAY_BOUNDARY_HOUR = 4;

/**
 * ОТКРЫТЫЙ ВОПРОС (№2): часовой пояс пары. Умолчание: Europe/Minsk (UTC+3 круглый год, как Москва/Воронеж).
 * Хранится у пары (`Couple.timezone`), здесь только значение для новой пары.
 */
export const DEFAULT_TIMEZONE = 'Europe/Minsk';

/** Оценка: целые десятые, 0..100 (7.4 = 74). */
export const RATING_MIN = 0;
export const RATING_MAX = 100;

/** Вода: диапазон одной порции, мл (docs-src/docs/app-ux.md §3, ScreenWater) и норма по умолчанию. */
export const WATER_MIN_ML = 25;
export const WATER_MAX_ML = 2000;
export const DEFAULT_WATER_GOAL_ML = 2250;

/** Вход: серия неудач и блокировка (по ScreenLogin; точные значения — открытый вопрос №5). */
export const LOGIN_MAX_ATTEMPTS = 5;
export const LOGIN_LOCK_SECONDS = 60;

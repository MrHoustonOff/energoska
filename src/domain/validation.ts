// Проверки ввода, общие для мока и (по контракту) бэкенда.
import { WATER_MAX_ML, WATER_MIN_ML } from './constants';

export const LOGIN_RE = /^[A-Za-z0-9_.]{3,20}$/;
export const PASSWORD_MIN = 8;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_UTC_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

export const isUuidV7 = (v: unknown): v is string => typeof v === 'string' && UUID_RE.test(v);
export const isIsoUtc = (v: unknown): v is string => typeof v === 'string' && ISO_UTC_RE.test(v) && !Number.isNaN(Date.parse(v));
export const isLogin = (v: unknown): v is string => typeof v === 'string' && LOGIN_RE.test(v);
export const isWaterMl = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= WATER_MIN_ML && v <= WATER_MAX_ML;

/** Новый UUIDv7 (время в миллисекундах + случайность): записи сортируются по созданию. */
export function uuidv7(now = Date.now()): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[0] = (now / 2 ** 40) & 0xff; b[1] = (now / 2 ** 32) & 0xff; b[2] = (now / 2 ** 24) & 0xff;
  b[3] = (now / 2 ** 16) & 0xff; b[4] = (now / 2 ** 8) & 0xff; b[5] = now & 0xff;
  b[6] = (b[6] & 0x0f) | 0x70;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map(x => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

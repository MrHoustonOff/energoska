// Выбор в листе цены живёт, пока открыто приложение: «назад» не сбрасывает магазины, период и валюту.
import { PRICE } from '../demo-ui/priceSheet';  // MOCK-DEMO

export const pr = $state({ sel: [...PRICE.frames.mag.sel], period: PRICE.frames.mag.period, cur: 0, day: PRICE.frames.mag.day, pick: false, quick: PRICE.picker.quickOn });

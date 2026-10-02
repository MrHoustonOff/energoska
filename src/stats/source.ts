// Источник «Цифр». Этап 3 заменит тело на src/api (статистика пары); сигнатуры сохраняются.
import { STATS_BRANDS, STATS_DRUNK, STATS_PERIODS, STATS_RATINGS, STATS_RECORDS, STATS_WHO } from '../demo-ui/stats';  // MOCK-DEMO
export const WHO = STATS_WHO;
export const PERIODS = STATS_PERIODS;
export const getDrunk = () => STATS_DRUNK;
export const getBrands = () => STATS_BRANDS;
export const getRatings = () => STATS_RATINGS;
export const getRecords = () => STATS_RECORDS;

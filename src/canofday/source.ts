// Источник блока «Банка дня». Этап 3 заменит тело на src/api (подбор, рекомендации, лимит); сигнатуры сохраняются.
import { COD_SUMMARY, COD_PARAMS, COD_EMPTY } from '../demo-ui/canOfDay';  // MOCK-DEMO
export const getSummary = () => COD_SUMMARY;
export const getParams = () => COD_PARAMS;
export const getEmpty = () => COD_EMPTY;

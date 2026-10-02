// MOCK-DEMO: фикстуры партнёрства и профиля (ScreenPartner, ScreenPartnerTogether, ScreenAvatarEditor).
import { avatarArt } from '../api/mock/demo/art';
import { registerStates } from './states';

export const DEMO_PARTNER = { me: 'Володя', partner: 'Даша', partnerAcc: 'Дашу', together: 81, portraitMe: avatarArt('me'), portraitHer: avatarArt('her') };
export const DEMO_PROFILE = { name: 'Володя', login: '@vova', badge: 'Энергетикоголик', partner: 'Даша', theme: 'Как в телефоне', water: '2 250 мл', brands: 7, shops: 4, tags: 8, columns: 2 };

registerStates([
  { screen: 'partner', state: 'none', label: 'Партнёр: нет пары (ScreenPartner, кадр 1)' },
  { screen: 'partner', state: 'wait', label: 'Партнёр: ждём (ScreenPartner, кадр 2)' },
  { screen: 'partner', state: 'request', label: 'Партнёр: запрос (Together, кадр 1)' },
  { screen: 'partner', state: 'together', label: 'Партнёр: вместе (Together, кадр 2)' },
  { screen: 'avatar', state: 'sheet', label: 'Фото профиля: лист выбора (кадр 1)' },
  { screen: 'avatar', state: 'crop', label: 'Фото профиля: редактор кадрирования (кадр 2)' },
]);

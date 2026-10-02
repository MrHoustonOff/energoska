// Слой данных. Экраны ходят ТОЛЬКО сюда: `import { api } from './api'`.
// Реализаций две (docs-src/docs/10-architecture.md §1): мок на localStorage и HTTP (бэкенд позже).
// Выбор: переменная окружения VITE_API=mock|http (по умолчанию mock). Обе проверяются одним набором контрактных тестов.
import type {
  User, UserPatch, RegisterRequest, LoginRequest, LoginAvailability, CoupleState, CouplePatch, JoinRequest,
  Drink, DrinkCreate, DrinkPage, Rating, RatingCreate, Intake, IntakeCreate, IntakePage, DaySummary,
  WaterEntry, WaterCreate, WaterDay, PageQuery,
} from './types';

export * from './types';
export { ApiError } from './errors';
export type { ApiErrorCode } from './errors';

export interface AuthApi {
  loginAvailable(login: string): Promise<LoginAvailability>;
  register(req: RegisterRequest): Promise<User>;
  login(req: LoginRequest): Promise<User>;
  logout(): Promise<void>;
  me(): Promise<User>;
  updateMe(patch: UserPatch): Promise<User>;
}
export interface CoupleApi {
  get(): Promise<CoupleState>;
  update(patch: CouplePatch): Promise<CoupleState>;
  join(req: JoinRequest): Promise<CoupleState>;
  accept(requestId: string): Promise<CoupleState>;
  decline(requestId: string): Promise<CoupleState>;
}
export interface DrinksApi {
  list(q?: PageQuery): Promise<DrinkPage>;
  create(req: DrinkCreate): Promise<Drink>;
  get(id: string): Promise<Drink>;
}
export interface RatingsApi {
  list(drinkId: string): Promise<Rating[]>;
  create(req: RatingCreate): Promise<Rating>;
}
export interface IntakesApi {
  list(q?: PageQuery & { day?: string }): Promise<IntakePage>;
  create(req: IntakeCreate): Promise<Intake>;
  daySummary(day?: string): Promise<DaySummary>;
}
export interface WaterApi {
  get(day?: string): Promise<WaterDay>;
  add(req: WaterCreate): Promise<WaterEntry>;
}

/** Единый интерфейс данных. Новый блок: модуль здесь + эндпоинты в api/openapi.yaml + реализации + контрактные тесты. */
export interface Api {
  auth: AuthApi;
  couple: CoupleApi;
  drinks: DrinksApi;
  ratings: RatingsApi;
  intakes: IntakesApi;
  water: WaterApi;
}

import { createMockApi } from './mock';
import { createHttpApi } from './http';

/** Сборка по VITE_API. Мок по умолчанию; задержка имитирует сеть. */
export function createApi(kind: string = import.meta.env.VITE_API ?? 'mock'): Api {
  return kind === 'http' ? createHttpApi() : createMockApi({ latencyMs: 200, persist: true, seedAdmin: true, demo: true /* MOCK-DEMO */, online: () => navigator.onLine });
}

export const api: Api = createApi();

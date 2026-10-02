// Удобные имена типов из контракта (types.gen.ts генерируется из api/openapi.yaml: npm run api:types).
import type { components } from './types.gen';

type S = components['schemas'];

export type User = S['User'];
export type UserPatch = S['UserPatch'];
export type RegisterRequest = S['RegisterRequest'];
export type LoginRequest = S['LoginRequest'];
export type LoginAvailability = S['LoginAvailability'];
export type Couple = S['Couple'];
export type CoupleState = S['CoupleState'];
export type CouplePatch = S['CouplePatch'];
export type JoinRequest = S['JoinRequest'];
export type Drink = S['Drink'];
export type DrinkCreate = S['DrinkCreate'];
export type DrinkPage = S['DrinkPage'];
export type Rating = S['Rating'];
export type RatingCreate = S['RatingCreate'];
export type Intake = S['Intake'];
export type IntakeCreate = S['IntakeCreate'];
export type IntakePage = S['IntakePage'];
export type DaySummary = S['DaySummary'];
export type WaterEntry = S['WaterEntry'];
export type WaterCreate = S['WaterCreate'];
export type WaterDay = S['WaterDay'];
export type WaterGlasses = S['WaterGlasses'];
export type FeedItem = S['FeedItem'];
export type FeedPage = S['FeedPage'];
export type Problem = S['Problem'];

export interface PageQuery { limit?: number; cursor?: string }

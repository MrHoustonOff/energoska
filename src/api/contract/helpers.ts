import { expect } from 'vitest';
import type { Api } from '..';
import { uuidv7 } from '../../domain';

export const id = () => uuidv7();
export const PASSWORD = 'correct-horse-1';

/** Код ошибки, с которой завершился промис (или undefined, если ошибки не было). */
export async function errorCode(p: Promise<unknown>): Promise<string | undefined> {
  try { await p; } catch (e: any) { return e.code; }
  return undefined;
}
export const expectCode = async (p: Promise<unknown>, code: string) => expect(await errorCode(p)).toBe(code);

export async function signUp(api: Api, login: string) {
  return api.auth.register({ id: id(), login, password: PASSWORD });
}

/** Двое пользователей в паре: A зовёт B по коду, B принимает. */
export async function pair(a: Api, b: Api, la = 'anna', lb = 'boris') {
  const ua = await signUp(a, la);
  await signUp(b, lb);
  await a.couple.join({ id: id(), code: (await b.auth.me()).invite_code });
  const st = await b.couple.get();
  await b.couple.accept(st.incoming_request!.id);
  return ua;
}

export const drinkReq = (over: Partial<Parameters<Api['drinks']['create']>[0]> = {}) =>
  ({ id: id(), name: 'Классика', brand: 'Flash', volume_ml: 450, country: 'BY' as const, ...over });

import { describe, expect, it } from 'vitest';
import SwaggerParser from '@apidevtools/swagger-parser';
import { createMockBackend } from './mock';
import { contractSuite } from './contract/suite';
import { errorCode, id, PASSWORD } from './contract/helpers';
import { LOGIN_LOCK_SECONDS } from '../domain';

// Общий набор контрактных тестов против мока: каждый тест получает свежую «базу».
contractSuite('мок', () => { const backend = createMockBackend(); return { client: () => backend.client() }; });

describe('мок: особенности', () => {
  it('блокировка входа снимается по таймеру', async () => {
    let t = Date.parse('2026-10-02T09:00:00Z');
    const backend = createMockBackend({ now: () => t });
    const api = backend.client();
    await api.auth.register({ id: id(), login: 'anna', password: PASSWORD });
    for (let i = 0; i < 5; i++) await errorCode(api.auth.login({ login: 'anna', password: 'wrong-pass' }));
    expect(await errorCode(api.auth.login({ login: 'anna', password: PASSWORD }))).toBe('rate_limited');
    t += LOGIN_LOCK_SECONDS * 1000 + 1;
    expect((await api.auth.login({ login: 'anna', password: PASSWORD })).login).toBe('anna');
  });
  it('«нет сети»: вызовы падают с network, потом работают', async () => {
    let online = false;
    const api = createMockBackend({ online: () => online }).client();
    expect(await errorCode(api.auth.me())).toBe('network');
    online = true;
    expect(await errorCode(api.auth.me())).toBe('unauthorized');
  });
  it('задержка имитирует сеть', async () => {
    const api = createMockBackend({ latencyMs: 30 }).client();
    const t0 = Date.now();
    await errorCode(api.auth.me());
    expect(Date.now() - t0).toBeGreaterThanOrEqual(25);
  });
  it('ответы — копии: правка результата не портит базу', async () => {
    const api = createMockBackend().client();
    const u = await api.auth.register({ id: id(), login: 'anna', password: PASSWORD });
    u.display_name = 'взлом';
    expect((await api.auth.me()).display_name).toBe('anna');
  });
});

describe('контракт openapi.yaml', () => {
  it('валиден (OpenAPI 3)', async () => {
    const doc: any = await SwaggerParser.validate('api/openapi.yaml');
    expect(Object.keys(doc.paths).length).toBeGreaterThan(15);
  });
});

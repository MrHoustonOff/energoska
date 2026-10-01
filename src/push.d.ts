// Типы для замороженного src/push.js.
export function unsupportedReason(): string | null;
export function registerWorker(): Promise<ServiceWorkerRegistration | null>;
export function pushStatus(): Promise<string>;
export function enablePush(): Promise<{ ok: boolean; message: string }>;
export function scheduleTest(delaySec?: number): Promise<{ ok: boolean; message: string; sendAt?: number }>;

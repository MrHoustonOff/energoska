// Типы для замороженного src/viewport.js (сам файл не менялся, кроме расширений в import).
export function initViewport(): void;
export function onViewportChange(fn: () => void): () => boolean;
export function recording(kind: 'open' | 'close'): string;
export function isStandalone(): boolean;
export function snap(): string;
export function liveLine(): string;
export function metrics(): string;

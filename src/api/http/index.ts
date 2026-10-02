// HTTP-реализация API: заглушка. Настоящая появится вместе с бэкендом (Go), по контракту api/openapi.yaml.
// Пройти должна те же контрактные тесты (src/api/contract/), что и мок.
import type { Api } from '..';

export function createHttpApi(): Api {
  const notImplemented = (): never => { throw new Error('HTTP API не реализован: бэкенда пока нет (VITE_API=mock)'); };
  const module = () => new Proxy({}, { get: () => notImplemented });
  return {
    auth: module(), couple: module(), drinks: module(), ratings: module(), intakes: module(), water: module(), feed: module(),
  } as Api;
}

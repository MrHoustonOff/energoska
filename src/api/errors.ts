// Ошибка API в формате application/problem+json (см. api/openapi.yaml, схема Problem).
// Обе реализации (мок и HTTP) бросают именно её; экраны смотрят на `code`, а не на текст.
import type { Problem } from './types';

/** `network` — запроса не было или ответ не получен (нет сети); в контракте HTTP такого кода нет, его ставит клиент. */
export type ApiErrorCode = Problem['code'] | 'network';

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly errors?: Problem['errors'];
  readonly attemptsLeft?: number;
  readonly retryAfterSeconds?: number;

  constructor(status: number, code: ApiErrorCode, title: string, extra: Partial<Pick<ApiError, 'errors' | 'attemptsLeft' | 'retryAfterSeconds'>> = {}) {
    super(title);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    Object.assign(this, extra);
  }

  static validation(errors: { field: string; message: string }[]) {
    return new ApiError(422, 'validation', 'Некорректные данные', { errors });
  }
  static notFound(what = 'Не найдено') { return new ApiError(404, 'not_found', what); }
  static unauthorized() { return new ApiError(401, 'unauthorized', 'Нужен вход'); }
  static idConflict() { return new ApiError(409, 'id_conflict', 'Идентификатор уже занят другой записью'); }
  static network() { return new ApiError(0, 'network', 'Нет соединения'); }

  /** Из ответа problem+json (для HTTP-реализации). */
  static fromProblem(p: Problem) {
    return new ApiError(p.status, p.code, p.title, { errors: p.errors, attemptsLeft: p.attempts_left, retryAfterSeconds: p.retry_after_seconds });
  }
}

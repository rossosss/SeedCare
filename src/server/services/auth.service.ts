export type AuthServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

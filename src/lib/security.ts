/**
 * Security utilities — input validation, sanitization, file validation, rate limiting.
 *
 * Note on XSS / SQL injection:
 *  - React escapes all rendered content by default; we don't use dangerouslySetInnerHTML
 *    on user-controlled data anywhere in this app.
 *  - All DB access goes through the Supabase SDK (parameterized) — there is no string
 *    concatenation against SQL. These helpers add a defense-in-depth layer.
 */

// ── File upload validation ─────────────────────────────────────────────────

/** Allowed MIME types: JPEG, PNG, PDF only (per project requirement). */
export const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/jpg', 'image/png'] as const;
export const ALLOWED_DOC_MIME = ['application/pdf'] as const;
export const ALLOWED_UPLOAD_MIME = [...ALLOWED_IMAGE_MIME, ...ALLOWED_DOC_MIME] as const;

export const ALLOWED_IMAGE_EXT = ['jpg', 'jpeg', 'png'] as const;
export const ALLOWED_DOC_EXT = ['pdf'] as const;
export const ALLOWED_UPLOAD_EXT = [...ALLOWED_IMAGE_EXT, ...ALLOWED_DOC_EXT] as const;

/** HTML <input accept="..."> strings — use these on every <input type="file"> */
export const ACCEPT_IMAGE = 'image/jpeg,image/png,.jpg,.jpeg,.png';
export const ACCEPT_IMAGE_OR_PDF = 'image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf';

export interface FileValidationOptions {
  /** Max size in bytes (default 5MB). */
  maxSize?: number;
  /** If true, allow PDF in addition to images. */
  allowPdf?: boolean;
}

export interface FileValidationResult {
  ok: boolean;
  error?: string;
}

/**
 * Validates a file by MIME type, extension and size.
 * Only JPEG, PNG and (optionally) PDF are accepted.
 */
export function validateUploadFile(file: File, opts: FileValidationOptions = {}): FileValidationResult {
  const maxSize = opts.maxSize ?? 5 * 1024 * 1024; // 5MB

  if (!file) return { ok: false, error: 'Nenhum arquivo selecionado.' };

  if (file.size > maxSize) {
    const mb = (maxSize / (1024 * 1024)).toFixed(0);
    return { ok: false, error: `Arquivo muito grande. Máximo ${mb}MB.` };
  }
  if (file.size === 0) {
    return { ok: false, error: 'Arquivo vazio.' };
  }

  const allowedMime = opts.allowPdf
    ? (ALLOWED_UPLOAD_MIME as readonly string[])
    : (ALLOWED_IMAGE_MIME as readonly string[]);
  const allowedExt = opts.allowPdf
    ? (ALLOWED_UPLOAD_EXT as readonly string[])
    : (ALLOWED_IMAGE_EXT as readonly string[]);

  const mime = (file.type || '').toLowerCase();
  const ext = (file.name.split('.').pop() || '').toLowerCase();

  const mimeOk = allowedMime.includes(mime);
  const extOk = allowedExt.includes(ext);

  if (!mimeOk || !extOk) {
    return {
      ok: false,
      error: opts.allowPdf
        ? 'Formato inválido. Envie apenas JPEG, PNG ou PDF.'
        : 'Formato inválido. Envie apenas JPEG ou PNG.',
    };
  }

  return { ok: true };
}

// ── Input sanitization (defense in depth) ──────────────────────────────────

/**
 * Strips control characters and trims whitespace.
 * For text rendered as text in React this is already safe — use this when
 * concatenating user input into URLs, filenames, or external API payloads.
 */
export function sanitizeText(input: string, maxLength = 500): string {
  if (typeof input !== 'string') return '';
  // Remove null bytes, control chars (except \n \r \t), then trim and clip length
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim().slice(0, maxLength);
}

/** Sanitizes a string used as a filename (no path separators, no traversal). */
export function sanitizeFilename(name: string): string {
  return sanitizeText(name, 120)
    .replace(/[/\\?%*:|"<>]/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.+/, '');
}

// ── Client-side rate limiter ───────────────────────────────────────────────
// Lightweight token-bucket-style limiter kept in localStorage. Used ONLY on
// sensitive actions (login, signup) so casual browsing is never blocked.
// Server-side enforcement is still recommended for critical endpoints.

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

export interface RateLimitOptions {
  /** Unique identifier for the action being limited (e.g. "login"). */
  key: string;
  /** Max attempts allowed inside the window. */
  max: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the user may try again (0 if allowed). */
  retryAfter: number;
  remaining: number;
}

const STORAGE_PREFIX = '__rl_';

function readEntry(key: string): RateLimitEntry | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.count === 'number' && typeof parsed?.windowStart === 'number') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function writeEntry(key: string, entry: RateLimitEntry) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
  } catch {
    /* storage may be unavailable — degrade gracefully */
  }
}

/**
 * Records an attempt and returns whether it is allowed.
 * Call this BEFORE running the protected action.
 */
export function checkRateLimit({ key, max, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const entry = readEntry(key);

  if (!entry || now - entry.windowStart >= windowMs) {
    writeEntry(key, { count: 1, windowStart: now });
    return { allowed: true, retryAfter: 0, remaining: max - 1 };
  }

  if (entry.count >= max) {
    const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000);
    return { allowed: false, retryAfter, remaining: 0 };
  }

  const next = { count: entry.count + 1, windowStart: entry.windowStart };
  writeEntry(key, next);
  return { allowed: true, retryAfter: 0, remaining: max - next.count };
}

/** Clears a rate-limit counter (e.g., after a successful login). */
export function clearRateLimit(key: string) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    /* ignore */
  }
}

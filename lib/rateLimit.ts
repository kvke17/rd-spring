import { NextResponse } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// Almacén en memoria por clave (IP + acción)
const rateLimitStore = new Map<string, RateLimitRecord>();

// Limpieza periódica de claves expiradas cada 60 segundos
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000);
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();

  return '127.0.0.1';
}

export interface RateLimitOptions {
  keyPrefix: string;
  maxRequests: number;
  windowSeconds: number;
}

export function checkRateLimit(
  request: Request,
  options: RateLimitOptions
): { allowed: boolean; remaining: number; resetSeconds: number; errorResponse?: NextResponse } {
  const ip = getClientIp(request);
  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;
  const storageKey = `${options.keyPrefix}:${ip}`;

  const current = rateLimitStore.get(storageKey);

  if (!current || current.resetAt <= now) {
    // Nueva ventana
    rateLimitStore.set(storageKey, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetSeconds: options.windowSeconds,
    };
  }

  // Ventana activa
  if (current.count >= options.maxRequests) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    const errorResponse = NextResponse.json(
      {
        error: 'Demasiadas solicitudes. Por favor espera unos momentos antes de intentar nuevamente.',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(options.maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(current.resetAt / 1000)),
        },
      }
    );

    return {
      allowed: false,
      remaining: 0,
      resetSeconds: retryAfter,
      errorResponse,
    };
  }

  current.count += 1;
  const remaining = Math.max(0, options.maxRequests - current.count);
  const resetSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));

  return {
    allowed: true,
    remaining,
    resetSeconds,
  };
}

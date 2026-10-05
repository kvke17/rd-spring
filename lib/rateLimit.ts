import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
  errorResponse?: NextResponse;
}

export async function checkRateLimit(
  request: Request,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const ip = getClientIp(request);
  const now = new Date();
  const windowMs = options.windowSeconds * 1000;
  const resetAt = new Date(now.getTime() + windowMs);
  const storageKey = `${options.keyPrefix}:${ip}`;

  try {
    // Limpieza oportunista por consulta / TTL para serverless:
    // Con probabilidad del 10%, purgamos registros cuyo resetAt ya haya expirado
    if (Math.random() < 0.1) {
      prisma.rateLimitEntry
        .deleteMany({
          where: { resetAt: { lte: now } },
        })
        .catch((err) => {
          console.error('[RateLimit Cleanup Error]:', err);
        });
    }

    const current = await prisma.rateLimitEntry.findUnique({
      where: { key: storageKey },
    });

    if (!current || current.resetAt <= now) {
      // Ventana nueva o registro expirado: upsert atómico iniciando en count 1
      await prisma.rateLimitEntry.upsert({
        where: { key: storageKey },
        create: {
          key: storageKey,
          count: 1,
          resetAt,
        },
        update: {
          count: 1,
          resetAt,
        },
      });

      return {
        allowed: true,
        remaining: options.maxRequests - 1,
        resetSeconds: options.windowSeconds,
      };
    }

    // Ventana activa: verificación de límite
    if (current.count >= options.maxRequests) {
      const retryAfter = Math.max(1, Math.ceil((current.resetAt.getTime() - now.getTime()) / 1000));
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
            'X-RateLimit-Reset': String(Math.ceil(current.resetAt.getTime() / 1000)),
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

    // Incrementar contador atómicamente
    const updated = await prisma.rateLimitEntry.update({
      where: { key: storageKey },
      data: {
        count: { increment: 1 },
      },
    });

    const remaining = Math.max(0, options.maxRequests - updated.count);
    const resetSeconds = Math.max(1, Math.ceil((current.resetAt.getTime() - now.getTime()) / 1000));

    return {
      allowed: true,
      remaining,
      resetSeconds,
    };
  } catch (error) {
    console.error('[RateLimit Store Error]:', error);
    // Modo tolerante a fallos de infraestructura (Fail-Open): no bloquear usuarios legítimos si la BD falla
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetSeconds: options.windowSeconds,
    };
  }
}

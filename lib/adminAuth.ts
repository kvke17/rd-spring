import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export interface AdminAuthResult {
  authorized: boolean;
  session: any;
  errorResponse?: NextResponse;
}

/**
 * Verifica estrictamente del lado del servidor que la solicitud provenga de un usuario autenticado con rol 'ADMIN'.
 */
export async function requireAdminSession(): Promise<AdminAuthResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        authorized: false,
        session: null,
        errorResponse: NextResponse.json(
          { error: 'Autenticación requerida para acceder a este recurso.' },
          { status: 401 }
        ),
      };
    }

    const role = (session.user as any).role;

    if (role !== 'ADMIN') {
      return {
        authorized: false,
        session,
        errorResponse: NextResponse.json(
          { error: 'Acceso denegado: se requieren privilegios de Administrador.' },
          { status: 403 }
        ),
      };
    }

    return {
      authorized: true,
      session,
    };
  } catch (error) {
    console.error('Error al validar sesión de administrador:', error);
    return {
      authorized: false,
      session: null,
      errorResponse: NextResponse.json(
        { error: 'Error interno al verificar permisos de seguridad.' },
        { status: 500 }
      ),
    };
  }
}

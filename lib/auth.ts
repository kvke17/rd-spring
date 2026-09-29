// Archivo: lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from '@/lib/prisma';
import bcrypt from "bcrypt";
import { 
  verifyTwoFactorEmailOrBackupCode, 
  generateAndSendEmailCode 
} from '@/lib/twoFactor';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "tu@email.com" },
        password: { label: "Contraseña", type: "password" },
        totpCode: { label: "Código 2FA", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Faltan datos");
        }

        const cleanEmail = credentials.email.toLowerCase().trim();
        const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (!user) throw new Error("Usuario no encontrado");

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) throw new Error("Contraseña incorrecta");

        // Si el usuario tiene 2FA activado
        if (user.twoFactorEnabled) {
          if (!credentials.totpCode) {
            // Genera y envía el código de 6 dígitos al correo del usuario
            await generateAndSendEmailCode(user.email, 'login');
            // Señaliza al frontend que debe solicitar el código recibido por correo
            throw new Error("2FA_REQUIRED");
          }

          // Verificamos si el código de 6 dígitos o el código de respaldo es correcto
          const verification = await verifyTwoFactorEmailOrBackupCode(
            user.email, 
            credentials.totpCode
          );

          if (!verification.isValid) {
            throw new Error("CODIGO_2FA_INVALIDO");
          }
        }

        return { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled
        };
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.twoFactorEnabled = (user as any).twoFactorEnabled;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).twoFactorEnabled = token.twoFactorEnabled;
      }
      return session;
    }
  },
  pages: { signIn: '/login' },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
/**
 * Validación y robustez de contraseñas según:
 * - ISO/IEC 27002 Control 5.17 (Gestión de autenticación y contraseñas)
 * - NIST SP 800-63B (Digital Identity Guidelines: Authentication and Lifecycle Management)
 * - OWASP ASVS v4.0.3 Nivel 2 (V2 Authentication Verification Requirements)
 */

export interface PasswordRuleCheck {
  id: string;
  label: string;
  passed: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 a 4
  scorePercent: number; // 0 a 100
  strengthLabel: string;
  strengthColor: string;
  strengthAccessibleText: string;
  rules: PasswordRuleCheck[];
  errors: string[];
}

const COMMON_PASSWORDS_SET = new Set([
  'password12345',
  '123456789012',
  '1234567890123',
  'qwertyuiop12',
  'admin1234567',
  'contrasena123',
  'contraseña123',
  'rdspring2026',
  'chile1234567',
  'santiago1234',
  'welcome12345',
  'password123!',
  'admin123456!',
  '1234567890!a',
  'qwertyuiop!1',
]);

/**
 * Extrae tokens significativos de longitud >= 3 de un nombre o correo para evitar contraseñas triviales
 */
function extractForbiddenTokens(name?: string, email?: string): string[] {
  const tokens = new Set<string>();

  if (name) {
    name
      .toLowerCase()
      .split(/[^a-z0-9]/)
      .filter((w) => w.length >= 3)
      .forEach((w) => tokens.add(w));
  }

  if (email) {
    const localPart = email.split('@')[0]?.toLowerCase() || '';
    localPart
      .split(/[^a-z0-9]/)
      .filter((w) => w.length >= 3)
      .forEach((w) => tokens.add(w));
  }

  return Array.from(tokens);
}

export function evaluatePassword(
  password: string = '',
  email: string = '',
  name: string = ''
): PasswordValidationResult {
  const pwd = password || '';
  const cleanPwd = pwd.trim().toLowerCase();

  // 1. Longitud mínima: 12 caracteres (ISO/IEC 27002 / NIST SP 800-63B)
  const isMinLength = pwd.length >= 12;

  // 2. Complejidad de caracteres
  const hasUppercase = /[A-Z]/.test(pwd);
  const hasLowercase = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

  // 3. No contener partes del correo o nombre de usuario
  const forbiddenTokens = extractForbiddenTokens(name, email);
  const containsUserInfo = forbiddenTokens.some((token) => cleanPwd.includes(token));

  // 4. No ser una contraseña común de diccionario
  const isCommonPassword = COMMON_PASSWORDS_SET.has(cleanPwd);

  const rules: PasswordRuleCheck[] = [
    {
      id: 'length',
      label: 'Mínimo 12 caracteres',
      passed: isMinLength,
    },
    {
      id: 'uppercase',
      label: 'Al menos una letra mayúscula (A-Z)',
      passed: hasUppercase,
    },
    {
      id: 'lowercase',
      label: 'Al menos una letra minúscula (a-z)',
      passed: hasLowercase,
    },
    {
      id: 'number_symbol',
      label: 'Al menos un número (0-9) y un carácter especial (!@#$...)',
      passed: hasNumber && hasSpecial,
    },
    {
      id: 'no_user_info',
      label: 'No incluye tu nombre ni parte de tu correo',
      passed: pwd.length > 0 && !containsUserInfo,
    },
    {
      id: 'not_common',
      label: 'No es una contraseña predecible o de diccionario común',
      passed: pwd.length > 0 && !isCommonPassword,
    },
  ];

  const errors: string[] = [];
  if (!isMinLength) errors.push('La contraseña debe tener al menos 12 caracteres.');
  if (!hasUppercase) errors.push('Debe incluir al menos una letra mayúscula.');
  if (!hasLowercase) errors.push('Debe incluir al menos una letra minúscula.');
  if (!hasNumber) errors.push('Debe incluir al menos un número.');
  if (!hasSpecial) errors.push('Debe incluir al menos un símbolo o carácter especial.');
  if (containsUserInfo) errors.push('La contraseña no puede contener tu nombre ni fragmentos de tu correo.');
  if (isCommonPassword) errors.push('La contraseña ingresada es demasiado común y vulnerable.');

  // Cálculo de puntuación (0 a 4)
  let score = 0;
  if (pwd.length >= 8) score++;
  if (isMinLength) score++;
  if (hasUppercase && hasLowercase && hasNumber) score++;
  if (hasSpecial && !containsUserInfo && !isCommonPassword) score++;

  if (containsUserInfo || isCommonPassword) {
    score = Math.min(score, 1);
  }

  const scoreMap = [
    {
      label: 'Muy débil',
      color: 'bg-red-500',
      accessible: 'Nivel 1 de 4: Muy débil. No cumple los requisitos mínimos de seguridad.',
    },
    {
      label: 'Débil',
      color: 'bg-orange-500',
      accessible: 'Nivel 2 de 4: Débil. Aumenta la longitud o combina más tipos de caracteres.',
    },
    {
      label: 'Aceptable',
      color: 'bg-amber-500',
      accessible: 'Nivel 3 de 4: Aceptable. Casi lista, asegúrate de cumplir todas las reglas.',
    },
    {
      label: 'Fuerte',
      color: 'bg-emerald-500',
      accessible: 'Nivel 4 de 4: Fuerte. Cumple con los estándares de seguridad ISO/IEC 27002.',
    },
    {
      label: 'Excelente',
      color: 'bg-emerald-600',
      accessible: 'Nivel máximo: Excelente. Alta resistencia criptográfica contra fuerza bruta.',
    },
  ];

  const currentLevel = scoreMap[score];
  const isValid = rules.every((r) => r.passed);

  return {
    isValid,
    score,
    scorePercent: (score / 4) * 100,
    strengthLabel: currentLevel.label,
    strengthColor: currentLevel.color,
    strengthAccessibleText: currentLevel.accessible,
    rules,
    errors,
  };
}

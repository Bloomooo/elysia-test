export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const parts = email.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  return local!.length > 0 && domain!.includes(".") && !domain!.endsWith(".");
}

export function isValidPassword(password: string | null | undefined): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!password || password.length < 8) {
    errors.push("Le mot de passe doit contenir au moins 8 caracteres");
  }

  if (!password || !/[A-Z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une majuscule");
  }

  if (!password || !/[a-z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une minuscule");
  }

  if (!password || !/[0-9]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un chiffre");
  }

  if (!password || !/[!@#$%^&*]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un caractere special");
  }

  return { valid: errors.length === 0, errors };
}

export function isValidAge(age: unknown): boolean {
  if (age === null || age === undefined) return false;
  if (typeof age !== "number") return false;
  if (!Number.isInteger(age)) return false;
  return age >= 0 && age <= 150;
}

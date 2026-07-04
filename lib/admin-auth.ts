import { timingSafeEqual } from "crypto";

// Compare le mot de passe candidat à ADMIN_PASSWORD (variable d'env, jamais dans le code)
export function checkAdminPassword(candidate: string | null): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

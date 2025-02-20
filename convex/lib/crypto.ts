"use node";

import { randomBytes, pbkdf2Sync } from "crypto";

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, generatedSalt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt: generatedSalt };
}

export function generateSecureToken(): string {
  return randomBytes(32).toString('hex');
} 
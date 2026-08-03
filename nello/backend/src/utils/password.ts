import bcrypt from "bcryptjs";

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function validatePassword(password: string): void {
  if (password.length < 12) {
    throw new Error("Password must be at least 12 characters long");
  }
}

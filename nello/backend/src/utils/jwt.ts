import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NELLO_JWT_SECRET || "dev-secret-change-in-production";
const JWT_EXPIRATION_HOURS = Number(process.env.NELLO_JWT_EXPIRATION_HOURS || 8);

export function createToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, {
    expiresIn: `${JWT_EXPIRATION_HOURS}h`,
    algorithm: "HS512",
  });
}

export function verifyToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ["HS512"] });
    return typeof payload === "object" && payload.sub ? (payload.sub as string) : null;
  } catch {
    return null;
  }
}

export { JWT_EXPIRATION_HOURS }
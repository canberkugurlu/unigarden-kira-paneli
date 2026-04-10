import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "unigarden-kira-jwt-gizli-2024"
);
export const COOKIE = "kira_token";

export interface KiraPanelPayload {
  id: string;
  ad: string;
  soyad: string;
  email: string;
  rol: string;
}

export async function signToken(payload: KiraPanelPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<KiraPanelPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as KiraPanelPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<KiraPanelPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

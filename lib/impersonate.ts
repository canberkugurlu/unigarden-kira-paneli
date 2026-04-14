import { SignJWT, jwtVerify } from "jose";

/** Tüm paneller arasında ortak secret — her birinin Vercel env'inde IMPERSONATION_SECRET tanımlı olmalı */
const SECRET = new TextEncoder().encode(
  process.env.IMPERSONATION_SECRET ?? "unigarden-impersonation-shared-2026"
);

export interface ImpersonationPayload {
  targetUserId:  string;
  targetType:    "Kullanici" | "DaireSahibi" | "Ogrenci";
  targetPanel:   "muhasebe" | "kiralama" | "ev-sahibi" | "kiraci";
  adminId:       string;
  adminAd:       string;
  iat?: number;
  exp?: number;
}

export async function createImpersonationToken(p: ImpersonationPayload): Promise<string> {
  return await new SignJWT({ ...p })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m") // 5 dk geçerli
    .sign(SECRET);
}

export async function verifyImpersonationToken(token: string): Promise<ImpersonationPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as ImpersonationPayload;
  } catch {
    return null;
  }
}

export const PANEL_URLS: Record<string, string> = {
  muhasebe:    process.env.MUHASEBE_URL    ?? "https://muhasebe-paneli.vercel.app",
  kiralama:    process.env.KIRALAMA_URL    ?? "https://kiralama-paneli.vercel.app",
  "ev-sahibi": process.env.EV_SAHIBI_URL   ?? "https://ev-sahibi-paneli.vercel.app",
  kiraci:      process.env.KIRACI_URL      ?? "https://kiraci-paneli.vercel.app",
};

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SECRET = process.env.IMPORT_SECRET ?? "etap3-import-2025";

async function safeExec(sql: string) {
  try { await prisma.$executeRawUnsafe(sql); return { ok: true, sql }; }
  catch (e) { return { ok: false, sql, err: e instanceof Error ? e.message : String(e) }; }
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-import-secret");
  if (secret !== SECRET) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const results = [];

  // DaireSahibi — tcKimlik NOT NULL'u gevşet (SQLite tipi için rebuild gerekir ama null değer kabul eder)
  results.push(await safeExec(`ALTER TABLE "DaireSahibi" ADD COLUMN "tip"     TEXT NOT NULL DEFAULT 'Bireysel'`));
  results.push(await safeExec(`ALTER TABLE "DaireSahibi" ADD COLUMN "vergiNo" TEXT`));
  results.push(await safeExec(`ALTER TABLE "DaireSahibi" ADD COLUMN "unvan"   TEXT`));
  results.push(await safeExec(`CREATE UNIQUE INDEX IF NOT EXISTS "DaireSahibi_vergiNo_key" ON "DaireSahibi"("vergiNo") WHERE "vergiNo" IS NOT NULL`));

  // DaireSahipligi — ipotek + pay/payda
  results.push(await safeExec(`ALTER TABLE "DaireSahipligi" ADD COLUMN "ipotekli" INTEGER NOT NULL DEFAULT 0`));
  results.push(await safeExec(`ALTER TABLE "DaireSahipligi" ADD COLUMN "pay"   INTEGER`));
  results.push(await safeExec(`ALTER TABLE "DaireSahipligi" ADD COLUMN "payda" INTEGER`));

  return NextResponse.json({ ok: true, results });
}

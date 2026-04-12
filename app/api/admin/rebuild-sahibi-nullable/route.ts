import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const maxDuration = 300;

const SECRET = process.env.IMPORT_SECRET ?? "etap3-import-2025";

async function run(sql: string) {
  try { await prisma.$executeRawUnsafe(sql); return { ok: true, sql: sql.substring(0, 80) }; }
  catch (e) { return { ok: false, sql: sql.substring(0, 80), err: e instanceof Error ? e.message : String(e) }; }
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-import-secret");
  if (secret !== SECRET) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const logs = [];

  // 1) Partial unique index'i kaldır, full unique index koy
  logs.push(await run(`DROP INDEX IF EXISTS "DaireSahibi_vergiNo_key"`));
  logs.push(await run(`CREATE UNIQUE INDEX "DaireSahibi_vergiNo_key" ON "DaireSahibi"("vergiNo")`));

  // 2) DaireSahibi tablosunu yeniden oluştur: tcKimlik → NULLABLE
  logs.push(await run(`PRAGMA foreign_keys=OFF`));

  logs.push(await run(`CREATE TABLE "DaireSahibi_new" (
    "id"           TEXT NOT NULL PRIMARY KEY,
    "ad"           TEXT NOT NULL,
    "soyad"        TEXT NOT NULL,
    "tcKimlik"     TEXT,
    "telefon"      TEXT NOT NULL,
    "email"        TEXT,
    "notlar"       TEXT,
    "sifre"        TEXT,
    "tip"          TEXT NOT NULL DEFAULT 'Bireysel',
    "vergiNo"      TEXT,
    "unvan"        TEXT,
    "olusturmaTar" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`));

  logs.push(await run(`INSERT INTO "DaireSahibi_new" ("id","ad","soyad","tcKimlik","telefon","email","notlar","sifre","tip","vergiNo","unvan","olusturmaTar")
    SELECT "id","ad","soyad","tcKimlik","telefon","email","notlar","sifre",
           COALESCE("tip",'Bireysel') AS "tip",
           "vergiNo","unvan","olusturmaTar"
    FROM "DaireSahibi"`));

  logs.push(await run(`DROP TABLE "DaireSahibi"`));
  logs.push(await run(`ALTER TABLE "DaireSahibi_new" RENAME TO "DaireSahibi"`));

  // İndeksleri yeniden kur
  logs.push(await run(`CREATE UNIQUE INDEX "DaireSahibi_tcKimlik_key" ON "DaireSahibi"("tcKimlik")`));
  logs.push(await run(`CREATE UNIQUE INDEX "DaireSahibi_vergiNo_key"  ON "DaireSahibi"("vergiNo")`));

  logs.push(await run(`PRAGMA foreign_keys=ON`));

  return NextResponse.json({ ok: true, logs });
}

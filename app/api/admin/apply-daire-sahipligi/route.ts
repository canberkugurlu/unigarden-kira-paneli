import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SECRET = process.env.IMPORT_SECRET ?? "etap3-import-2025";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-import-secret");
  if (secret !== SECRET) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  // Tablo oluşturma (idempotent: IF NOT EXISTS)
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "DaireSahipligi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "konutId" TEXT NOT NULL,
    "daireSahibiId" TEXT NOT NULL,
    "alisTarihi" DATETIME NOT NULL,
    "satisTarihi" DATETIME,
    "alisFiyati" REAL,
    "satisFiyati" REAL,
    "notlar" TEXT,
    "olusturmaTar" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DaireSahipligi_konutId_fkey"       FOREIGN KEY ("konutId")       REFERENCES "Konut"       ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DaireSahipligi_daireSahibiId_fkey" FOREIGN KEY ("daireSahibiId") REFERENCES "DaireSahibi" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`);

  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "DaireSahipligi_konutId_idx"       ON "DaireSahipligi"("konutId")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "DaireSahipligi_daireSahibiId_idx" ON "DaireSahipligi"("daireSahibiId")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "DaireSahipligi_alisTarihi_idx"    ON "DaireSahipligi"("alisTarihi")`);

  return NextResponse.json({ ok: true, msg: "DaireSahipligi tablosu hazır" });
}

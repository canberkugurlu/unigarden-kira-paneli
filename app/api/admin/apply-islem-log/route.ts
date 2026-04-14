import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SECRET = process.env.IMPORT_SECRET ?? "etap3-import-2025";

async function run(sql: string) {
  try { await prisma.$executeRawUnsafe(sql); return { ok: true, sql: sql.slice(0, 80) }; }
  catch (e) { return { ok: false, sql: sql.slice(0, 80), err: e instanceof Error ? e.message : String(e) }; }
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-import-secret");
  if (secret !== SECRET) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const logs = [];
  logs.push(await run(`CREATE TABLE IF NOT EXISTS "IslemLog" (
    "id"             TEXT NOT NULL PRIMARY KEY,
    "kullaniciId"    TEXT,
    "kullaniciAd"    TEXT,
    "kullaniciTip"   TEXT,
    "panel"          TEXT NOT NULL,
    "modul"          TEXT NOT NULL,
    "eylem"          TEXT NOT NULL,
    "baslik"         TEXT NOT NULL,
    "detay"          TEXT,
    "targetType"     TEXT,
    "targetId"       TEXT,
    "oncekiVeri"     TEXT,
    "sonrakiVeri"    TEXT,
    "geriAlindi"     INTEGER NOT NULL DEFAULT 0,
    "geriAlinmaTar"  DATETIME,
    "geriAlanId"     TEXT,
    "geriAlanAd"     TEXT,
    "ipAdres"        TEXT,
    "olusturmaTar"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`));

  logs.push(await run(`CREATE INDEX IF NOT EXISTS "IslemLog_panel_idx"        ON "IslemLog"("panel")`));
  logs.push(await run(`CREATE INDEX IF NOT EXISTS "IslemLog_eylem_idx"        ON "IslemLog"("eylem")`));
  logs.push(await run(`CREATE INDEX IF NOT EXISTS "IslemLog_modul_idx"        ON "IslemLog"("modul")`));
  logs.push(await run(`CREATE INDEX IF NOT EXISTS "IslemLog_olusturmaTar_idx" ON "IslemLog"("olusturmaTar")`));
  logs.push(await run(`CREATE INDEX IF NOT EXISTS "IslemLog_target_idx"       ON "IslemLog"("targetType","targetId")`));
  logs.push(await run(`CREATE INDEX IF NOT EXISTS "IslemLog_kullanici_idx"    ON "IslemLog"("kullaniciId")`));

  return NextResponse.json({ ok: true, logs });
}

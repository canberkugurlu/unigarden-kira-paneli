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

  logs.push(await run(`CREATE TABLE IF NOT EXISTS "Senaryo" (
    "id"            TEXT NOT NULL PRIMARY KEY,
    "ad"            TEXT NOT NULL,
    "aciklama"      TEXT,
    "hedefModel"    TEXT NOT NULL,
    "tetikleyici"   TEXT,
    "aktif"         INTEGER NOT NULL DEFAULT 1,
    "olusturanId"   TEXT,
    "olusturanAd"   TEXT,
    "olusturmaTar"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`));
  logs.push(await run(`CREATE INDEX IF NOT EXISTS "Senaryo_hedefModel_idx" ON "Senaryo"("hedefModel")`));
  logs.push(await run(`CREATE INDEX IF NOT EXISTS "Senaryo_aktif_idx" ON "Senaryo"("aktif")`));

  logs.push(await run(`CREATE TABLE IF NOT EXISTS "SenaryoAdim" (
    "id"           TEXT NOT NULL PRIMARY KEY,
    "senaryoId"    TEXT NOT NULL,
    "sira"         INTEGER NOT NULL,
    "ad"           TEXT NOT NULL,
    "aciklama"     TEXT,
    "panel"        TEXT NOT NULL,
    "rol"          TEXT,
    "aksiyon"      TEXT NOT NULL,
    "sartFieldYol" TEXT,
    "olusturmaTar" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SenaryoAdim_senaryoId_fkey" FOREIGN KEY ("senaryoId") REFERENCES "Senaryo"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`));
  logs.push(await run(`CREATE INDEX IF NOT EXISTS "SenaryoAdim_senaryo_idx" ON "SenaryoAdim"("senaryoId","sira")`));

  logs.push(await run(`CREATE TABLE IF NOT EXISTS "SenaryoAkisi" (
    "id"          TEXT NOT NULL PRIMARY KEY,
    "senaryoId"   TEXT NOT NULL,
    "baslik"      TEXT NOT NULL,
    "hedefModel"  TEXT NOT NULL,
    "hedefId"     TEXT,
    "durum"       TEXT NOT NULL DEFAULT 'Aktif',
    "baslayanId"  TEXT,
    "baslayanAd"  TEXT,
    "aktifSira"   INTEGER NOT NULL DEFAULT 1,
    "baslamaTar"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bitirmeTar"  DATETIME,
    "notlar"      TEXT,
    CONSTRAINT "SenaryoAkisi_senaryoId_fkey" FOREIGN KEY ("senaryoId") REFERENCES "Senaryo"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`));
  logs.push(await run(`CREATE INDEX IF NOT EXISTS "SenaryoAkisi_durum_idx"  ON "SenaryoAkisi"("durum")`));
  logs.push(await run(`CREATE INDEX IF NOT EXISTS "SenaryoAkisi_senaryo_idx" ON "SenaryoAkisi"("senaryoId")`));
  logs.push(await run(`CREATE INDEX IF NOT EXISTS "SenaryoAkisi_hedef_idx"  ON "SenaryoAkisi"("hedefModel","hedefId")`));

  logs.push(await run(`CREATE TABLE IF NOT EXISTS "SenaryoAkisiAdim" (
    "id"               TEXT NOT NULL PRIMARY KEY,
    "akisId"           TEXT NOT NULL,
    "adimId"           TEXT NOT NULL,
    "sira"             INTEGER NOT NULL,
    "durum"            TEXT NOT NULL DEFAULT 'Beklemede',
    "yapanKullaniciId" TEXT,
    "yapanAd"          TEXT,
    "yapanPanel"       TEXT,
    "yapilanTar"       DATETIME,
    "notlar"           TEXT,
    "olusturmaTar"     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SenaryoAkisiAdim_akisId_fkey" FOREIGN KEY ("akisId") REFERENCES "SenaryoAkisi"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SenaryoAkisiAdim_adimId_fkey" FOREIGN KEY ("adimId") REFERENCES "SenaryoAdim"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`));
  logs.push(await run(`CREATE INDEX IF NOT EXISTS "SenaryoAkisiAdim_akis_idx"  ON "SenaryoAkisiAdim"("akisId","sira")`));
  logs.push(await run(`CREATE INDEX IF NOT EXISTS "SenaryoAkisiAdim_durum_idx" ON "SenaryoAkisiAdim"("durum")`));

  // Seed: Örnek "Yeni Kiracı Kiralama Akışı" senaryosu
  const existing = await prisma.senaryo.findFirst({ where: { ad: "Yeni Kiracı Kiralama Akışı" } });
  let seedLog = "already exists";
  if (!existing) {
    const senaryo = await prisma.senaryo.create({
      data: {
        ad: "Yeni Kiracı Kiralama Akışı",
        aciklama: "Daire gezdirme → rezerve → sözleşme → onay zinciri → aktif kiracı",
        hedefModel: "Sozlesme",
        tetikleyici: "manuel",
        olusturanAd: "Sistem",
      },
    });
    const adimlar = [
      { sira: 1, ad: "Daire Gezdirme", panel: "kiralama", aksiyon: "onay",
        aciklama: "Kiralama ekibi daireyi potansiyel kiracıya gezdirir ve ilgi alır" },
      { sira: 2, ad: "Daire Rezerve + Sözleşme Gönder", panel: "kiralama", aksiyon: "onay",
        aciklama: "Daire rezerve edilir, potansiyel kiracıya sözleşme linki gönderilir" },
      { sira: 3, ad: "Kiracı Üye Olsun ve Sözleşme Doldursun", panel: "kiraci", aksiyon: "onay",
        aciklama: "Kiracı kiracı paneline üye olur, sözleşme formunu doldurur" },
      { sira: 4, ad: "Kiralama Ekibi Sözleşme Onayı", panel: "kiralama", rol: "KiralamaSorumlusu", aksiyon: "red-veya-onay",
        aciklama: "Kiralama ekibi doldurulan sözleşmeyi inceler ve onaylar/reddeder" },
      { sira: 5, ad: "Muhasebe Fiyat Onayı", panel: "muhasebe", rol: "Muhasebeci", aksiyon: "red-veya-onay",
        aciklama: "Muhasebe fiyat ve ödeme planını kontrol eder, onaylar" },
      { sira: 6, ad: "Admin Onayı", panel: "admin", rol: "Admin", aksiyon: "red-veya-onay",
        aciklama: "Admin nihai onayı verir, sözleşmeyi aktif hale getirir" },
      { sira: 7, ad: "Daire Kapat + Kiracı Aktifleştir", panel: "admin", aksiyon: "onay",
        aciklama: "Daire kiralanmış işaretlenir, kiracı aktif statüye geçer" },
    ];
    for (const a of adimlar) {
      await prisma.senaryoAdim.create({ data: { ...a, senaryoId: senaryo.id } });
    }
    seedLog = `seeded: ${adimlar.length} adım`;
  }

  return NextResponse.json({ ok: true, logs, seed: seedLog });
}

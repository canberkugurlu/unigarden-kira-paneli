import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SECRET = process.env.IMPORT_SECRET ?? "etap3-import-2025";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-import-secret");
  if (secret !== SECRET) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  // 1. 2. Etap konutların ID'lerini bul
  const konutlar = await prisma.konut.findMany({
    where: { etap: 2 },
    select: { id: true },
  });
  const konutIds = konutlar.map(k => k.id);

  // 2. Bu konutlardaki sözleşmeleri bul
  const sozlesmeler = await prisma.sozlesme.findMany({
    where: { konutId: { in: konutIds } },
    select: { id: true, ogrenciId: true },
  });
  const sozlesmeIds = sozlesmeler.map(s => s.id);
  const ogrenciIds  = [...new Set(sozlesmeler.map(s => s.ogrenciId))];

  let silinen = {
    gunlukOdeme: 0, turnikeEngel: 0, turnikeLog: 0,
    teslimRaporu: 0, bakimTalebiYorum: 0, servisFaturasi: 0,
    bakimTalebi: 0, odeme: 0, sozlesme: 0, ogrenci: 0,
  };

  // 3. GunlukOdeme
  const go = await prisma.gunlukOdeme.deleteMany({ where: { ogrenciId: { in: ogrenciIds } } });
  silinen.gunlukOdeme = go.count;

  // 4. TurnikeEngel
  const te = await prisma.turnikeEngel.deleteMany({ where: { ogrenciId: { in: ogrenciIds } } });
  silinen.turnikeEngel = te.count;

  // 5. TurnikeLog
  const tl = await prisma.turnikeLog.deleteMany({ where: { ogrenciId: { in: ogrenciIds } } });
  silinen.turnikeLog = tl.count;

  // 6. TeslimRaporu (nullable FK)
  const tr = await prisma.teslimRaporu.deleteMany({ where: { ogrenciId: { in: ogrenciIds } } });
  silinen.teslimRaporu = tr.count;

  // 7. BakimTalebi'ye bağlı ServisFaturası bağlantılarını temizle, sonra BakimTalebi sil
  const bakimTalepleri = await prisma.bakimTalebi.findMany({
    where: { ogrenciId: { in: ogrenciIds } },
    select: { id: true },
  });
  const bakimIds = bakimTalepleri.map(b => b.id);

  if (bakimIds.length > 0) {
    const sf = await prisma.servisFaturasi.deleteMany({ where: { bakimTalebiId: { in: bakimIds } } });
    silinen.servisFaturasi = sf.count;

    const by = await prisma.bakimTalebiYorum.deleteMany({ where: { bakimTalebiId: { in: bakimIds } } });
    silinen.bakimTalebiYorum = by.count;

    const bt = await prisma.bakimTalebi.deleteMany({ where: { id: { in: bakimIds } } });
    silinen.bakimTalebi = bt.count;
  }

  // 8. Ödeme (Sozlesme'ye bağlı)
  const od = await prisma.odeme.deleteMany({ where: { sozlesmeId: { in: sozlesmeIds } } });
  silinen.odeme = od.count;

  // 9. Sözleşme
  const sz = await prisma.sozlesme.deleteMany({ where: { id: { in: sozlesmeIds } } });
  silinen.sozlesme = sz.count;

  // 10. Ogrenci — yalnızca başka sözleşmesi kalmayan kiracıları sil
  const kalanSozlesmeler = await prisma.sozlesme.findMany({
    where: { ogrenciId: { in: ogrenciIds } },
    select: { ogrenciId: true },
  });
  const kalanOgrenciIds = new Set(kalanSozlesmeler.map(s => s.ogrenciId));
  const silinecekOgrenciIds = ogrenciIds.filter(id => !kalanOgrenciIds.has(id));

  const og = await prisma.ogrenci.deleteMany({ where: { id: { in: silinecekOgrenciIds } } });
  silinen.ogrenci = og.count;

  // 11. Konutları "Boş" yap
  await prisma.konut.updateMany({ where: { id: { in: konutIds } }, data: { durum: "Bos" } });

  return NextResponse.json({ ok: true, ...silinen, konutGuncellendi: konutIds.length });
}

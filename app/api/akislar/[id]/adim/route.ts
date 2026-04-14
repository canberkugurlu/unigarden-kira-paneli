import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logIslem } from "@/lib/log";

/**
 * Aktif adımı tamamla veya reddet.
 * body: { adimId: string, karar: "onay" | "red", notlar?: string }
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const { adimId, karar, notlar } = body as { adimId: string; karar: "onay" | "red"; notlar?: string };

  if (!adimId || !karar) return NextResponse.json({ error: "adimId ve karar zorunludur" }, { status: 400 });

  const akisAdim = await prisma.senaryoAkisiAdim.findFirst({
    where: { akisId: id, adimId, durum: "Aktif" },
    include: { akis: { include: { senaryo: true } }, adim: true },
  });
  if (!akisAdim) return NextResponse.json({ error: "Bu adım aktif değil veya bulunamadı" }, { status: 404 });

  const yeniDurum = karar === "onay" ? "Tamamlandi" : "Reddedildi";
  const yapanAd = `${session.ad} ${session.soyad}`;

  await prisma.senaryoAkisiAdim.update({
    where: { id: akisAdim.id },
    data: {
      durum: yeniDurum,
      yapanKullaniciId: session.id,
      yapanAd, yapanPanel: "admin",
      yapilanTar: new Date(),
      notlar: notlar ?? null,
    },
  });

  if (karar === "red") {
    await prisma.senaryoAkisi.update({
      where: { id }, data: { durum: "Reddedildi", bitirmeTar: new Date() },
    });
    await logIslem({
      modul: "senaryo-akis", eylem: "UPDATE",
      baslik: `Adım reddedildi: ${akisAdim.adim.ad} (${akisAdim.akis.baslik})`,
      targetType: "SenaryoAkisi", targetId: id,
      detay: notlar,
    });
    return NextResponse.json({ ok: true, durum: "Reddedildi" });
  }

  // Onay → sonraki adımı aktifleştir
  const sonraki = await prisma.senaryoAkisiAdim.findFirst({
    where: { akisId: id, sira: { gt: akisAdim.sira } },
    orderBy: { sira: "asc" },
  });
  if (sonraki) {
    await prisma.senaryoAkisiAdim.update({ where: { id: sonraki.id }, data: { durum: "Aktif" } });
    await prisma.senaryoAkisi.update({ where: { id }, data: { aktifSira: sonraki.sira } });
    await logIslem({
      modul: "senaryo-akis", eylem: "UPDATE",
      baslik: `Adım tamamlandı: ${akisAdim.adim.ad} → Sıradaki: ${sonraki.id}`,
      targetType: "SenaryoAkisi", targetId: id,
      detay: notlar,
    });
    return NextResponse.json({ ok: true, durum: "Tamamlandi", sonrakiAdimId: sonraki.id });
  }

  // Son adım — akışı tamamla
  await prisma.senaryoAkisi.update({
    where: { id }, data: { durum: "Tamamlandi", bitirmeTar: new Date() },
  });
  await logIslem({
    modul: "senaryo-akis", eylem: "UPDATE",
    baslik: `Akış tamamlandı: ${akisAdim.akis.baslik}`,
    targetType: "SenaryoAkisi", targetId: id,
  });
  return NextResponse.json({ ok: true, durum: "Tamamlandi", akisTamamlandi: true });
}

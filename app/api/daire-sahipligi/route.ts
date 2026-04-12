import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: tüm sahiplik kayıtları, opsiyonel ?konutId= ya da ?daireSahibiId= filtresi
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const konutId       = searchParams.get("konutId")       ?? undefined;
  const daireSahibiId = searchParams.get("daireSahibiId") ?? undefined;

  const where = {
    ...(konutId       ? { konutId } : {}),
    ...(daireSahibiId ? { daireSahibiId } : {}),
  };

  const kayitlar = await prisma.daireSahipligi.findMany({
    where,
    include: {
      konut:       { select: { id: true, daireNo: true, blok: true, etap: true } },
      daireSahibi: { select: { id: true, ad: true, soyad: true, tcKimlik: true } },
    },
    orderBy: [{ alisTarihi: "desc" }],
  });
  return NextResponse.json(kayitlar);
}

// POST: yeni sahiplik kaydı (alış)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { konutId, daireSahibiId, alisTarihi, satisTarihi, alisFiyati, satisFiyati, notlar } = body ?? {};
    if (!konutId || !daireSahibiId || !alisTarihi) {
      return NextResponse.json({ error: "konutId, daireSahibiId ve alisTarihi zorunludur" }, { status: 400 });
    }
    const kayit = await prisma.daireSahipligi.create({
      data: {
        konutId,
        daireSahibiId,
        alisTarihi: new Date(alisTarihi),
        satisTarihi: satisTarihi ? new Date(satisTarihi) : null,
        alisFiyati:  alisFiyati  != null ? Number(alisFiyati)  : null,
        satisFiyati: satisFiyati != null ? Number(satisFiyati) : null,
        notlar: notlar ?? null,
      },
      include: {
        konut:       { select: { id: true, daireNo: true, blok: true, etap: true } },
        daireSahibi: { select: { id: true, ad: true, soyad: true, tcKimlik: true } },
      },
    });

    // Eğer satış tarihi yoksa: Konut'un güncel sahibini bu kaydın sahibi yap
    if (!kayit.satisTarihi) {
      await prisma.konut.update({
        where: { id: konutId },
        data:  { daireSahibiId },
      });
    }

    return NextResponse.json(kayit, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Hata" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.alisTarihi  !== undefined) data.alisTarihi  = body.alisTarihi  ? new Date(body.alisTarihi)  : null;
    if (body.satisTarihi !== undefined) data.satisTarihi = body.satisTarihi ? new Date(body.satisTarihi) : null;
    if (body.alisFiyati  !== undefined) data.alisFiyati  = body.alisFiyati  != null ? Number(body.alisFiyati)  : null;
    if (body.satisFiyati !== undefined) data.satisFiyati = body.satisFiyati != null ? Number(body.satisFiyati) : null;
    if (body.notlar      !== undefined) data.notlar      = body.notlar ?? null;

    const kayit = await prisma.daireSahipligi.update({
      where: { id },
      data,
      include: {
        konut:       { select: { id: true, daireNo: true, blok: true, etap: true } },
        daireSahibi: { select: { id: true, ad: true, soyad: true, tcKimlik: true } },
      },
    });

    // Satış tarihi eklendiyse Konut'un güncel sahibini temizle (başka aktif kayıt yoksa)
    if (kayit.satisTarihi) {
      const aktif = await prisma.daireSahipligi.findFirst({
        where: { konutId: kayit.konutId, satisTarihi: null },
        orderBy: { alisTarihi: "desc" },
      });
      await prisma.konut.update({
        where: { id: kayit.konutId },
        data:  { daireSahibiId: aktif?.daireSahibiId ?? null },
      });
    } else {
      // Satış kaldırıldıysa konut sahibini bu kaydın sahibi yap
      await prisma.konut.update({
        where: { id: kayit.konutId },
        data:  { daireSahibiId: kayit.daireSahibiId },
      });
    }

    return NextResponse.json(kayit);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Hata" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kayit = await prisma.daireSahipligi.findUnique({ where: { id } });
  if (!kayit) return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });

  await prisma.daireSahipligi.delete({ where: { id } });

  // Konut sahibini yeniden hesapla
  const aktif = await prisma.daireSahipligi.findFirst({
    where: { konutId: kayit.konutId, satisTarihi: null },
    orderBy: { alisTarihi: "desc" },
  });
  await prisma.konut.update({
    where: { id: kayit.konutId },
    data:  { daireSahibiId: aktif?.daireSahibiId ?? null },
  });

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const konut = await prisma.konut.findUnique({
    where: { id },
    include: {
      daireSahibi: true,
      sahiplikler: {
        include: { daireSahibi: { select: { id: true, ad: true, soyad: true, tcKimlik: true, telefon: true } } },
        orderBy: [{ alisTarihi: "desc" }],
      },
      sozlesmeler: {
        include: {
          ogrenci: { select: { id: true, ad: true, soyad: true, telefon: true, email: true, cinsiyet: true, universite: true, kimlikBelgesi: true, ogrenciBelgesi: true } },
          odemeler: { orderBy: { odenmeTarihi: "desc" } },
        },
        orderBy: { baslangicTarihi: "desc" },
      },
      bakimTalepleri: {
        include: { ogrenci: { select: { ad: true, soyad: true } } },
        orderBy: { olusturmaTar: "desc" },
      },
      teslimRaporlari: {
        include: { ogrenci: { select: { id: true, ad: true, soyad: true } } },
        orderBy: { tarih: "desc" },
      },
      aidatlar: { orderBy: [{ yil: "desc" }, { ay: "desc" }], take: 24 },
      belgeler: { orderBy: { olusturmaTar: "desc" } },
    },
  });
  if (!konut) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(konut);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const konut = await prisma.konut.update({ where: { id }, data: body });
  return NextResponse.json(konut);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.konut.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

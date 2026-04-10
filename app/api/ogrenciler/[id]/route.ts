import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ogrenci = await prisma.ogrenci.findUnique({
    where: { id },
    include: {
      sozlesmeler: {
        include: {
          konut: { select: { id: true, blok: true, daireNo: true, etap: true, tip: true, katNo: true } },
          odemeler: { orderBy: { odenmeTarihi: "desc" }, take: 20 },
        },
        orderBy: { olusturmaTar: "desc" },
      },
      bakimTalepleri: {
        include: { konut: { select: { blok: true, daireNo: true } } },
        orderBy: { olusturmaTar: "desc" },
        take: 10,
      },
      teslimRaporlari: {
        include: { konut: { select: { blok: true, daireNo: true } } },
        orderBy: { tarih: "desc" },
        take: 5,
      },
      turnikeLoglari: { orderBy: { zaman: "desc" }, take: 20 },
      turnikeEngeli: true,
      gunlukOdemeler: { orderBy: { odenmeTarihi: "desc" }, take: 20 },
    },
  });
  if (!ogrenci) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(ogrenci);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const ogrenci = await prisma.ogrenci.update({ where: { id }, data: body });
  return NextResponse.json(ogrenci);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.ogrenci.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

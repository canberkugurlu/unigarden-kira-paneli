import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const konutlar = await prisma.konut.findMany({
    include: {
      sozlesmeler: {
        where: { durum: "Aktif" },
        include: { ogrenci: { select: { id: true, ad: true, soyad: true, telefon: true } } },
      },
      daireSahibi: true,
    },
    orderBy: { daireNo: "asc" },
  });
  return NextResponse.json(konutlar);
}

export async function POST(req: Request) {
  const body = await req.json();
  const konut = await prisma.konut.create({ data: body });
  return NextResponse.json(konut, { status: 201 });
}

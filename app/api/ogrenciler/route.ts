import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ogrenciler = await prisma.ogrenci.findMany({
    orderBy: { ad: "asc" },
    include: {
      sozlesmeler: {
        where: { durum: "Aktif" },
        select: {
          id: true,
          aylikKira: true,
          oda: true,
          baslangicTarihi: true,
          bitisTarihi: true,
          konut: {
            select: { id: true, blok: true, daireNo: true, etap: true, tip: true },
          },
        },
      },
    },
  });
  return NextResponse.json(ogrenciler);
}

export async function POST(req: Request) {
  const body = await req.json();
  const ogrenci = await prisma.ogrenci.create({ data: body });
  return NextResponse.json(ogrenci, { status: 201 });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const talepler = await prisma.bakimTalebi.findMany({
    include: {
      ogrenci: { select: { id: true, ad: true, soyad: true } },
      konut: { select: { id: true, daireNo: true, blok: true, etap: true } },
    },
    orderBy: { olusturmaTar: "desc" },
  });
  return NextResponse.json(talepler);
}

export async function POST(req: Request) {
  const body = await req.json();
  const talep = await prisma.bakimTalebi.create({ data: body });
  return NextResponse.json(talep, { status: 201 });
}

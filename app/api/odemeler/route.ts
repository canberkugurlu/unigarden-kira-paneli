import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const odemeler = await prisma.odeme.findMany({
    include: { sozlesme: { include: { ogrenci: true, konut: true } } },
    orderBy: { odenmeTarihi: "desc" },
  });
  return NextResponse.json(odemeler);
}

export async function POST(req: Request) {
  const body = await req.json();
  const odeme = await prisma.odeme.create({ data: body });
  return NextResponse.json(odeme, { status: 201 });
}

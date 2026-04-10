import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const giderler = await prisma.gider.findMany({ orderBy: { tarih: "desc" } });
  return NextResponse.json(giderler);
}

export async function POST(req: Request) {
  const body = await req.json();
  const gider = await prisma.gider.create({ data: body });
  return NextResponse.json(gider, { status: 201 });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const duyurular = await prisma.duyuru.findMany({ orderBy: { tarih: "desc" } });
  return NextResponse.json(duyurular);
}

export async function POST(req: Request) {
  const body = await req.json();
  const duyuru = await prisma.duyuru.create({ data: body });
  return NextResponse.json(duyuru, { status: 201 });
}

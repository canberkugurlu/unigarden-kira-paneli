import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const yorumlar = await prisma.bakimTalebiYorum.findMany({
    where: { bakimTalebiId: id },
    orderBy: { olusturmaTar: "asc" },
  });
  return NextResponse.json(yorumlar);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const yorum = await prisma.bakimTalebiYorum.create({
    data: { ...body, bakimTalebiId: id },
  });
  return NextResponse.json(yorum, { status: 201 });
}

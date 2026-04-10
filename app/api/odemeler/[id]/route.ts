import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const odeme = await prisma.odeme.update({ where: { id }, data: body });
  return NextResponse.json(odeme);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.odeme.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

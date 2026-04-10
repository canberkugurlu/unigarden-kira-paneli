import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const tedarikci = await prisma.tedarikci.update({ where: { id }, data: body });
  return NextResponse.json(tedarikci);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.tedarikci.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

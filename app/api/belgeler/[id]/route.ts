import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const belge = await prisma.belge.findUnique({ where: { id } });
  if (!belge) return NextResponse.json({ error: "Belge bulunamadı." }, { status: 404 });

  const fullPath = path.join(process.cwd(), "public", belge.dosyaYolu);
  try {
    await unlink(fullPath);
  } catch {
    // file may already be deleted, continue
  }

  await prisma.belge.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

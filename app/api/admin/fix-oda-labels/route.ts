import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SECRET = process.env.IMPORT_SECRET ?? "etap3-import-2025";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-import-secret");
  if (secret !== SECRET) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  // "Banyo Yanı" → "Oda 1"
  const banyo = await prisma.sozlesme.updateMany({
    where: { oda: "Banyo Yanı" },
    data: { oda: "Oda 1" },
  });

  // "Salon Yanı" → "Oda 2"
  const salon = await prisma.sozlesme.updateMany({
    where: { oda: "Salon Yanı" },
    data: { oda: "Oda 2" },
  });

  return NextResponse.json({ ok: true, oda1: banyo.count, oda2: salon.count });
}

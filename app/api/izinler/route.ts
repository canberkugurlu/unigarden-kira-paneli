import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const izinler = await prisma.kullaniciIzin.findMany({
    orderBy: { guncelleTar: "desc" },
  });
  return NextResponse.json(izinler);
}

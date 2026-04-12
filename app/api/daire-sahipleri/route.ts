import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sahipler = await prisma.daireSahibi.findMany({
    include: {
      konutlar: { orderBy: { daireNo: "asc" } },
      sahiplikler: {
        include: { konut: { select: { id: true, daireNo: true, blok: true, etap: true } } },
        orderBy: [{ alisTarihi: "desc" }],
      },
    },
    orderBy: { ad: "asc" },
  });
  return NextResponse.json(sahipler);
}

export async function POST(req: Request) {
  const body = await req.json();
  const sahibi = await prisma.daireSahibi.create({
    data: {
      tip:      (body.tip ?? "Bireysel") as string,
      ad:       body.ad,
      soyad:    body.soyad,
      telefon:  body.telefon,
      email:    body.email ?? null,
      notlar:   body.notlar ?? null,
      tcKimlik: body.tcKimlik || null,
      vergiNo:  body.vergiNo  || null,
      unvan:    body.unvan    || null,
    },
  });
  return NextResponse.json(sahibi, { status: 201 });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const sozlesmeler = await prisma.sozlesme.findMany({
    where: { durum: { in: ["ImzalandiOnayBekliyor", "OnaylandiAktifBekliyor"] } },
    include: {
      konut: true,
      ogrenci: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onaylar: true as any,
    },
    orderBy: { olusturmaTar: "desc" },
  });
  return NextResponse.json(sozlesmeler);
}

// Admin onayı
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { sozlesmeId } = await req.json();
  if (!sozlesmeId) return NextResponse.json({ error: "sozlesmeId zorunlu." }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mevcutOnay = await (prisma.sozlesmeOnay as any).findUnique({
    where: { sozlesmeId_onaylayan: { sozlesmeId, onaylayan: "Admin" } },
  });
  if (mevcutOnay) return NextResponse.json({ error: "Zaten onaylandı." }, { status: 409 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma.sozlesmeOnay as any).create({
    data: {
      sozlesmeId,
      onaylayan: "Admin",
      onaylayanId: session.id,
      onaylayanAd: `${session.ad} ${session.soyad}`,
    },
  });

  await kontrolVeTamOnay(sozlesmeId);
  return NextResponse.json({ ok: true });
}

async function kontrolVeTamOnay(sozlesmeId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onaylar = await (prisma.sozlesmeOnay as any).findMany({ where: { sozlesmeId } });
  const onaylayanlar = onaylar.map((o: { onaylayan: string }) => o.onaylayan);
  if (
    onaylayanlar.includes("KiralamaSorumlusu") &&
    onaylayanlar.includes("Muhasebeci") &&
    onaylayanlar.includes("Admin")
  ) {
    await prisma.sozlesme.update({ where: { id: sozlesmeId }, data: { durum: "OnaylandiAktifBekliyor" } });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function sozlesmeNo() {
  const now = new Date();
  const yil = now.getFullYear();
  const ay = String(now.getMonth() + 1).padStart(2, "0");
  const rastgele = Math.floor(Math.random() * 9000) + 1000;
  return `SZL-${yil}${ay}-${rastgele}`;
}

export async function GET() {
  const sozlesmeler = await prisma.sozlesme.findMany({
    include: { konut: true, ogrenci: true },
    orderBy: { olusturmaTar: "desc" },
  });
  return NextResponse.json(sozlesmeler);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Kiracının aynı odada zaten aktif sözleşmesi var mı?
    const mevcutSozlesme = await prisma.sozlesme.findFirst({
      where: {
        ogrenciId: body.ogrenciId,
        durum: "Aktif",
        konutId: body.konutId,
        ...(body.oda ? { oda: body.oda } : {}),
      },
    });
    if (mevcutSozlesme) {
      return NextResponse.json(
        { error: "Bu kiracının bu daire/odada zaten aktif bir kira sözleşmesi bulunmaktadır." },
        { status: 409 }
      );
    }

    const sozlesme = await prisma.sozlesme.create({
      data: {
        sozlesmeNo: sozlesmeNo(),
        konutId: body.konutId,
        ogrenciId: body.ogrenciId,
        baslangicTarihi: new Date(body.baslangicTarihi),
        bitisTarihi: new Date(body.bitisTarihi),
        aylikKira: Number(body.aylikKira),
        depozito: Number(body.depozito),
        kiraOdemGunu: Number(body.kiraOdemGunu),
        ozelSartlar: body.ozelSartlar || null,
        durum: "Aktif",
        oda: body.oda || null,
      },
      include: { konut: true, ogrenci: true },
    });
    await prisma.konut.update({ where: { id: body.konutId }, data: { durum: "Dolu" } });
    return NextResponse.json(sozlesme, { status: 201 });
  } catch (err) {
    console.error("Sözleşme oluşturma hatası:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

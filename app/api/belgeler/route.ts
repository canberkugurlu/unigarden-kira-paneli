import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const konutId = searchParams.get("konutId");
  const belgeler = await prisma.belge.findMany({
    where: konutId ? { konutId } : undefined,
    include: { konut: { select: { daireNo: true, blok: true } } },
    orderBy: { olusturmaTar: "desc" },
  });
  return NextResponse.json(belgeler);
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const dosya = formData.get("dosya") as File | null;
  const konutId = formData.get("konutId") as string;
  const ad = formData.get("ad") as string;
  const tip = (formData.get("tip") as string) || "Diger";
  const yukleyenTip = (formData.get("yukleyenTip") as string) || "Admin";
  const yukleyenId = (formData.get("yukleyenId") as string) || "admin";
  const daireSahibiId = formData.get("daireSahibiId") as string | null;

  if (!dosya || !konutId || !ad) {
    return NextResponse.json({ error: "Dosya, konutId ve ad zorunludur." }, { status: 400 });
  }

  const ext = dosya.name.split(".").pop() ?? "bin";
  const dosyaAdi = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const dosyaYolu = `/uploads/belgeler/${dosyaAdi}`;

  const buf = Buffer.from(await dosya.arrayBuffer());
  const fullPath = path.join(process.cwd(), "public", "uploads", "belgeler", dosyaAdi);
  await writeFile(fullPath, buf);

  const belge = await prisma.belge.create({
    data: { ad, tip, dosyaYolu, konutId, yukleyenTip, yukleyenId, daireSahibiId: daireSahibiId || null },
  });
  return NextResponse.json(belge, { status: 201 });
}

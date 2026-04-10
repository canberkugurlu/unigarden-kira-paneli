import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, unlink } from "fs/promises";
import path from "path";

type BelgeAlan = "kimlikBelgesi" | "ogrenciBelgesi";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await req.formData();
  const tip = formData.get("tip") as "kimlik" | "ogrenci";
  const dosya = formData.get("dosya") as File | null;

  if (!dosya || !tip) {
    return NextResponse.json({ error: "Dosya ve tip zorunludur." }, { status: 400 });
  }

  const ext = dosya.name.split(".").pop()?.toLowerCase() ?? "jpg";
  if (!["jpg", "jpeg"].includes(ext)) {
    return NextResponse.json({ error: "Sadece JPEG dosya yüklenebilir." }, { status: 400 });
  }

  const alan: BelgeAlan = tip === "kimlik" ? "kimlikBelgesi" : "ogrenciBelgesi";

  const mevcut = await prisma.ogrenci.findUnique({ where: { id }, select: { kimlikBelgesi: true, ogrenciBelgesi: true } });
  const eskiYol = mevcut?.[alan];
  if (eskiYol) {
    const eskiPath = path.join(process.cwd(), "public", eskiYol);
    try { await unlink(eskiPath); } catch { /* ignore */ }
  }

  const dosyaAdi = `${id}-${tip}-${Date.now()}.jpg`;
  const dosyaYolu = `/uploads/ogrenci-belgeleri/${dosyaAdi}`;
  const fullPath = path.join(process.cwd(), "public", "uploads", "ogrenci-belgeleri", dosyaAdi);

  const buf = Buffer.from(await dosya.arrayBuffer());
  await writeFile(fullPath, buf);

  const updated = await prisma.ogrenci.update({
    where: { id },
    data: { [alan]: dosyaYolu },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { tip } = await req.json();
  const alan: BelgeAlan = tip === "kimlik" ? "kimlikBelgesi" : "ogrenciBelgesi";

  const mevcut = await prisma.ogrenci.findUnique({ where: { id }, select: { kimlikBelgesi: true, ogrenciBelgesi: true } });
  const eskiYol = mevcut?.[alan];
  if (eskiYol) {
    const eskiPath = path.join(process.cwd(), "public", eskiYol);
    try { await unlink(eskiPath); } catch { /* ignore */ }
  }

  const updated = await prisma.ogrenci.update({ where: { id }, data: { [alan]: null } });
  return NextResponse.json(updated);
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tedarikciler = await prisma.tedarikci.findMany({ orderBy: { ad: "asc" } });
  return NextResponse.json(tedarikciler);
}

export async function POST(req: Request) {
  const body = await req.json();
  const tedarikci = await prisma.tedarikci.create({ data: body });
  return NextResponse.json(tedarikci, { status: 201 });
}

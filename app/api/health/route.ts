import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL ?? "";

  let libsqlUrl = dbUrl;
  let authToken: string | undefined;
  if (dbUrl.includes("?authToken=")) {
    const [base, token] = dbUrl.split("?authToken=");
    libsqlUrl = base;
    authToken = token;
  }

  try {
    const client = createClient({ url: libsqlUrl, authToken });
    const result = await Promise.race([
      client.execute("SELECT COUNT(*) as n FROM Konut"),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("libsql timeout 8s")), 8000)),
    ]);
    return NextResponse.json({ ok: true, url: libsqlUrl.substring(0, 40), rows: result.rows });
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, url: libsqlUrl.substring(0, 40), error: err }, { status: 500 });
  }
}

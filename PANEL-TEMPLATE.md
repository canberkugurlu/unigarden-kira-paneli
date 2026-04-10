# Next.js Admin Panel Şablonu — UNIGARDEN Mimarisi

Bu doküman, mevcut UNIGARDEN Kira Yönetim Paneli'nin teknik mimarisini ve kalıplarını açıklar.
Yeni bir panel oluştururken bu şablonu baz alabilirsin.

---

## Tech Stack

| Katman | Teknoloji | Versiyon |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.2.3 |
| UI | React | 19.2.4 |
| Stil | Tailwind CSS | 4.x |
| İkonlar | lucide-react | 1.8.x |
| ORM | Prisma + `@prisma/adapter-libsql` | 7.7.0 |
| Veritabanı | SQLite (libsql) | — |
| Excel | xlsx | 0.18.5 |
| Form | react-hook-form + zod | — |
| Font | Geist (Google Fonts) | — |

---

## Proje Oluşturma

```bash
npx create-next-app@latest yeni-panel --typescript --tailwind --app --turbopack
cd yeni-panel

# Bağımlılıklar
npm install prisma @prisma/client @prisma/adapter-libsql @libsql/client
npm install lucide-react xlsx react-hook-form zod @hookform/resolvers
npm install bcryptjs date-fns
npm install -D @types/bcryptjs dotenv
```

---

## Klasör Yapısı

```
yeni-panel/
├── app/
│   ├── layout.tsx          # Root layout — Sidebar + Header sarmalayıcı
│   ├── globals.css         # Tailwind @import
│   ├── page.tsx            # Ana panel / dashboard
│   ├── [modül]/
│   │   └── page.tsx        # Her modül kendi klasöründe
│   └── api/
│       └── [kaynak]/
│           ├── route.ts        # GET (liste) + POST (oluştur)
│           └── [id]/
│               └── route.ts    # GET (tekil) + PUT (güncelle) + DELETE
├── components/
│   ├── Sidebar.tsx
│   └── Header.tsx
├── lib/
│   └── prisma.ts           # Prisma singleton
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts             # (isteğe bağlı)
├── prisma.config.ts
├── .env
└── tsconfig.json
```

---

## Temel Dosyalar

### `prisma.config.ts`
```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env["DATABASE_URL"] },
});
```

### `.env`
```env
DATABASE_URL="file:/Users/kullanici/veritabani-adi.db"
NEXTAUTH_SECRET="gizli-anahtar"
NEXTAUTH_URL="http://localhost:3000"
```

### `lib/prisma.ts`
```ts
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL tanımlı değil");
  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

> ⚠️ Schema değişikliklerinden sonra **mutlaka** `npx prisma generate` çalıştır
> ve dev sunucusunu yeniden başlat. Aksi hâlde yeni alanlar API'de görünmez.

### `prisma/schema.prisma` (temel)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
}

model Kayit {
  id           String   @id @default(cuid())
  ad           String
  olusturmaTar DateTime @default(now())
}
```

### `app/globals.css`
```css
@import "tailwindcss";

:root {
  --background: #f9fafb;
  --foreground: #111827;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist);
}

body { background: var(--background); color: var(--foreground); }
* { box-sizing: border-box; }
```

### `app/layout.tsx`
```tsx
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Panel Adı",
  description: "Panel açıklaması",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={geist.variable}>
      <body className="flex min-h-screen bg-gray-50 antialiased">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
```

---

## Sidebar Kalıbı

```tsx
// components/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText } from "lucide-react";

const menuItems = [
  { href: "/",        label: "Ana Panel",  icon: LayoutDashboard },
  { href: "/kayitlar", label: "Kayıtlar",  icon: Users },
  { href: "/belgeler", label: "Belgeler",  icon: FileText },
  // ... diğer modüller
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-emerald-400">PANEL ADI</h1>
        <p className="text-xs text-gray-400 mt-1">Alt başlık</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                active ? "bg-emerald-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}>
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-700 text-xs text-gray-500">
        v1.0.0
      </div>
    </aside>
  );
}
```

---

## Header Kalıbı

```tsx
// components/Header.tsx
"use client";
import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/":         "Ana Panel",
  "/kayitlar": "Kayıtlar",
};

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-800">
        {titles[pathname] ?? "Panel"}
      </h2>
      <div className="text-sm text-gray-500">
        {new Date().toLocaleDateString("tr-TR", { dateStyle: "long" })}
      </div>
    </header>
  );
}
```

---

## API Route Kalıpları

### Listeleme + Oluşturma — `app/api/kayitlar/route.ts`
```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const kayitlar = await prisma.kayit.findMany({
    orderBy: { olusturmaTar: "desc" },
  });
  return NextResponse.json(kayitlar);
}

export async function POST(req: Request) {
  const body = await req.json();
  const kayit = await prisma.kayit.create({ data: body });
  return NextResponse.json(kayit, { status: 201 });
}
```

### Tekil İşlemler — `app/api/kayitlar/[id]/route.ts`
```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const kayit = await prisma.kayit.findUnique({ where: { id } });
  if (!kayit) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(kayit);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const kayit = await prisma.kayit.update({ where: { id }, data: body });
  return NextResponse.json(kayit);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.kayit.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
```

> ⚠️ **SQLite string literal tuzağı:** `WHERE durum="Aktif"` gibi çift tırnak
> SQLite'ta **sütun adı** olarak yorumlanır. Her zaman parametre kullan:
> ```ts
> where: { durum: "Aktif" }  // Prisma → parametre → güvenli ✓
> // Raw SQL kullanıyorsan:
> db.execute({ sql: 'SELECT * FROM T WHERE durum = ?', args: ['Aktif'] })
> ```

---

## Sayfa Kalıpları

### Basit CRUD Sayfası

```tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";

interface Kayit { id: string; ad: string; /* ... */ }

// ─── Modal ────────────────────────────────────────────────────────────────────
function KayitModal({ initial, onClose, onSaved }: {
  initial?: Kayit; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({ ad: initial?.ad ?? "" });
  const [saving, setSaving] = useState(false);
  const [hata, setHata] = useState("");

  const save = async () => {
    setSaving(true);
    const url    = initial ? `/api/kayitlar/${initial.id}` : "/api/kayitlar";
    const method = initial ? "PUT" : "POST";
    const res = await fetch(url, {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) { onSaved(); onClose(); }
    else { const j = await res.json(); setHata(j.error ?? "Hata"); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{initial ? "Düzenle" : "Yeni Kayıt"}</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">Ad</label>
            <input value={form.ad} onChange={e => setForm(p => ({ ...p, ad: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
          </div>
          {hata && <p className="text-red-600 text-xs bg-red-50 rounded px-3 py-2">{hata}</p>}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">İptal</button>
          <button onClick={save} disabled={saving}
            className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-60">
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────
export default function KayitlarPage() {
  const [kayitlar, setKayitlar] = useState<Kayit[]>([]);
  const [modal, setModal]       = useState<Kayit | "yeni" | null>(null);
  const [arama, setArama]       = useState("");

  const load = useCallback(() =>
    fetch("/api/kayitlar").then(r => r.json()).then(setKayitlar), []);

  useEffect(() => { load(); }, [load]);

  const sil = async (id: string) => {
    if (!confirm("Silinsin mi?")) return;
    await fetch(`/api/kayitlar/${id}`, { method: "DELETE" });
    load();
  };

  const filtreli = kayitlar.filter(k =>
    k.ad.toLowerCase().includes(arama.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Üst bar */}
      <div className="flex items-center gap-3">
        <input value={arama} onChange={e => setArama(e.target.value)}
          placeholder="Ara..." className="border rounded-lg px-3 py-2 text-sm flex-1" />
        <button onClick={() => setModal("yeni")}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">
          <Plus size={16} /> Yeni Kayıt
        </button>
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Ad</th>
              <th className="px-4 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtreli.map(k => (
              <tr key={k.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 font-medium text-gray-800">{k.ad}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setModal(k)}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => sil(k.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <KayitModal
          initial={modal === "yeni" ? undefined : modal}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}
```

---

## Accordion + Kart/Liste Toggle Kalıbı

Bu panelde kullanılan hiyerarşik görünüm kalıbı:

```
BlokGrubu (accordion başlık — kart/liste toggle)
  └── DaireKart (kart görünümü)
  └── ListeTablosu (liste görünümü — rowSpan ile oda grupları)
```

### Accordion başlığı ile toggle
```tsx
<div className="flex items-center px-5 py-3.5">
  {/* Sol: tıklanabilir başlık */}
  <button onClick={() => setAcik(a => !a)} className="flex items-center gap-3 flex-1 text-left">
    <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">
      {blok}
    </span>
    <div>
      <p className="font-semibold text-gray-800 text-sm">{blok} Blok</p>
      <p className="text-xs text-gray-400">{sayi} kayıt</p>
    </div>
  </button>

  {/* Sağ: görünüm toggle (sadece açıkken) */}
  {acik && (
    <div className="flex items-center gap-1 mr-2">
      <button onClick={() => setGorunum("kart")}
        className={`p-1.5 rounded ${gorunum === "kart" ? "bg-emerald-600 text-white" : "text-gray-400 hover:bg-gray-100"}`}>
        <LayoutGrid size={14} />
      </button>
      <button onClick={() => setGorunum("liste")}
        className={`p-1.5 rounded ${gorunum === "liste" ? "bg-emerald-600 text-white" : "text-gray-400 hover:bg-gray-100"}`}>
        <List size={14} />
      </button>
    </div>
  )}
  <button onClick={() => setAcik(a => !a)}>
    {acik ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
  </button>
</div>
```

### rowSpan ile grup satırları (liste görünümü)
```tsx
import { Fragment } from "react";

{gruplar.map(g => (
  <Fragment key={g.id}>
    {g.satırlar.map((satır, idx) => (
      <tr key={satır.id}>
        {/* Sadece ilk satırda göster, tüm satırları kapsar */}
        {idx === 0 && (
          <td rowSpan={g.satırlar.length} className="align-middle">
            {g.ortak_bilgi}
          </td>
        )}
        <td>{satır.özel_bilgi}</td>
      </tr>
    ))}
  </Fragment>
))}
```

---

## Excel Dışa/İçe Aktarma

```tsx
import * as XLSX from "xlsx";

// Dışa aktarma
function exportExcel(veriler: Record<string, unknown>[]) {
  const ws = XLSX.utils.json_to_sheet(veriler);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sayfa1");
  XLSX.writeFile(wb, `export_${new Date().toISOString().slice(0,10)}.xlsx`);
}

// İçe aktarma
async function importExcel(file: File) {
  const buf  = await file.arrayBuffer();
  const wb   = XLSX.read(buf);
  const ws   = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(ws);
  // rows dizisini işle...
}
```

---

## Renk & Stil Referansı

| Kullanım | Tailwind class |
|---|---|
| Birincil buton | `bg-emerald-600 text-white hover:bg-emerald-700` |
| İkincil buton | `border border-gray-300 text-gray-600 hover:bg-gray-50` |
| Tehlike butonu | `bg-red-600 text-white hover:bg-red-700` |
| Kart container | `bg-white rounded-xl border border-gray-100 shadow-sm` |
| Tablo header | `bg-gray-50 text-xs text-gray-500 uppercase tracking-wide` |
| Badge — Aktif/Dolu | `bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium` |
| Badge — Boş | `bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium` |
| Badge — Uyarı | `bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium` |
| Input / Select | `w-full border rounded-lg px-3 py-2 text-sm` |
| Etiket | `text-xs text-gray-500 block mb-1` |
| Hata mesajı | `text-red-600 text-xs bg-red-50 rounded px-3 py-2` |
| Sidebar arkaplan | `bg-gray-900` |
| Sidebar aktif link | `bg-emerald-600 text-white` |
| Sidebar pasif link | `text-gray-300 hover:bg-gray-800` |

---

## Prisma Workflow

```bash
# Schema değiştir → migrate et → client oluştur
npx prisma migrate dev --name aciklama
npx prisma generate

# Sonra dev sunucusunu yeniden başlat!
# (globalThis.prisma singleton yeni client'ı tanıması için)

# DB'yi görsel incele
npx prisma studio

# Seed çalıştır
npx prisma db seed
```

---

## Yeni Panel Başlatma (Adım Adım)

```bash
# 1. Projeyi oluştur
npx create-next-app@latest yeni-panel --typescript --tailwind --app --turbopack
cd yeni-panel

# 2. Bağımlılıkları kur
npm install prisma @prisma/client @prisma/adapter-libsql @libsql/client
npm install lucide-react xlsx date-fns bcryptjs
npm install -D @types/bcryptjs dotenv

# 3. Prisma başlat
npx prisma init

# 4. schema.prisma → kendi modellerini yaz
# 5. .env → DATABASE_URL="file:/path/to/db.db"
# 6. prisma.config.ts → yukarıdaki şablonu kopyala

# 7. İlk migration
npx prisma migrate dev --name init
npx prisma generate

# 8. lib/prisma.ts → yukarıdaki singleton şablonunu kopyala

# 9. components/Sidebar.tsx + Header.tsx → kopyala ve özelleştir
# 10. app/layout.tsx → kopyala ve özelleştir

# 11. Dev sunucusu başlat
npm run dev
```

---

## Önemli Notlar

1. **`prisma generate` sonrası sunucu restart şart.** Hot-reload `globalThis.prisma`'yı sıfırlamaz.
2. **SQLite'ta çift tırnak = sütun adı.** String literal için tek tırnak veya Prisma parametresi kullan.
3. **`params` artık async.** Next.js 16+ route handler'larda `await params` gerekli.
4. **Prisma adapter için `driverAdapters` preview feature** gerekli değil — `@prisma/adapter-libsql` v7+ otomatik aktif.
5. **`"use client"` direktifi** — Tüm modal ve interaktif bileşenler client component olmalı.
6. **`Fragment` + `key`** — `map()` içinde birden fazla satır dönerken `<Fragment key={...}>` kullan, aksi hâlde React key hatası.

"use client";

import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/": "Ana Panel",
  "/konutlar": "Konutlar",
  "/ogrenciler": "Kiracılar",
  "/ogrenciler/[id]": "Kiracı Kartı",
  "/konutlar/[id]":  "Daire Kartı",
  "/sozlesmeler": "Kira Sözleşmeleri",
  "/sozlesmeler/yeni": "Yeni Sözleşme",
  "/tedarikciler": "Tedarikçiler",
  "/gelirler": "Gelirler",
  "/giderler": "Giderler",
  "/finansal": "Finansal Özet",
  "/kullanicilar": "Kullanıcılar",
  "/izinler": "Rol İzin Yönetimi",
};

export default function Header() {
  const pathname = usePathname();
  // Normalize dynamic segments (e.g. /ogrenciler/abc123 → /ogrenciler/[id])
  const normalized = pathname
    .replace(/\/ogrenciler\/[^/]+$/, "/ogrenciler/[id]")
    .replace(/\/konutlar\/[^/]+$/, "/konutlar/[id]");
  const title = titles[normalized] ?? titles[pathname] ?? "Panel";

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className="text-sm text-gray-500">
        {new Date().toLocaleDateString("tr-TR", { dateStyle: "long" })}
      </div>
    </header>
  );
}

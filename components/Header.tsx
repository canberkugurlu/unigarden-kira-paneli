"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

const titles: Record<string, string> = {
  "/": "Dashboard",
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
  const router = useRouter();
  const normalized = pathname
    .replace(/\/ogrenciler\/[^/]+$/, "/ogrenciler/[id]")
    .replace(/\/konutlar\/[^/]+$/, "/konutlar/[id]");
  const title = titles[normalized] ?? titles[pathname] ?? "Panel";

  const cikisYap = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/giris");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-500 hidden sm:block">
          {new Date().toLocaleDateString("tr-TR", { dateStyle: "long" })}
        </div>
        <button
          onClick={cikisYap}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
          title="Çıkış Yap"
        >
          <LogOut size={14} />
          Çıkış
        </button>
      </div>
    </header>
  );
}

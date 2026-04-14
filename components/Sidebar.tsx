"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Truck,
  TrendingUp,
  TrendingDown,
  BarChart3,
  UserCheck,
  Wrench,
  Megaphone,
  ShieldCheck,
  ChevronDown,
  History,
} from "lucide-react";
import { useState } from "react";

// ─── Menü yapısı ───────────────────────────────────────────────────────────────

const MENU = [
  {
    baslik: null,
    items: [
      { href: "/", label: "Ana Panel", icon: LayoutDashboard },
    ],
  },
  {
    baslik: "VARLIK YÖNETİMİ",
    items: [
      { href: "/konutlar",       label: "Konutlar",         icon: Building2 },
      { href: "/daire-sahipleri", label: "Daire Sahipleri", icon: UserCheck },
      { href: "/ogrenciler",     label: "Kiracılar",        icon: Users },
      { href: "/sozlesmeler",    label: "Kira Sözleşmeleri", icon: FileText },
      { href: "/tedarikciler",   label: "Tedarikçiler",     icon: Truck },
    ],
  },
  {
    baslik: "FİNANSAL",
    items: [
      { href: "/gelirler",   label: "Gelirler",       icon: TrendingUp },
      { href: "/giderler",   label: "Giderler",       icon: TrendingDown },
      { href: "/finansal",   label: "Finansal Özet",  icon: BarChart3 },
    ],
  },
  {
    baslik: "BAKIM & İLETİŞİM",
    items: [
      { href: "/bakim-talepleri", label: "Bakım Talepleri", icon: Wrench },
      { href: "/duyurular",       label: "Duyurular",       icon: Megaphone },
    ],
  },
  {
    baslik: "MUHASEBe PANELİ",
    hariciLink: true,
    items: [
      { href: "http://localhost:3003",                    label: "Ana Panel",          icon: LayoutDashboard, harici: true },
      { href: "http://localhost:3003/odeme-import",       label: "Ödeme İmport",       icon: TrendingUp,      harici: true },
      { href: "http://localhost:3003/aidatlar",           label: "Aidatlar",           icon: BarChart3,       harici: true },
      { href: "http://localhost:3003/servis-faturalari",  label: "Servis Faturaları",  icon: Wrench,          harici: true },
      { href: "http://localhost:3003/teslim-raporlari",   label: "Teslim Raporları",   icon: FileText,        harici: true },
      { href: "http://localhost:3003/turnike",            label: "Turnike Logları",    icon: ShieldCheck,     harici: true },
      { href: "http://localhost:3003/mesajlar",           label: "Mesajlaşma",         icon: Megaphone,       harici: true },
    ],
  },
  {
    baslik: "YÖNETİM",
    items: [
      { href: "/kullanicilar", label: "Kullanıcılar",      icon: Users },
      { href: "/izinler",      label: "Rol İzin Yönetimi", icon: ShieldCheck },
      { href: "/loglar",       label: "İşlem Logları",     icon: History },
    ],
  },
];

interface MenuItem {
  href: string;
  label: string;
  icon: React.ElementType;
  harici?: boolean;
}

interface MenuGroup {
  baslik: string | null;
  hariciLink?: boolean;
  items: MenuItem[];
}

function MenuGrubu({ grup, pathname }: { grup: MenuGroup; pathname: string }) {
  const [acik, setAcik] = useState(true);

  return (
    <div>
      {grup.baslik && (
        <button
          onClick={() => setAcik((a) => !a)}
          className="w-full flex items-center justify-between px-4 py-2 mt-2"
        >
          <span className="text-[10px] font-semibold tracking-widest text-gray-500">
            {grup.baslik}
          </span>
          <ChevronDown
            size={12}
            className={`text-gray-500 transition-transform ${acik ? "" : "-rotate-90"}`}
          />
        </button>
      )}

      {(acik || !grup.baslik) && (
        <div className="space-y-0.5">
          {grup.items.map(({ href, label, icon: Icon, harici }) => {
            const active = !harici && pathname === href;
            return harici ? (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <Icon size={16} />
                <span className="flex-1">{label}</span>
                <svg className="w-3 h-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-emerald-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-700/60 shrink-0">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/UNIGARDEN_LOGO_nobg.png" alt="Unigarden Logo" className="w-10 h-10 object-contain shrink-0" />
          <p className="text-xs text-gray-400 leading-tight">Kira Yönetim Paneli</p>
        </Link>
      </div>

      {/* Nav — kaydırılabilir */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {MENU.map((grup, i) => (
          <MenuGrubu key={i} grup={grup} pathname={pathname} />
        ))}
      </nav>

      {/* Alt bilgi */}
      <div className="px-5 py-3 border-t border-gray-700/60 text-xs text-gray-500 shrink-0">
        v1.0.0 &copy; {new Date().getFullYear()} Unigarden
      </div>
    </aside>
  );
}

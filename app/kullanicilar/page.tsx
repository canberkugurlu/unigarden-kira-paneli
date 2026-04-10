"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users, Plus, Pencil, Trash2, X, Save, ShieldCheck,
  Eye, EyeOff, ToggleLeft, ToggleRight, Search, ChevronDown,
} from "lucide-react";

interface Kullanici {
  id: string;
  ad: string;
  soyad: string;
  email: string;
  rol: string;
  telefon: string | null;
  aktif: boolean;
  notlar: string | null;
  sonGiris: string | null;
  olusturmaTar: string;
}

// ─── Rol tanımları ─────────────────────────────────────────────────────────────

const ROLLER = [
  {
    id: "Admin",
    label: "Admin",
    aciklama: "Tüm panellere tam erişim",
    renk: "bg-gray-900 text-white",
    rozet: "bg-gray-900 text-white",
  },
  {
    id: "Muhasebeci",
    label: "Muhasebeci",
    aciklama: "Ödeme, aidat, fatura işlemleri",
    renk: "bg-purple-600 text-white",
    rozet: "bg-purple-100 text-purple-700",
  },
  {
    id: "Teknik",
    label: "Teknik Personel",
    aciklama: "Bakım talepleri, teslim raporları",
    renk: "bg-orange-500 text-white",
    rozet: "bg-orange-100 text-orange-700",
  },
  {
    id: "Guvenlik",
    label: "Güvenlik",
    aciklama: "Turnike logları, giriş-çıkış kontrolü",
    renk: "bg-red-600 text-white",
    rozet: "bg-red-100 text-red-700",
  },
  {
    id: "KiralamaSorumlusu",
    label: "Kiralama Sorumlusu",
    aciklama: "Sözleşme, kiracı ve konut yönetimi",
    renk: "bg-blue-600 text-white",
    rozet: "bg-blue-100 text-blue-700",
  },
];

function rolBilgi(id: string) {
  return ROLLER.find((r) => r.id === id) ?? {
    id,
    label: id,
    aciklama: "",
    renk: "bg-gray-400 text-white",
    rozet: "bg-gray-100 text-gray-700",
  };
}

function RolDropdown({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [acik, setAcik] = useState(false);
  const secili = rolBilgi(value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAcik((a) => !a)}
        className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400 bg-white hover:border-gray-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${secili.rozet}`}>
            {secili.label}
          </span>
          <span className="text-gray-400 text-xs">{secili.aciklama}</span>
        </div>
        <ChevronDown size={15} className={`text-gray-400 transition-transform ${acik ? "rotate-180" : ""}`} />
      </button>

      {acik && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {ROLLER.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => { onChange(r.id); setAcik(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                value === r.id ? "bg-emerald-50" : ""
              }`}
            >
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${r.rozet}`}>
                {r.label}
              </span>
              <span className="text-xs text-gray-400 flex-1">{r.aciklama}</span>
              {value === r.id && <ShieldCheck size={14} className="text-emerald-500 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const BOŞ_FORM = {
  ad: "", soyad: "", email: "", sifre: "",
  rol: "KiralamaSorumlusu", telefon: "", notlar: "",
};

export default function KullanicilarPage() {
  const [kullanicilar, setKullanicilar] = useState<Kullanici[]>([]);
  const [arama, setArama] = useState("");
  const [rolFiltre, setRolFiltre] = useState("");
  const [modal, setModal] = useState<"yeni" | "duzenle" | null>(null);
  const [secili, setSecili] = useState<Kullanici | null>(null);
  const [form, setForm] = useState({ ...BOŞ_FORM });
  const [sifreGoster, setSifreGoster] = useState(false);
  const [kayit, setKayit] = useState(false);
  const [silinecek, setSilinecek] = useState<Kullanici | null>(null);

  const yukle = useCallback(async () => {
    const r = await fetch("/api/kullanicilar");
    setKullanicilar(await r.json());
  }, []);

  useEffect(() => { yukle(); }, [yukle]);

  function duzenle(k: Kullanici) {
    setSecili(k);
    setForm({
      ad: k.ad, soyad: k.soyad, email: k.email,
      sifre: "", rol: k.rol,
      telefon: k.telefon ?? "", notlar: k.notlar ?? "",
    });
    setModal("duzenle");
  }

  async function kaydet() {
    setKayit(true);
    if (modal === "yeni") {
      await fetch("/api/kullanicilar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else if (secili) {
      const data: Record<string, string> = { ...form };
      if (!data.sifre) delete data.sifre;
      await fetch(`/api/kullanicilar/${secili.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setKayit(false);
    setModal(null);
    setForm({ ...BOŞ_FORM });
    setSecili(null);
    yukle();
  }

  async function aktifToggle(k: Kullanici) {
    await fetch(`/api/kullanicilar/${k.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aktif: !k.aktif }),
    });
    yukle();
  }

  async function sil() {
    if (!silinecek) return;
    await fetch(`/api/kullanicilar/${silinecek.id}`, { method: "DELETE" });
    setSilinecek(null);
    yukle();
  }

  const filtrelenmis = kullanicilar.filter((k) => {
    const q = arama.toLowerCase();
    const isimEsles = !q || `${k.ad} ${k.soyad} ${k.email}`.toLowerCase().includes(q);
    const rolEsles = !rolFiltre || k.rol === rolFiltre;
    return isimEsles && rolEsles;
  });

  // Rol bazında grupla
  const gruplar = ROLLER.map((r) => ({
    rol: r,
    liste: filtrelenmis.filter((k) => k.rol === r.id),
  })).filter((g) => g.liste.length > 0 || (!rolFiltre && !arama));

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Users size={22} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-xl">Personel Kullanıcıları</h2>
            <p className="text-sm text-gray-400">
              Panel erişimi olan {kullanicilar.length} kullanıcı
            </p>
          </div>
        </div>
        <button
          onClick={() => { setModal("yeni"); setForm({ ...BOŞ_FORM }); }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700"
        >
          <Plus size={17} />
          Kullanıcı Ekle
        </button>
      </div>

      {/* Rol özet kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {ROLLER.map((r) => {
          const adet = kullanicilar.filter((k) => k.rol === r.id).length;
          const aktifAdet = kullanicilar.filter((k) => k.rol === r.id && k.aktif).length;
          return (
            <button
              key={r.id}
              onClick={() => setRolFiltre(rolFiltre === r.id ? "" : r.id)}
              className={`rounded-xl p-4 border-2 text-left transition-all ${
                rolFiltre === r.id
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <div className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold mb-2 ${r.rozet}`}>
                {r.label}
              </div>
              <div className="text-2xl font-bold text-gray-800">{adet}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {aktifAdet} aktif
              </div>
            </button>
          );
        })}
      </div>

      {/* Arama + Filtre */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            placeholder="İsim veya e-posta ara..."
            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
          />
        </div>
        {rolFiltre && (
          <button
            onClick={() => setRolFiltre("")}
            className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            <X size={14} />
            {rolBilgi(rolFiltre).label}
          </button>
        )}
      </div>

      {/* Kullanıcı listesi gruplu */}
      {filtrelenmis.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users size={40} className="mx-auto mb-3 opacity-20" />
          <p>{arama || rolFiltre ? "Sonuç bulunamadı" : "Henüz kullanıcı eklenmedi"}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {gruplar.map(({ rol, liste }) => (
            liste.length > 0 && (
              <div key={rol.id}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${rol.rozet}`}>
                    {rol.label}
                  </span>
                  <span className="text-xs text-gray-400">{liste.length} kişi</span>
                  <span className="text-xs text-gray-300">— {rol.aciklama}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {liste.map((k) => (
                    <div
                      key={k.id}
                      className={`bg-white rounded-xl border p-4 flex items-start gap-4 ${
                        k.aktif ? "border-gray-200" : "border-gray-100 opacity-60"
                      }`}
                    >
                      {/* Avatar */}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 ${rol.renk}`}>
                        {k.ad[0]}{k.soyad[0]}
                      </div>

                      {/* Bilgiler */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-800 text-sm">
                            {k.ad} {k.soyad}
                          </p>
                          {!k.aktif && (
                            <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-500">Pasif</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{k.email}</p>
                        {k.telefon && (
                          <p className="text-xs text-gray-400">{k.telefon}</p>
                        )}
                        {k.notlar && (
                          <p className="text-xs text-gray-300 mt-1 italic truncate">{k.notlar}</p>
                        )}
                        <p className="text-xs text-gray-300 mt-1">
                          Oluşturulma: {new Date(k.olusturmaTar).toLocaleDateString("tr-TR")}
                        </p>
                      </div>

                      {/* Aksiyonlar */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => aktifToggle(k)}
                          title={k.aktif ? "Pasife al" : "Aktife al"}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          {k.aktif
                            ? <ToggleRight size={20} className="text-emerald-500" />
                            : <ToggleLeft size={20} />}
                        </button>
                        <button
                          onClick={() => duzenle(k)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setSilinecek(k)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Yeni / Düzenle Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            {/* Modal başlık */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg">
                {modal === "yeni" ? "Yeni Kullanıcı Ekle" : "Kullanıcıyı Düzenle"}
              </h3>
              <button onClick={() => { setModal(null); setSecili(null); }}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Modal içerik */}
            <div className="px-6 py-5 space-y-4">
              {/* Ad Soyad */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ad</label>
                  <input
                    value={form.ad}
                    onChange={(e) => setForm((p) => ({ ...p, ad: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
                    placeholder="Mustafa"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Soyad</label>
                  <input
                    value={form.soyad}
                    onChange={(e) => setForm((p) => ({ ...p, soyad: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
                    placeholder="Yılmaz"
                  />
                </div>
              </div>

              {/* E-posta */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">E-posta</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
                  placeholder="mustafa@unigarden.com"
                />
              </div>

              {/* Şifre */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Şifre {modal === "duzenle" && <span className="text-gray-400">(boş bırakılırsa değişmez)</span>}
                </label>
                <div className="relative">
                  <input
                    type={sifreGoster ? "text" : "password"}
                    value={form.sifre}
                    onChange={(e) => setForm((p) => ({ ...p, sifre: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-emerald-400"
                    placeholder={modal === "yeni" ? "Güçlü bir şifre girin" : "••••••••"}
                  />
                  <button
                    type="button"
                    onClick={() => setSifreGoster((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {sifreGoster ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Rol — dropdown */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rol</label>
                <RolDropdown
                  value={form.rol}
                  onChange={(id) => setForm((p) => ({ ...p, rol: id }))}
                />
              </div>

              {/* Telefon */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Telefon (opsiyonel)</label>
                <input
                  value={form.telefon}
                  onChange={(e) => setForm((p) => ({ ...p, telefon: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
                  placeholder="0555 000 00 00"
                />
              </div>

              {/* Notlar */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notlar (opsiyonel)</label>
                <textarea
                  value={form.notlar}
                  onChange={(e) => setForm((p) => ({ ...p, notlar: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400 resize-none"
                  placeholder="Vardiya bilgisi, departman vb."
                />
              </div>
            </div>

            {/* Modal alt */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => { setModal(null); setSecili(null); }}
                className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={kaydet}
                disabled={kayit || !form.ad || !form.soyad || !form.email || (modal === "yeni" && !form.sifre)}
                className="flex-1 bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={15} />
                {kayit ? "Kaydediliyor…" : modal === "yeni" ? "Kullanıcı Oluştur" : "Değişiklikleri Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Silme onayı */}
      {silinecek && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-xl">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto">
              <Trash2 size={22} className="text-red-600" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-gray-800">Kullanıcıyı Sil</h3>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-medium">{silinecek.ad} {silinecek.soyad}</span> adlı kullanıcı kalıcı olarak silinecek.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSilinecek(null)}
                className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm"
              >
                İptal
              </button>
              <button
                onClick={sil}
                className="flex-1 bg-red-600 text-white rounded-xl py-2.5 text-sm hover:bg-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

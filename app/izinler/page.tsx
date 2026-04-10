"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Save, Users, UserCheck, Wrench, Calculator, Crown } from "lucide-react";

interface IzinlerObj { sayfalar: string[]; eylemler: string[]; }

// ─── Rol tanımları ─────────────────────────────────────────────────────────────

const ROLLER = [
  {
    id: "Admin",
    label: "Admin (Yönetim Paneli)",
    aciklama: "Tüm departman işlemleri — tam erişim, herhangi bir kısıtlama yok",
    icon: Crown,
    renk: "bg-gray-900",
    acikRenk: "bg-gray-100",
    yaziRenk: "text-gray-800",
    sinirRenk: "border-gray-800",
    sayfalar: [
      // Ana panel
      { key: "ana_panel",            label: "Ana Panel" },
      { key: "konutlar",             label: "Konutlar" },
      { key: "daire_sahipleri",      label: "Daire Sahipleri" },
      { key: "ogrenciler",           label: "Kiracılar" },
      { key: "sozlesmeler",          label: "Kira Sözleşmeleri" },
      { key: "tedarikciler",         label: "Tedarikçiler" },
      { key: "gelirler",             label: "Gelirler" },
      { key: "giderler",             label: "Giderler" },
      { key: "finansal",             label: "Finansal Özet" },
      { key: "bakim_talepleri",      label: "Bakım Talepleri" },
      { key: "duyurular",            label: "Duyurular" },
      { key: "izinler",              label: "Rol İzin Yönetimi" },
      // Muhasebe
      { key: "odeme_import",         label: "Ödeme İmport (Excel)" },
      { key: "aidatlar",             label: "Aidatlar" },
      { key: "servis_faturalari",    label: "Servis Faturaları" },
      { key: "teslim_raporlari",     label: "Teslim Raporları" },
      { key: "turnike",              label: "Turnike Logları" },
      { key: "mesajlar",             label: "Mesajlaşma" },
    ],
    eylemler: [
      // Kiracı işlemleri
      { key: "kiraci_ekle",          label: "Kiracı ekle / düzenle / sil" },
      { key: "sozlesme_olustur",     label: "Sözleşme oluştur / iptal et" },
      { key: "odeme_kaydet",         label: "Ödeme kaydet" },
      { key: "daire_sec",            label: "Kiracıya daire ata" },
      // Konut & ev sahibi
      { key: "konut_ekle",           label: "Konut ekle / düzenle / sil" },
      { key: "sahibi_ekle",          label: "Daire sahibi ekle / düzenle" },
      { key: "kira_guncelle",        label: "Kira bedeli güncelle" },
      { key: "belge_yukle",          label: "Belge yükle / sil" },
      // Bakım & teknik
      { key: "bakim_durum_guncelle", label: "Bakım durumu güncelle" },
      { key: "servis_fatura_ekle",   label: "Servis faturası ekle / düzenle" },
      { key: "teslim_raporu_olustur", label: "Teslim raporu oluştur / onayla" },
      { key: "foto_yukle",           label: "Fotoğraf yükle" },
      { key: "yorum_ekle",           label: "Bakım yorumu ekle" },
      // Muhasebe
      { key: "aidat_borclandir",     label: "Aidat borçlandır" },
      { key: "odeme_isle",           label: "Ödeme işle / eşleştir" },
      { key: "engel_ekle",           label: "Turnike engeli ekle / kaldır" },
      { key: "rapor_onayla",         label: "Raporları onayla" },
      { key: "fatura_odendi",        label: "Fatura ödendi işaretle" },
      // Yönetim
      { key: "duyuru_yayinla",       label: "Duyuru yayınla / düzenle / sil" },
      { key: "izin_duzenle",         label: "Rol izinlerini düzenle" },
      { key: "mesaj_gonder",         label: "Tüm departmanlara mesaj gönder" },
    ],
  },
  {
    id: "Kiraci",
    label: "Kiracılar",
    aciklama: "Öğrenci kiracıların erişebildiği panel (port 3001)",
    icon: Users,
    renk: "bg-emerald-500",
    acikRenk: "bg-emerald-50",
    yaziRenk: "text-emerald-700",
    sinirRenk: "border-emerald-200",
    sayfalar: [
      { key: "sozlesmem",     label: "Sözleşmem" },
      { key: "odemelerim",    label: "Ödemelerim" },
      { key: "bakim",         label: "Bakım Bildirimi" },
      { key: "duyurular",     label: "Duyurular" },
      { key: "sifre",         label: "Şifre Değiştir" },
    ],
    eylemler: [
      { key: "bakim_bildir",  label: "Bakım talebi oluştur" },
      { key: "odeme_goruntule", label: "Ödeme geçmişi görüntüle" },
      { key: "sifre_degistir", label: "Şifresini değiştir" },
      { key: "duyuru_goruntule", label: "Duyuruları görüntüle" },
    ],
  },
  {
    id: "EvSahibi",
    label: "Ev Sahipleri",
    aciklama: "Daire sahibi kullanıcıların erişebildiği panel (port 3002)",
    icon: UserCheck,
    renk: "bg-blue-500",
    acikRenk: "bg-blue-50",
    yaziRenk: "text-blue-700",
    sinirRenk: "border-blue-200",
    sayfalar: [
      { key: "dairelerim",    label: "Dairelerim" },
      { key: "gelirler",      label: "Kira Gelirleri" },
      { key: "sozlesmeler",   label: "Sözleşmeler" },
      { key: "bakim",         label: "Bakım Talepleri" },
      { key: "belgeler",      label: "Belgeler" },
      { key: "sifre",         label: "Şifre Değiştir" },
    ],
    eylemler: [
      { key: "kira_guncelle", label: "Kira bedeli güncelle" },
      { key: "yorum_ekle",    label: "Bakım yorumu ekle" },
      { key: "belge_yukle",   label: "Belge yükle" },
      { key: "sozlesme_goruntule", label: "Sözleşme görüntüle" },
      { key: "gelir_goruntule", label: "Gelir raporu görüntüle" },
    ],
  },
  {
    id: "Teknik",
    label: "Teknik Personel",
    aciklama: "Bakım ve teknik işlemler için yetki alanı",
    icon: Wrench,
    renk: "bg-orange-500",
    acikRenk: "bg-orange-50",
    yaziRenk: "text-orange-700",
    sinirRenk: "border-orange-200",
    sayfalar: [
      { key: "bakim_talepleri", label: "Bakım Talepleri" },
      { key: "konutlar",       label: "Konutlar (görüntüle)" },
      { key: "teslim_raporlari", label: "Teslim Raporları" },
      { key: "mesajlar",       label: "Mesajlaşma" },
      { key: "servis_faturalari", label: "Servis Faturaları" },
    ],
    eylemler: [
      { key: "bakim_durum_guncelle", label: "Bakım durumu güncelle" },
      { key: "servis_fatura_ekle",   label: "Servis faturası ekle" },
      { key: "teslim_raporu_olustur", label: "Teslim raporu oluştur" },
      { key: "foto_yukle",           label: "Fotoğraf yükle" },
      { key: "yorum_ekle",           label: "Bakım yorumu ekle" },
      { key: "mesaj_gonder",         label: "Mesaj gönder" },
    ],
  },
  {
    id: "Muhasebe",
    label: "Muhasebe Personeli",
    aciklama: "Finansal işlemler ve raporlama paneli (port 3003)",
    icon: Calculator,
    renk: "bg-purple-500",
    acikRenk: "bg-purple-50",
    yaziRenk: "text-purple-700",
    sinirRenk: "border-purple-200",
    sayfalar: [
      { key: "ana_panel",          label: "Ana Panel" },
      { key: "odeme_import",       label: "Ödeme İmport (Excel)" },
      { key: "aidatlar",           label: "Aidatlar" },
      { key: "servis_faturalari",  label: "Servis Faturaları" },
      { key: "teslim_raporlari",   label: "Teslim Raporları" },
      { key: "turnike",            label: "Turnike Logları" },
      { key: "mesajlar",           label: "Mesajlaşma" },
    ],
    eylemler: [
      { key: "aidat_borclandir",   label: "Aidat borçlandır" },
      { key: "odeme_isle",         label: "Ödeme işle / eşleştir" },
      { key: "engel_ekle",         label: "Turnike engeli ekle" },
      { key: "engel_kaldir",       label: "Turnike engeli kaldır" },
      { key: "mesaj_gonder",       label: "Mesaj gönder" },
      { key: "rapor_onayla",       label: "Teslim raporunu onayla" },
      { key: "servis_fatura_ekle", label: "Servis faturası ekle/düzenle" },
      { key: "fatura_odendi",      label: "Fatura ödendi işaretle" },
    ],
  },
];

function defaultIzinler(rol: typeof ROLLER[0]): IzinlerObj {
  return {
    sayfalar: rol.sayfalar.map((s) => s.key),
    eylemler: rol.eylemler.map((e) => e.key),
  };
}

function RolKart({ rol }: { rol: typeof ROLLER[0] }) {
  const isAdmin = rol.id === "Admin";
  const [izinler, setIzinler] = useState<IzinlerObj | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [acik, setAcik] = useState(isAdmin);

  useEffect(() => {
    fetch(`/api/izinler/rol/${rol.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data) {
          setIzinler(defaultIzinler(rol));
          return;
        }
        try {
          const parsed = JSON.parse(data.izinler);
          setIzinler({
            sayfalar: Array.isArray(parsed.sayfalar) ? parsed.sayfalar : [],
            eylemler: Array.isArray(parsed.eylemler) ? parsed.eylemler : [],
          });
        } catch {
          setIzinler(defaultIzinler(rol));
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rol.id]);

  const toggle = (grup: "sayfalar" | "eylemler", key: string) => {
    setIzinler((prev) => {
      if (!prev) return prev;
      const list = prev[grup];
      return {
        ...prev,
        [grup]: list.includes(key) ? list.filter((k) => k !== key) : [...list, key],
      };
    });
    setSaved(false);
  };

  const tumunuSec = (grup: "sayfalar" | "eylemler") => {
    const tumKeys = (grup === "sayfalar" ? rol.sayfalar : rol.eylemler).map((x) => x.key);
    setIzinler((prev) => prev ? { ...prev, [grup]: tumKeys } : prev);
    setSaved(false);
  };

  const hepsiniKaldir = (grup: "sayfalar" | "eylemler") => {
    setIzinler((prev) => prev ? { ...prev, [grup]: [] } : prev);
    setSaved(false);
  };

  const kaydet = async () => {
    if (!izinler) return;
    setSaving(true);
    await fetch(`/api/izinler/rol/${rol.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ izinler: JSON.stringify(izinler) }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Icon = rol.icon;
  const sayfaSecili = izinler?.sayfalar.length ?? 0;
  const eylemSecili = izinler?.eylemler.length ?? 0;

  return (
    <div className={`bg-white rounded-2xl border-2 ${isAdmin ? "border-gray-800" : acik ? rol.sinirRenk : "border-gray-100"} shadow-sm overflow-hidden transition-all`}>
      {/* Başlık */}
      <div
        onClick={() => !isAdmin && setAcik((a) => !a)}
        className={`w-full flex items-center gap-4 px-6 py-5 text-left ${isAdmin ? "bg-gray-900 cursor-default" : "hover:bg-gray-50 cursor-pointer transition-colors"}`}
      >
        <div className={`w-12 h-12 rounded-xl ${rol.renk} flex items-center justify-center shrink-0 ${isAdmin ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-900" : ""}`}>
          <Icon size={22} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold text-base ${isAdmin ? "text-white" : "text-gray-800"}`}>{rol.label}</h3>
            {isAdmin && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-400 text-gray-900 uppercase tracking-wide">
                Tam Erişim
              </span>
            )}
          </div>
          <p className={`text-xs mt-0.5 ${isAdmin ? "text-gray-400" : "text-gray-400"}`}>{rol.aciklama}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex gap-2 text-xs">
            <span className={`px-2.5 py-1 rounded-full font-medium ${isAdmin ? "bg-white/10 text-white" : `${rol.acikRenk} ${rol.yaziRenk}`}`}>
              {sayfaSecili} sayfa
            </span>
            <span className={`px-2.5 py-1 rounded-full font-medium ${isAdmin ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
              {eylemSecili} işlem
            </span>
          </div>
          {!isAdmin && (
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${acik ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>

      {/* İçerik */}
      {acik && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
            {/* Sayfalar */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Erişebileceği Sayfalar</p>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => tumunuSec("sayfalar")} className="text-blue-500 hover:text-blue-700">Tümü</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={() => hepsiniKaldir("sayfalar")} className="text-red-400 hover:text-red-600">Hepsini Kaldır</button>
                </div>
              </div>
              <div className="space-y-2">
                {rol.sayfalar.map((s) => (
                  <label
                    key={s.key}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      izinler?.sayfalar.includes(s.key)
                        ? `${rol.acikRenk} border border-current ${rol.yaziRenk}`
                        : "bg-gray-50 border border-gray-100 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={izinler?.sayfalar.includes(s.key) ?? false}
                      onChange={() => toggle("sayfalar", s.key)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* İşlemler */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Yapabileceği İşlemler</p>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => tumunuSec("eylemler")} className="text-blue-500 hover:text-blue-700">Tümü</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={() => hepsiniKaldir("eylemler")} className="text-red-400 hover:text-red-600">Hepsini Kaldır</button>
                </div>
              </div>
              <div className="space-y-2">
                {rol.eylemler.map((e) => (
                  <label
                    key={e.key}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      izinler?.eylemler.includes(e.key)
                        ? `${rol.acikRenk} border border-current ${rol.yaziRenk}`
                        : "bg-gray-50 border border-gray-100 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={izinler?.eylemler.includes(e.key) ?? false}
                      onChange={() => toggle("eylemler", e.key)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">{e.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Kaydet */}
          <div className="flex justify-end mt-5 pt-4 border-t border-gray-100">
            <button
              onClick={kaydet}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                saved
                  ? "bg-green-100 text-green-700"
                  : `${rol.renk} text-white hover:opacity-90`
              } disabled:opacity-60`}
            >
              <Save size={15} />
              {saved ? "Kaydedildi ✓" : saving ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IzinlerPage() {
  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
          <ShieldCheck size={24} className="text-emerald-600" />
        </div>
        <div>
          <h2 className="font-bold text-gray-800 text-xl">Rol Bazlı İzin Yönetimi</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Her kullanıcı rolünün hangi sayfalara erişebileceğini ve hangi işlemleri yapabileceğini belirleyin.
            Değişiklikler ilgili paneldeki tüm o rol kullanıcılarına uygulanır.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {ROLLER.map((rol) => (
          <RolKart key={rol.id} rol={rol} />
        ))}
      </div>
    </div>
  );
}

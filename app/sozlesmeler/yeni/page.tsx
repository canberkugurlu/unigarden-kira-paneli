"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  konutId: z.string().min(1, "Konut seçimi zorunludur"),
  ogrenciId: z.string().min(1, "Kiracı seçimi zorunludur"),
  baslangicTarihi: z.string().min(1),
  bitisTarihi: z.string().min(1),
  aylikKira: z.coerce.number().positive("Kira bedeli gerekli"),
  depozito: z.coerce.number().min(0),
  kiraOdemGunu: z.coerce.number().min(1).max(28),
  ozelSartlar: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface Konut { id: string; daireNo: string; blok: string; kiraBedeli: number; durum: string }
interface Ogrenci { id: string; ad: string; soyad: string }

export default function YeniSozlesmePage() {
  const router = useRouter();
  const [konutlar, setKonutlar] = useState<Konut[]>([]);
  const [ogrenciler, setOgrenciler] = useState<Ogrenci[]>([]);
  const [loading, setLoading] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: { kiraOdemGunu: 1, depozito: 0 },
  });

  const secilenKonutId = watch("konutId");

  useEffect(() => {
    fetch("/api/konutlar").then(r => r.json()).then(setKonutlar);
    fetch("/api/ogrenciler").then(r => r.json()).then(setOgrenciler);
  }, []);

  useEffect(() => {
    const konut = konutlar.find(k => k.id === secilenKonutId);
    if (konut) setValue("aylikKira", konut.kiraBedeli);
  }, [secilenKonutId, konutlar, setValue]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setHata(null);
    try {
      const res = await fetch("/api/sozlesmeler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        router.push("/sozlesmeler");
      } else {
        const json = await res.json();
        setHata(json.error ?? "Bilinmeyen bir hata oluştu.");
      }
    } catch {
      setHata("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

  const bosKonutlar = konutlar.filter(k => k.durum === "Bos");

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Yeni Kira Sözleşmesi</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div>
            <label className="text-sm font-medium text-gray-700">Konut Seçin</label>
            <select {...register("konutId")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
              <option value="">-- Boş konut seçin --</option>
              {bosKonutlar.map(k => (
                <option key={k.id} value={k.id}>Blok {k.blok} / Daire {k.daireNo}</option>
              ))}
            </select>
            {errors.konutId && <p className="text-red-500 text-xs mt-1">{errors.konutId.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Kiracı Seçin</label>
            <select {...register("ogrenciId")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
              <option value="">-- Kiracı seçin --</option>
              {ogrenciler.map(o => (
                <option key={o.id} value={o.id}>{o.ad} {o.soyad}</option>
              ))}
            </select>
            {errors.ogrenciId && <p className="text-red-500 text-xs mt-1">{errors.ogrenciId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Başlangıç Tarihi</label>
              <input {...register("baslangicTarihi")} type="date" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Bitiş Tarihi</label>
              <input {...register("bitisTarihi")} type="date" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Aylık Kira (₺)</label>
              <input {...register("aylikKira")} type="number" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
              {errors.aylikKira && <p className="text-red-500 text-xs mt-1">{errors.aylikKira.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Depozito (₺)</label>
              <input {...register("depozito")} type="number" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Ödeme Günü</label>
              <input {...register("kiraOdemGunu")} type="number" min={1} max={28} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Özel Şartlar / Notlar</label>
            <textarea {...register("ozelSartlar")} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="Ek şartlar varsa buraya yazın..." />
          </div>

          {hata && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {hata}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "Kaydediliyor..." : "Sözleşme Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

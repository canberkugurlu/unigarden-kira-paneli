#!/usr/bin/env node
/**
 * UNIGARDEN – 1. Etap Daire Ekleme / Sıfırlama Ajanı
 * Kullanım:
 *   node Agent/daire-ekle.js              → sil + yeniden ekle
 *   node Agent/daire-ekle.js --dry-run    → sadece ne yapılacağını göster
 *   node Agent/daire-ekle.js --base-url=http://localhost:3000
 */

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const BASE_URL =
  args.find((a) => a.startsWith("--base-url="))?.split("=")[1] ?? "http://localhost:3000";

// ── 1. Etap blok tanımları ────────────────────────────────────────────────────
// daireNo: her blokta 1'den başlar (benzersizlik için "A-1", "B-1" formatı kullanılır)
const BLOKLAR = [
  { blok: "A", adet: 50, tip: "2+1", m2: 62 },
  { blok: "B", adet: 50, tip: "2+1", m2: 62 },
  { blok: "C", adet: 32, tip: "1+1", m2: 48 },
  { blok: "D", adet: 32, tip: "1+1", m2: 48 },
  { blok: "E", adet: 44, tip: "1+1", m2: 48 },
  { blok: "F", adet: 44, tip: "1+1", m2: 48 },
  { blok: "G", adet: 34, tip: "1+1", m2: 48 },
  { blok: "H", adet: 34, tip: "1+1", m2: 48 },
  { blok: "I", adet: 34, tip: "1+1", m2: 48 },
  { blok: "J", adet: 34, tip: "1+1", m2: 48 },
  { blok: "K", adet: 34, tip: "1+1", m2: 48 },
  { blok: "L", adet: 44, tip: "1+1", m2: 48 },
  { blok: "M", adet: 44, tip: "1+1", m2: 48 },
  { blok: "N", adet: 44, tip: "1+1", m2: 48 },
  { blok: "O", adet: 34, tip: "1+1", m2: 48 },
  { blok: "P", adet: 14, tip: "1+1", m2: 38 },
];

const DAIRE_PER_KAT = 8;
const ETAP = 1;

// ── Yardımcı ─────────────────────────────────────────────────────────────────
async function api(path, opts = {}) {
  const res = await fetch(`${BASE_URL}${path}`, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} ${path}: ${text}`);
  }
  return res.json();
}

function daireListesiOlustur({ blok, adet, tip, m2 }) {
  const daireler = [];
  for (let i = 1; i <= adet; i++) {
    const kat = Math.ceil(i / DAIRE_PER_KAT);
    daireler.push({
      blok,
      katNo: kat,
      daireNo: `${blok}-${i}`,   // örn: A-1, A-2, ... A-50
      tip,
      metrekare: m2,
      kiraBedeli: 0,
      durum: "Bos",
      etap: ETAP,
      ozellikler: "",
    });
  }
  return daireler;
}

// ── Ana akış ─────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🏗  UNIGARDEN 1. Etap Daire Sıfırlama Ajanı`);
  console.log(`   Hedef: ${BASE_URL}`);
  if (DRY_RUN) console.log("   Mod: DRY-RUN\n");

  // 1. Mevcut etap=1 konutları çek
  const mevcutlar = await api("/api/konutlar");
  const etap1 = mevcutlar.filter((k) => k.etap === 1);
  console.log(`\n📋 Mevcut 1. etap konut: ${etap1.length}`);

  // 2. Sözleşmesi olan ve olmayan olarak ayır
  const sozlesmeli = etap1.filter((k) => k.sozlesmeler && k.sozlesmeler.length > 0);
  const sozlesmesiz = etap1.filter((k) => !k.sozlesmeler || k.sozlesmeler.length === 0);

  if (sozlesmeli.length > 0) {
    console.log(`   ⚠️  ${sozlesmeli.length} konutun aktif sözleşmesi var — önce sözleşmeler siliniyor...`);
    for (const k of sozlesmeli) {
      for (const s of k.sozlesmeler) {
        if (!DRY_RUN) await api(`/api/sozlesmeler/${s.id}`, { method: "DELETE" });
        else console.log(`   [dry] Sözleşme sil: ${s.id}`);
      }
    }
  }

  // 3. Tüm etap=1 konutları sil
  console.log(`\n🗑  ${etap1.length} mevcut daire siliniyor...`);
  let silindi = 0;
  for (const k of etap1) {
    if (!DRY_RUN) {
      await api(`/api/konutlar/${k.id}`, { method: "DELETE" });
    }
    process.stdout.write(".");
    silindi++;
  }
  console.log(` (${silindi})\n`);

  // 4. Yeni daireleri ekle
  const toplamYeni = BLOKLAR.reduce((s, b) => s + b.adet, 0);
  console.log(`➕ ${toplamYeni} yeni daire ekleniyor (${BLOKLAR.length} blok)...\n`);

  let basarili = 0, hata = 0;
  for (const blokDef of BLOKLAR) {
    const daireler = daireListesiOlustur(blokDef);
    process.stdout.write(`▶ ${blokDef.blok} Blok (${blokDef.adet} daire, ${blokDef.tip}, ${blokDef.m2}m²): `);
    for (const d of daireler) {
      try {
        if (!DRY_RUN) {
          await api("/api/konutlar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(d),
          });
        }
        process.stdout.write(".");
        basarili++;
      } catch (err) {
        process.stdout.write("✗");
        console.error(`\n   HATA [${d.daireNo}]: ${err.message}`);
        hata++;
      }
    }
    console.log(` ✓`);
  }

  console.log("\n─────────────────────────────────────────");
  console.log(`✅ Eklendi : ${basarili}`);
  if (hata > 0) console.log(`❌ Hata    : ${hata}`);
  console.log("─────────────────────────────────────────\n");

  if (hata > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Beklenmeyen hata:", err);
  process.exit(1);
});

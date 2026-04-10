/**
 * CSV'deki tüm kiracıları ilgili daire+odaya atar.
 * İdempotent: mevcut kayıtları tekrar eklemez.
 */
const fs = require('fs');
const { createClient } = require('@libsql/client');
const db = createClient({ url: 'file:/Users/canberkugurlu/unigarden.db' });

// ─── CSV Parser ────────────────────────────────────────────────────────────────
function parseLine(line) {
  const cols = [];
  let cur = '', inQ = false;
  for (const c of line) {
    if (c === '"') { inQ = !inQ; }
    else if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
    else cur += c;
  }
  cols.push(cur.trim());
  return cols;
}

// ─── Yardımcılar ───────────────────────────────────────────────────────────────
function parseKira(s) {
  if (!s) return 0;
  const m = s.replace(/\./g, '').replace(',', '.').match(/\d+(\.\d+)?/);
  return m ? Math.round(parseFloat(m[0])) : 0;
}

function parseTarih(s) {
  if (!s) return '2024-09-15';
  const m = s.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
  // Excel serial (e.g. 45550)
  if (/^\d{5}$/.test(s.trim())) {
    const d = new Date(1899, 11, 30);
    d.setDate(d.getDate() + parseInt(s.trim()));
    return d.toISOString().slice(0, 10);
  }
  return '2024-09-15';
}

function cleanPhone(s) {
  if (!s) return null;
  const clean = s.trim().replace(/\s+/g, ' ');
  return clean.length > 2 ? clean.substring(0, 25) : null;
}

function splitName(s) {
  if (!s) return null;
  const parts = s.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return null;
  if (parts.length === 1) return { ad: parts[0], soyad: '-' };
  return { ad: parts.slice(0, -1).join(' '), soyad: parts[parts.length - 1] };
}

function normalizeKapi(s) {
  if (!s) return null;
  return s.trim().replace(/\s*\(.*?\)/g, '').trim();
}

function is1Plus1(s) {
  return /\(1\+[01]\)/.test(s || '');
}

function genId() {
  return 'c' + Math.random().toString(36).slice(2, 14) + Math.random().toString(36).slice(2, 14);
}

// ─── DB İşlemleri ──────────────────────────────────────────────────────────────
async function findOrCreateOgrenci(ad, soyad, telefon, bolum) {
  const tel = cleanPhone(telefon);

  // Önce telefona göre ara
  if (tel && tel.replace(/\D/g,'').length >= 10) {
    const r = await db.execute({ sql: 'SELECT id FROM Ogrenci WHERE telefon = ?', args: [tel] });
    if (r.rows.length) return r.rows[0].id;
  }
  // Ada göre ara
  const r2 = await db.execute({ sql: 'SELECT id FROM Ogrenci WHERE ad = ? AND soyad = ?', args: [ad, soyad] });
  if (r2.rows.length) return r2.rows[0].id;

  const id = genId();
  await db.execute({
    sql: 'INSERT INTO Ogrenci (id, ad, soyad, telefon, bolum, olusturmaTar) VALUES (?,?,?,?,?,CURRENT_TIMESTAMP)',
    args: [id, ad, soyad, tel || '-', bolum || null],
  });
  return id;
}

const konutCache = {};
async function findKonut(blok, kapiNo) {
  const daireNo = `${blok}-${kapiNo}`;
  if (konutCache[daireNo] !== undefined) return konutCache[daireNo];
  const r = await db.execute({ sql: 'SELECT id FROM Konut WHERE daireNo = ?', args: [daireNo] });
  konutCache[daireNo] = r.rows.length ? r.rows[0].id : null;
  return konutCache[daireNo];
}

async function addSozlesme(konutId, ogrenciId, oda, kira, tarihStr) {
  // Çakışma kontrolü
  const c1 = await db.execute({
    sql: 'SELECT id FROM Sozlesme WHERE konutId=? AND ogrenciId=? AND oda=?',
    args: [konutId, ogrenciId, oda],
  });
  if (c1.rows.length) return false;

  const c2 = await db.execute({
    sql: 'SELECT id FROM Sozlesme WHERE konutId=? AND oda=? AND durum=?',
    args: [konutId, oda, 'Aktif'],
  });
  if (c2.rows.length) return false;

  const id   = genId();
  const no   = 'SOZ-' + id.slice(0, 8).toUpperCase();
  const bas  = tarihStr + 'T00:00:00.000Z';
  const bit  = new Date(tarihStr);
  bit.setFullYear(bit.getFullYear() + 1);
  const bitStr = bit.toISOString().slice(0, 10) + 'T00:00:00.000Z';

  await db.execute({
    sql: `INSERT INTO Sozlesme
          (id,sozlesmeNo,konutId,ogrenciId,baslangicTarihi,bitisTarihi,aylikKira,depozito,kiraOdemGunu,durum,oda,imzaTarihi,olusturmaTar)
          VALUES (?,?,?,?,?,?,?,0,1,'Aktif',?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`,
    args: [id, no, konutId, ogrenciId, bas, bitStr, kira, oda],
  });
  await db.execute({ sql: 'UPDATE Konut SET durum=? WHERE id=?', args: ['Dolu', konutId] });
  return true;
}

// ─── Ana İşlem ─────────────────────────────────────────────────────────────────
async function process(blok, kapiNo, oda, name, telefon, bolum, kiraStr, tarihStr) {
  const nm = splitName(name);
  if (!nm) return 'skip:noname';

  const konutId = await findKonut(blok, kapiNo);
  if (!konutId) return `miss:${blok}-${kapiNo}`;

  const kira    = parseKira(kiraStr);
  const tarih   = parseTarih(tarihStr);
  const ogrId   = await findOrCreateOgrenci(nm.ad, nm.soyad, telefon, bolum);
  const added   = await addSozlesme(konutId, ogrId, oda, kira, tarih);
  return added ? `ok:${blok}-${kapiNo} ${oda} — ${nm.ad} ${nm.soyad}` : 'skip:dup';
}

async function main() {
  const raw   = fs.readFileSync('/Users/canberkugurlu/Downloads/2.Etap Veri  - Sayfa1.csv', 'utf-8');
  const lines = raw.split('\n');

  let blok = null, kapiNo = null, odaSay = 0;
  let ok = 0, skip = 0, miss = new Set();

  for (let i = 0; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    const c1 = cols[1] || '', c2 = cols[2] || '';

    // ── Blok başlığı ──
    const blokM = c1.match(/^(A1|A2|A3|B|C|D|E|F|G)\s*(Blok|BLOK)/i);
    if (blokM) { blok = blokM[1].toUpperCase(); kapiNo = null; odaSay = 0; continue; }
    if (!blok) continue;
    if (/^(KAPI NO|KAPICI)/.test(c1)) continue;

    try {
      // ═══════════════════════════════════════════════════════════════════════
      if (['A1','A2','A3','B'].includes(blok)) {
        // col1=kapiNo?, col3=ad, col4=tel, col5=bolum, col9=kira, col11=tarih
        if (c1 && /^\d/.test(c1)) {
          kapiNo = normalizeKapi(c1);
          odaSay = 1;
        } else if (!c1 && cols[3]) {
          odaSay = 2;
        }
        if (!kapiNo) continue;
        const name   = cols[3]; if (!name) continue;
        const oda    = is1Plus1(cols[1] || kapiNo) ? 'Oda 1' : (odaSay === 1 ? 'Oda 1' : 'Oda 2');
        const r = await process(blok, kapiNo, oda, name, cols[4], cols[5], cols[9], cols[11]);
        if (r.startsWith('ok')) { console.log(`  ✓ ${r.slice(3)}`); ok++; }
        else if (r.startsWith('miss')) miss.add(r.slice(5));
        else skip++;

      // ═══════════════════════════════════════════════════════════════════════
      } else if (['C','D','E'].includes(blok)) {
        // col1=kapiNo?, col2=ODA x, col4=ad, col5=tel, col6=bolum, col9=kira, col11=tarih
        if (c1 && /^\d/.test(c1)) kapiNo = normalizeKapi(c1);
        if (!kapiNo) continue;
        let oda = null;
        if (/ODA\s*1/i.test(c2))      oda = 'Oda 1';
        else if (/ODA\s*2/i.test(c2)) oda = 'Oda 2';
        else if (!c2 && cols[4])       oda = 'Oda 2'; // devam satırı
        if (!oda) continue;
        const name = cols[4]; if (!name) continue;
        const r = await process(blok, kapiNo, oda, name, cols[5], cols[6], cols[9], cols[11]);
        if (r.startsWith('ok')) { console.log(`  ✓ ${r.slice(3)}`); ok++; }
        else if (r.startsWith('miss')) miss.add(r.slice(5));
        else skip++;

      // ═══════════════════════════════════════════════════════════════════════
      } else if (blok === 'F') {
        // col1=kapiNo?, col2=ODA x, col3=notes, col4=ad, col5=tel, col9=kira, col11=tarih
        if (c1 && /^\d/.test(c1)) kapiNo = normalizeKapi(c1);
        if (!kapiNo) continue;
        let oda = null;
        if (/ODA\s*1/i.test(c2))      oda = 'Oda 1';
        else if (/ODA\s*2/i.test(c2)) oda = 'Oda 2';
        else if (/^ODA$/i.test(c2))   oda = 'Oda 1'; // 1+0 → tek oda
        if (!oda) continue;
        const name = cols[4]; if (!name) continue;
        const r = await process(blok, kapiNo, oda, name, cols[5], cols[6], cols[9], cols[11]);
        if (r.startsWith('ok')) { console.log(`  ✓ ${r.slice(3)}`); ok++; }
        else if (r.startsWith('miss')) miss.add(r.slice(5));
        else skip++;

      // ═══════════════════════════════════════════════════════════════════════
      } else if (blok === 'G') {
        // col1=kapiNo (aynı daire için 2 satır), col4=ad, col5=tel, col7=fiyat/kira
        if (c1 && /^\d/.test(c1)) {
          const kapi2 = normalizeKapi(c1);
          odaSay = (kapi2 === kapiNo) ? 2 : 1;
          kapiNo = kapi2;
        }
        if (!kapiNo) continue;
        const oda  = is1Plus1(c1) ? 'Oda 1' : (odaSay === 1 ? 'Oda 1' : 'Oda 2');
        const name = cols[4]; if (!name) continue;
        // kira: col2=fiyat listesi bazen, col7=2023 kira bazen
        const kiraStr = cols[2] && /\d/.test(cols[2]) ? cols[2] : cols[7];
        const r = await process(blok, kapiNo, oda, name, cols[5], null, kiraStr, cols[11]);
        if (r.startsWith('ok')) { console.log(`  ✓ ${r.slice(3)}`); ok++; }
        else if (r.startsWith('miss')) miss.add(r.slice(5));
        else skip++;
      }

    } catch (e) {
      console.error(`  ✗ Satır ${i+1}: ${e.message}`);
    }
  }

  console.log(`\n═══════════════════════════════`);
  console.log(`✓ Eklendi   : ${ok}`);
  console.log(`  Atlandı   : ${skip}  (zaten mevcut / oda dolu)`);
  if (miss.size) {
    console.log(`  Konut yok : ${miss.size}`);
    [...miss].sort().forEach(m => console.log(`    – ${m}`));
  }

  // Özet
  const s = await db.execute('SELECT COUNT(*) as c FROM Sozlesme WHERE oda IS NOT NULL');
  console.log(`\nToplam oda-sözleşme: ${s.rows[0].c}`);
  db.close();
}

main().catch(e => { console.error(e.message, e.stack); db.close(); });

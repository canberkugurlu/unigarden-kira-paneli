// Restructure 2nd Etap: merge room pairs (A1-1A-1 + A1-1A-2) into single daire (A1-1A)
// Sozlesme records get oda = "Oda 1" or "Oda 2"

const { createClient } = require('@libsql/client');
const db = createClient({ url: 'file:/Users/canberkugurlu/unigarden.db' });

function genId() {
  return Math.random().toString(36).slice(2, 14) + Math.random().toString(36).slice(2, 14);
}

async function main() {
  // Get all 2nd Etap konut records
  const all = await db.execute("SELECT * FROM Konut WHERE etap = 2 ORDER BY daireNo");
  const rows = all.rows;

  // Group by base daireNo (remove last -1 or -2)
  const groups = new Map();
  for (const row of rows) {
    const base = row.daireNo.replace(/-(\d)$/, '');
    if (!groups.has(base)) groups.set(base, []);
    groups.get(base).push(row);
  }

  let merged = 0, kept = 0;

  for (const [base, rooms] of groups) {
    if (rooms.length === 1) {
      // Only one room - just rename daireNo from "A1-1A-1" to "A1-1A"
      const r = rooms[0];
      const newDaireNo = base; // remove the -1 suffix
      if (r.daireNo !== newDaireNo) {
        // Check if target already exists
        const exists = await db.execute({ sql: 'SELECT id FROM Konut WHERE daireNo = ?', args: [newDaireNo] });
        if (exists.rows.length === 0) {
          await db.execute({ sql: 'UPDATE Konut SET daireNo = ? WHERE id = ?', args: [newDaireNo, r.id] });
          // Mark oda on sozlesme
          await db.execute({ sql: 'UPDATE Sozlesme SET oda = ? WHERE konutId = ?', args: ['Oda 1', r.id] });
        }
      } else {
        await db.execute({ sql: 'UPDATE Sozlesme SET oda = ? WHERE konutId = ? AND (oda IS NULL OR oda = "")', args: ['Oda 1', r.id] });
      }
      kept++;
      continue;
    }

    // Two rooms - sort by oda number
    rooms.sort((a, b) => {
      const aOda = parseInt(a.daireNo.match(/-(\d)$/)?.[1] ?? '1');
      const bOda = parseInt(b.daireNo.match(/-(\d)$/)?.[1] ?? '2');
      return aOda - bOda;
    });

    const [oda1, oda2] = rooms;

    // Check if merged daire already exists
    const existsCheck = await db.execute({ sql: 'SELECT id FROM Konut WHERE daireNo = ?', args: [base] });

    let mergedId;
    if (existsCheck.rows.length > 0) {
      mergedId = existsCheck.rows[0].id;
    } else {
      // Create merged konut using oda1's properties
      mergedId = 'c' + genId();
      const kira = Math.max(Number(oda1.kiraBedeli) || 0, Number(oda2.kiraBedeli) || 0);
      // Extract the part info: A1-1A → blok=A1, daire number from base
      const parts = base.split('-');
      const blok = parts.slice(0, -1).join('-'); // e.g., "A1"
      await db.execute({
        sql: 'INSERT INTO Konut (id, blok, katNo, daireNo, tip, metrekare, kiraBedeli, durum, etap, ozellikler, olusturmaTar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 2, NULL, CURRENT_TIMESTAMP)',
        args: [mergedId, blok, oda1.katNo, base, oda1.tip, oda1.metrekare, kira, oda1.durum]
      });
    }

    // Move Sozlesme records
    await db.execute({ sql: 'UPDATE Sozlesme SET konutId = ?, oda = ? WHERE konutId = ?', args: [mergedId, 'Oda 1', oda1.id] });
    await db.execute({ sql: 'UPDATE Sozlesme SET konutId = ?, oda = ? WHERE konutId = ?', args: [mergedId, 'Oda 2', oda2.id] });

    // Move BakimTalebi references
    await db.execute({ sql: 'UPDATE BakimTalebi SET konutId = ? WHERE konutId = ?', args: [mergedId, oda1.id] });
    await db.execute({ sql: 'UPDATE BakimTalebi SET konutId = ? WHERE konutId = ?', args: [mergedId, oda2.id] });

    // Move Belge references
    await db.execute({ sql: 'UPDATE Belge SET konutId = ? WHERE konutId = ?', args: [mergedId, oda1.id] });
    await db.execute({ sql: 'UPDATE Belge SET konutId = ? WHERE konutId = ?', args: [mergedId, oda2.id] });

    // Update durum if either room is Dolu
    const hasDolu = oda1.durum === 'Dolu' || oda2.durum === 'Dolu';
    if (hasDolu) {
      await db.execute({ sql: 'UPDATE Konut SET durum = ? WHERE id = ?', args: ['Dolu', mergedId] });
    }

    // Delete old room records
    await db.execute({ sql: 'DELETE FROM Konut WHERE id = ?', args: [oda1.id] });
    await db.execute({ sql: 'DELETE FROM Konut WHERE id = ?', args: [oda2.id] });

    merged++;
  }

  // Get final counts
  const konutCount = await db.execute('SELECT COUNT(*) as c FROM Konut WHERE etap = 2');
  const sozCount = await db.execute('SELECT COUNT(*) as c FROM Sozlesme WHERE oda IS NOT NULL');
  console.log(`✓ Birleştirilen çift: ${merged}, Tekil daire: ${kept}`);
  console.log(`✓ 2. Etap Konut sayısı: ${konutCount.rows[0].c}`);
  console.log(`✓ Oda etiketli sözleşme: ${sozCount.rows[0].c}`);

  // Show sample
  const sample = await db.execute('SELECT k.daireNo, s.oda, o.ad, o.soyad, s.aylikKira FROM Konut k LEFT JOIN Sozlesme s ON s.konutId = k.id LEFT JOIN Ogrenci o ON o.id = s.ogrenciId WHERE k.etap = 2 LIMIT 8');
  console.log('\nÖrnek veri:');
  sample.rows.forEach(r => console.log(' ', r.daireNo, '|', r.oda || '-', '|', r.ad || '(boş)', r.soyad || '', '|', r.aylikKira || 0));

  db.close();
}

main().catch(e => { console.error(e.message, e.stack); db.close(); });

// Eksik 2. Etap dairelerini ekler (C, E, F, G blokları)
const { createClient } = require('@libsql/client');
const db = createClient({ url: 'file:/Users/canberkugurlu/unigarden.db' });

function genId() {
  return 'c' + Math.random().toString(36).slice(2, 14) + Math.random().toString(36).slice(2, 14);
}

const BLOK_DEFAULTS = {
  C: { tip: '1+1', metrekare: 35, kiraBedeli: 0 },
  E: { tip: '2+1', metrekare: 20, kiraBedeli: 0 },
  F: { tip: '2+1', metrekare: 20, kiraBedeli: 14000 },
  G: { tip: '2+1', metrekare: 20, kiraBedeli: 15000 },
};

const EKSIK = [
  // C Blok
  ['C', '1C'], ['C', '2B'], ['C', '3B'],
  // E Blok
  ['E', '1B'], ['E', '3C'], ['E', '5C'], ['E', '6C'], ['E', '6D'], ['E', '11B'], ['E', '15A'],
  // F Blok
  ['F', '1C'], ['F', '1E'], ['F', '2C'], ['F', '3C'], ['F', '3D'], ['F', '5C'],
  ['F', '6B'], ['F', '6C'], ['F', '7A'], ['F', '8A'], ['F', '8B'], ['F', '10A'],
  ['F', '10B'], ['F', '11A'], ['F', '14A'], ['F', '17A'], ['F', '20B'], ['F', '22A'],
  // G Blok
  ['G', '3C'], ['G', '4A'], ['G', '4B'], ['G', '4C'], ['G', '5C'], ['G', '6E'],
  ['G', '8A'], ['G', '9A'], ['G', '11A'], ['G', '14A'], ['G', '14B'], ['G', '15A'],
  ['G', '17B'], ['G', '18B'], ['G', '21B'], ['G', '22A'],
];

async function main() {
  let eklendi = 0, atlandı = 0;

  for (const [blok, dairePart] of EKSIK) {
    const daireNo = `${blok}-${dairePart}`;
    const katNo   = parseInt(dairePart, 10) || 1;
    const def     = BLOK_DEFAULTS[blok];

    const exists = await db.execute({ sql: 'SELECT id FROM Konut WHERE daireNo = ?', args: [daireNo] });
    if (exists.rows.length > 0) {
      console.log(`  Zaten var: ${daireNo}`);
      atlandı++;
      continue;
    }

    const id = genId();
    await db.execute({
      sql: `INSERT INTO Konut (id, blok, katNo, daireNo, tip, metrekare, kiraBedeli, durum, etap, olusturmaTar)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Bos', 2, CURRENT_TIMESTAMP)`,
      args: [id, blok, katNo, daireNo, def.tip, def.metrekare, def.kiraBedeli],
    });
    console.log(`  ✓ Eklendi: ${daireNo}`);
    eklendi++;
  }

  const total = await db.execute("SELECT COUNT(*) as c FROM Konut WHERE blok IN ('C','E','F','G') AND etap = 2");
  console.log(`\n✓ Eklendi: ${eklendi}  Atlandı (zaten var): ${atlandı}`);
  console.log(`✓ C/E/F/G toplam daire: ${total.rows[0].c}`);
  db.close();
}

main().catch(e => { console.error(e.message); db.close(); });

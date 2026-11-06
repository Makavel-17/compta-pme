import { describe, expect, it } from 'vitest';
import { crc32, creerZip } from '../src/io/zip';

/** Relit une archive « stockée » : noms et contenus, en vérifiant les CRC. */
function lire(zip: Uint8Array): Map<string, string> {
  const v = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  const fin = zip.length - 22;
  expect(v.getUint32(fin, true)).toBe(0x06054b50);
  const n = v.getUint16(fin + 10, true);
  let p = v.getUint32(fin + 16, true);
  const dec = new TextDecoder();
  const r = new Map<string, string>();
  for (let k = 0; k < n; k++) {
    expect(v.getUint32(p, true)).toBe(0x02014b50);
    const crc = v.getUint32(p + 16, true);
    const taille = v.getUint32(p + 20, true);
    const ln = v.getUint16(p + 28, true);
    const local = v.getUint32(p + 42, true);
    const nom = dec.decode(zip.subarray(p + 46, p + 46 + ln));
    const lnLocal = v.getUint16(local + 26, true);
    const donnees = zip.subarray(local + 30 + lnLocal, local + 30 + lnLocal + taille);
    expect(crc32(donnees)).toBe(crc);
    r.set(nom, dec.decode(donnees));
    p += 46 + ln;
  }
  return r;
}

describe('archive ZIP', () => {
  it('CRC-32 de référence', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
  });
  it('relit les fichiers à l’identique, noms accentués compris', () => {
    const e = new TextEncoder();
    const zip = creerZip([
      { nom: 'Outils_corrigé.txt', donnees: e.encode('Débit 1020 / Crédit 1100') },
      { nom: 'vide.json', donnees: new Uint8Array() },
    ]);
    const r = lire(zip);
    expect([...r.keys()]).toEqual(['Outils_corrigé.txt', 'vide.json']);
    expect(r.get('Outils_corrigé.txt')).toBe('Débit 1020 / Crédit 1100');
    expect(r.get('vide.json')).toBe('');
  });
});

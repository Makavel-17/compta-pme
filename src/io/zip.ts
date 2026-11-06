// Archive ZIP minimale (fichiers stockés sans compression), sans dépendance : pour télécharger un dossier complet
// (PDF et fichiers d'exercice) en une fois. Noms de fichiers en UTF-8.

export interface FichierZip {
  nom: string;
  donnees: Uint8Array;
}

const TABLE_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(d: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < d.length; i++) c = TABLE_CRC[(c ^ d[i]!) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Date et heure au format DOS (champ obligatoire de l'en-tête ZIP). */
function dateDos(d: Date): { heure: number; jour: number } {
  return {
    heure: (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2),
    jour: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  };
}

export function creerZip(fichiers: FichierZip[], maintenant = new Date()): Uint8Array<ArrayBuffer> {
  const enc = new TextEncoder();
  const { heure, jour } = dateDos(maintenant);
  const locaux: Uint8Array[] = [];
  const centraux: Uint8Array[] = [];
  let decalage = 0;
  for (const f of fichiers) {
    const nom = enc.encode(f.nom);
    const crc = crc32(f.donnees);
    const taille = f.donnees.length;
    const local = new Uint8Array(30 + nom.length);
    const vl = new DataView(local.buffer);
    vl.setUint32(0, 0x04034b50, true);
    vl.setUint16(4, 20, true); // version nécessaire
    vl.setUint16(6, 0x0800, true); // noms en UTF-8
    vl.setUint16(8, 0, true); // stocké
    vl.setUint16(10, heure, true);
    vl.setUint16(12, jour, true);
    vl.setUint32(14, crc, true);
    vl.setUint32(18, taille, true);
    vl.setUint32(22, taille, true);
    vl.setUint16(26, nom.length, true);
    local.set(nom, 30);
    locaux.push(local, f.donnees);

    const central = new Uint8Array(46 + nom.length);
    const vc = new DataView(central.buffer);
    vc.setUint32(0, 0x02014b50, true);
    vc.setUint16(4, 20, true);
    vc.setUint16(6, 20, true);
    vc.setUint16(8, 0x0800, true);
    vc.setUint16(10, 0, true);
    vc.setUint16(12, heure, true);
    vc.setUint16(14, jour, true);
    vc.setUint32(16, crc, true);
    vc.setUint32(20, taille, true);
    vc.setUint32(24, taille, true);
    vc.setUint16(28, nom.length, true);
    vc.setUint32(42, decalage, true);
    central.set(nom, 46);
    centraux.push(central);
    decalage += local.length + taille;
  }
  const tailleCentrale = centraux.reduce((s, c) => s + c.length, 0);
  const fin = new Uint8Array(22);
  const vf = new DataView(fin.buffer);
  vf.setUint32(0, 0x06054b50, true);
  vf.setUint16(8, fichiers.length, true);
  vf.setUint16(10, fichiers.length, true);
  vf.setUint32(12, tailleCentrale, true);
  vf.setUint32(16, decalage, true);
  const parties = [...locaux, ...centraux, fin];
  const total = parties.reduce((s, p) => s + p.length, 0);
  const r = new Uint8Array(total);
  let i = 0;
  for (const p of parties) {
    r.set(p, i);
    i += p.length;
  }
  return r;
}

/**
 * Adventní kalendář – recepty z Google tabulky.
 *
 * Vložte do tabulky přes Rozšíření → Apps Script, změňte KOD níže,
 * jednou spusťte funkci „nastavit“ a nasaďte jako webovou aplikaci
 * (Spustit jako: já, Přístup: kdokoli). Postup je v NAVOD-TABULKA.md.
 */

// Kód skupiny – členky ho zadají ve formuláři, bez něj se recept neuloží.
// Přepište ho jen v editoru Apps Script, sem do repozitáře (je veřejný) ho nepište.
const KOD = 'ZMENTE-ME';

const LIST = 'Recepty';
const SLOZKA = 'Adventní kalendář – fotky';
const SLOUPCE = ['Odesláno', 'Schváleno', 'Den', 'Jméno', 'Název', 'Popis', 'Kategorie',
                 'Složení (surovina – množství)', 'Jak na to', 'Tip', 'Fotka autora (ID)', 'Fotka výrobku (ID)'];
const KATEGORIE = ['Kombinace do difuzéru', 'Péče o tělo', 'Doplňky stravy', 'Výrobek do domácnosti', 'Úklidový sprej'];
const MAX_FOTO = 4 * 1024 * 1024;

/** Spusťte jednou ručně: připraví list, zaškrtávátka a složku na fotky. */
function nastavit() {
  if (KOD === 'ZMENTE-ME') throw new Error('Nejdřív nahoře změňte KOD na vlastní kód skupiny.');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(LIST) || ss.insertSheet(LIST);
  sh.getRange(1, 1, 1, SLOUPCE.length).setValues([SLOUPCE]).setFontWeight('bold');
  sh.setFrozenRows(1);
  sh.getRange('B2:B1000').insertCheckboxes();
  // Text se nezalamuje a řádky mají stejnou výšku, celý obsah buňky je vidět v řádku vzorců
  sh.getRange('A:L').setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
  sh.setRowHeightsForced(2, sh.getMaxRows() - 1, 21);
  slozka();
}

function slozka() {
  const p = PropertiesService.getScriptProperties();
  const id = p.getProperty('slozka');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  const f = DriveApp.createFolder(SLOZKA);
  p.setProperty('slozka', f.getId());
  return f;
}

function vystup(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// Text do buňky: oříznout a zabránit tomu, aby se z textu stal vzorec.
function text(v, max) {
  v = String(v == null ? '' : v).replace(/\r/g, '').trim().slice(0, max);
  return /^[=+\-@\t]/.test(v) ? "'" + v : v;
}

function ulozFoto(data, nazev) {
  if (!data) return '';
  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(data));
  if (!m) throw new Error('foto');
  const bajty = Utilities.base64Decode(m[2]);
  if (bajty.length > MAX_FOTO) throw new Error('foto');
  const soubor = slozka().createFile(Utilities.newBlob(bajty, 'image/' + m[1], nazev.slice(0, 80) + '.' + (m[1] === 'jpeg' ? 'jpg' : m[1])));
  soubor.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return soubor.getId();
}

/** Formulář posílá nový recept. */
function doPost(e) {
  const zamek = LockService.getScriptLock();
  zamek.waitLock(20000);
  try {
    if (!KOD || KOD === 'ZMENTE-ME') return vystup({ ok: false, chyba: 'server' });
    const d = JSON.parse(e.postData.contents);
    if (String(d.kod || '').trim().toLowerCase() !== KOD.toLowerCase()) return vystup({ ok: false, chyba: 'kod' });
    const kategorie = KATEGORIE.indexOf(d.kategorie) >= 0 ? d.kategorie : KATEGORIE[0];
    const difuzer = kategorie === KATEGORIE[0];
    // Řádek složení „Surovina – množství“. U difuzéru je množství počet kapek 1–20.
    const cisti = (v, max) => String(v == null ? '' : v).replace(/[\r\n\t–]/g, ' ').replace(/^[\s=+\-@']+/, '').replace(/\s+/g, ' ').trim().slice(0, max);
    const slozeni = Array.isArray(d.slozeni) ? d.slozeni.slice(0, 10).map(r => {
      const nazev = cisti(r && r.nazev, 80);
      let mnozstvi = cisti(r && r.mnozstvi, 30);
      if (difuzer) mnozstvi = String(Math.max(1, Math.min(20, parseInt(mnozstvi, 10) || 1)));
      return nazev ? nazev + (mnozstvi ? ' – ' + mnozstvi : '') : '';
    }).filter(String) : [];
    if (!d.jmeno || !d.nazev || !slozeni.length) return vystup({ ok: false, chyba: 'pole' });
    let fotoAutor, fotoSmes;
    try {
      fotoAutor = ulozFoto(d.fotoAutor, 'autor ' + d.jmeno);
      fotoSmes = ulozFoto(d.fotoSmes, 'smes ' + d.nazev);
    } catch (err) { return vystup({ ok: false, chyba: 'foto' }); }
    const den = parseInt(d.den, 10);
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LIST);
    // První volný řádek podle sloupce A (zaškrtávátka ve sloupci B se nepočítají)
    const radek = sh.getRange('A:A').getValues().findIndex((r, i) => i > 0 && r[0] === '') + 1 || sh.getMaxRows() + 1;
    sh.getRange(radek, 1, 1, SLOUPCE.length).setValues([[new Date(), false, den >= 1 && den <= 24 ? den : '',
      text(d.jmeno, 60), text(d.nazev, 60), text(d.nalada, 120), kategorie,
      slozeni.join('\n'), text(d.postup, 600), text(d.tip, 600), fotoAutor, fotoSmes]]);
    sh.getRange(radek, 2).insertCheckboxes();
    return vystup({ ok: true });
  } catch (err) {
    return vystup({ ok: false, chyba: 'server' });
  } finally {
    zamek.releaseLock();
  }
}

/** Kalendář si stahuje jen schválené recepty s vyplněným dnem. */
function doGet() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LIST);
  const radky = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, SLOUPCE.length).getValues() : [];
  const recepty = radky
    .filter(r => r[1] === true && r[2] >= 1 && r[2] <= 24)
    .map(r => ({ den: Number(r[2]), jmeno: String(r[3]), nazev: String(r[4]), nalada: String(r[5]),
                 kategorie: String(r[6]), slozeni: String(r[7]), postup: String(r[8]), tip: String(r[9]),
                 fotoAutor: String(r[10]), fotoSmes: String(r[11]) }));
  return vystup({ recepty });
}

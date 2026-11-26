# Recepty přes Google tabulku – nastavení

Členky vyplní recept na stránce **https://lucasgajza.github.io/adventni-okenka/pridat.html**.
Recept se uloží do Google tabulky, fotky do složky na Google Disku. V kalendáři se ukáže
až po vašem schválení. Nastavení je jednorázové, asi na 10 minut.

## 1. Tabulka a skript

1. Otevřete https://sheets.new a tabulku pojmenujte třeba **Adventní kalendář – recepty**.
2. V menu zvolte **Rozšíření → Apps Script**.
3. Smažte, co v editoru je, a vložte celý obsah souboru `google/recepty.gs`.
4. Na řádku `const KOD = 'ZMENTE-ME';` přepište `ZMENTE-ME` na kód skupiny, třeba `vanoce-oil-26`.
   Kód pošlete holkám do skupiny, bez něj formulář recept neuloží. Na velikosti písmen nezáleží.
5. Uložte (ikona diskety).

## 2. První spuštění

1. Nahoře v liště vyberte funkci **nastavit** a klikněte na **Spustit**.
2. Google se zeptá na oprávnění: **Zkontrolovat oprávnění** → váš účet →
   **Rozšířené → Přejít na projekt (nebezpečné)** → **Povolit**.
   Hláška „nebezpečné“ je běžná u každého vlastního skriptu, který Google neověřoval.
3. V tabulce vznikne list **Recepty** s hlavičkou a na Disku složka **Adventní kalendář – fotky**.

## 3. Zveřejnění formuláře

1. Vpravo nahoře **Nasadit → Nové nasazení**.
2. U „Vyberte typ“ (ozubené kolečko) zvolte **Webová aplikace**.
3. Nastavte **Spustit jako: Já** a **Kdo má přístup: Kdokoli**.
4. Klikněte na **Nasadit** a zkopírujte **Adresu URL webové aplikace** (končí na `/exec`).
5. Adresu pošlete Claudovi. Vloží ji do `tipy.js` (`window.RECEPTY_URL`) a nasadí.

## 4. Schvalování receptů

Každý odeslaný recept přibude jako nový řádek.

- Zaškrtněte **Schváleno** a vyplňte **Den** (1–24). Bez obojího se recept v kalendáři neukáže.
- Recept od členky na daný den nahradí výchozí recept z kalendáře.
- Text můžete v tabulce rovnou opravit. Složení nechte ve tvaru `Surovina – množství`, každá surovina na nový řádek.
  U kategorie **Kombinace do difuzéru** je množství počet kapek (`Levandule (Lavender) – 4`), u ostatních
  volný text (`Kokosový olej – 10 ml`). Oleje pojmenované jako v e-shopu dostanou v kalendáři fotku lahvičky.
- **Kategorie** je jedna z: Kombinace do difuzéru, Péče o tělo, Doplňky stravy, Výrobek do domácnosti, Úklidový sprej.
  U difuzéru kalendář ukáže lahvičky olejů, u ostatních fotku výrobku.
- Fotky jsou na Disku. V tabulce je jen jejich ID, nemažte ho.
- Když recept nechcete, nechte ho nezaškrtnutý nebo řádek smažte.

Změny v tabulce se v kalendáři projeví hned po obnovení stránky.

## Když něco změníte ve skriptu

Po úpravě `recepty.gs` dejte **Nasadit → Spravovat nasazení → tužka → Verze: Nová verze → Nasadit**.
Adresa zůstane stejná.

# Standalone JSX scripts

For users who prefer **File → Scripts** instead of the CEP panel, the same export/import workflow is available as a **single `.jsx` file** — no extension install required.

## Free demo (this repository)

| File | Description |
|------|-------------|
| [`binary/ILL-EXP-IMP_demo.jsx`](binary/ILL-EXP-IMP_demo.jsx) | Demo standalone script (compiled). Same UI as the panel: XML, XLIFF, batch export/import, About, Help. **Limits:** first 5 text frames per document, first 5 files per batch job. |

### How to run

1. Download [`ILL-EXP-IMP_demo.jsx`](binary/ILL-EXP-IMP_demo.jsx).
2. In Illustrator: **File → Scripts → Other Script…** and select the file.  
   Or copy it into your Illustrator **Scripts** folder for a permanent menu entry.
3. Use the dialog — sections match the CEP panel (**EXPORT TO…**, **IMPORT FROM…**, **ABOUT**).

No other files are needed: About, Help, and BCP47 language lists are embedded in the script.

## Full standalone version ($100)

The **full** standalone script (unlimited frames and batch files) is available **on request** after purchase — **one file**, same features as the CEP panel, **same price ($100)** as the Exchange / PayPal full build.

| Purchase | Delivery |
|----------|----------|
| [Adobe Exchange — Plugin 205341](https://exchange.adobe.com/apps/cc/205341) | Contact [sinozemez@gmail.com](mailto:sinozemez@gmail.com) for the full `.jsx` file |
| [PayPal — $100](../../../docs/purchase.html) | Full `.zxp` by email; **full standalone `.jsx` on request** |

Mention **“standalone JSX”** in your message if you do not need the CEP panel.

---

## Русский

**Демо:** файл [`binary/ILL-EXP-IMP_demo.jsx`](binary/ILL-EXP-IMP_demo.jsx) — один файл, без установки CEP. Ограничения как у демо-панели: 5 фреймов, 5 файлов в batch.

**Полная версия:** после оплаты ($100, та же цена) по запросу высылается **полный standalone-скрипт одним файлом** — без лимитов. Напишите на [sinozemez@gmail.com](mailto:sinozemez@gmail.com).

---

*Developer note: readable source for the full standalone build is kept locally under `native/` (not published). Rebuild with `assets/jsx/_build_standalone.py`.*

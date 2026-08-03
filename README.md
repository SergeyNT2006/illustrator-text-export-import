# Export-Import text for Illustrator

**Version 5.5** · CEP panel for Adobe Illustrator · Adobe Exchange Plugin ID **205341**

Export text from Illustrator layouts to **XML** or **XLIFF 1.2**, translate in your editor or CAT tool, then import back with paragraph formatting, fonts, and colors restored.

---

## What it does

The panel adds a translation-friendly bridge between Illustrator and standard localization formats. You keep the same document structure: text frames, paragraphs, and styling are written to the export file and applied again on import.

**Main capabilities**

- Export / import **XML** for direct roundtrip workflows  
- Export / import **XLIFF 1.2** for professional CAT tools  
- **Batch** export and import for folders of `.ai`, `.eps`, and `.svg`  
- **BCP47 language lists** for XLIFF (full list and favorites)  
- Preserves alignment, indents, tab stops, fonts (by internal ID), and **CMYK** color values  

---

## Usage strategies

### 1. Single document — XML roundtrip

Best when you translate one layout at a time in a text editor or simple workflow.

1. Open the Illustrator file.  
2. **EXPORT TO… → XML…** — save `DocumentName_to_translate.xml`.  
3. Translate the `<target>` content (keep tags and paragraph structure).  
4. **IMPORT FROM… → XML…** — choose the translated file.  
5. Save the updated `.ai` file.

**Tip:** Do not rename or remove text frames between export and import.

---

### 2. Single document — XLIFF and CAT tools

Best for memoQ, Trados, Smartcat, Phrase, and other XLIFF-based tools.

1. Open the document in Illustrator.  
2. **EXPORT TO… → XLIFF…** — pick source and target language (BCP47).  
3. Translate in your CAT tool.  
4. **IMPORT FROM… → XLIFF…** — apply translation to the same document.  
5. Review layout and save.

**Tip:** Use the favorite language list for pairs you use often. Default language pair on cancel: **en → de**.

---

### 3. Batch — many files, one language

Best for packaging, manuals, or a set of illustrations in one target language.

**Export**

1. **EXPORT TO… → BATCH…**  
2. Select a folder with `.ai`, `.eps`, or `.svg` files.  
3. One combined XML is created (e.g. `FolderName_to_translate.xml`).

**Import**

1. Translate the batch XML.  
2. **IMPORT FROM… → BATCH…**  
3. Select the translated XML and choose the output language suffix (e.g. `_de`).  
4. New files are saved with the suffix; originals are not overwritten.

**Tip:** Keep folder structure and file names stable between batch export and import.

---

## Getting started

### Requirements

- Adobe Illustrator **CS6 (17.0) through 2026+**  
- Windows or macOS  

### Install the panel

1. Install the **.zxp** package (Adobe Exchange, purchase email, or [GitHub demo release](https://github.com/SergeyNT2006/illustrator-text-export-import/releases/latest)).  
2. Restart Illustrator.  
3. Open **Window → Extensions → Export-Import text for Illustrator**.  

Use **ABOUT** and **HELP** in the panel for version info and detailed tips.

### Demo vs full version

| | Demo (free) | Full ($45) |
|---|:--:|:--:|
| XML / XLIFF / batch UI | ✓ | ✓ |
| Text frames per document | 5 | Unlimited |
| Files per batch job | 5 | Unlimited |
| Commercial use | Evaluation | Licensed |

**Full version:** [Adobe Exchange — Plugin 205341](https://exchange.adobe.com/apps/cc/205341)

---

## Good practices

- **Back up** `.ai` files before batch import.  
- **Do not edit** frame IDs or paragraph structure in XML/XLIFF unless you know the format.  
- **Install fonts** used in the layout on the machine where you import.  
- **RGB fills** are stored as CMYK in export files; this is normal for roundtrip consistency.  
- For locked layers, the extension temporarily unlocks them during export/import, then restores locks.

---

## Support

**Email:** sinozemez@gmail.com  

**Product page:** https://sergeynt2006.github.io/illustrator-text-export-import/

---

*© 2018–2026 Sergey A. Inozemtsev. Proprietary software.*

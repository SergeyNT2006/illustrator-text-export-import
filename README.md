# Illustrator Text Export and Import

CEP panel for **Adobe Illustrator** — export document text to **XML** or **XLIFF 1.2**, translate in your CAT tool, import back with formatting, fonts, and colors restored.

**Version:** 5.5.0 · **Adobe Plugin ID:** 205341 · **Author:** Sergey A. Inozemtsev · **Contact:** [sinozemez@gmail.com](mailto:sinozemez@gmail.com)

---

## Product site

| | |
|---|---|
| **Home & overview** | [docs/index.html](docs/index.html) |
| **Usage guide** | [docs/usage.html](docs/usage.html) |
| **Purchase ($100 USD)** | [Adobe Exchange (205341)](https://exchange.adobe.com/creativecloud.details.205341.html) · [docs/buy.html](docs/buy.html) |
| **Free demo (.zxp)** | [GitHub Releases](https://github.com/SergeyNT2006/illustrator-text-export-import/releases) |
| **GitHub setup** | [GITHUB_SETUP.md](GITHUB_SETUP.md) |
| **Demo ZXP (local)** | `packaging/Illustrator_Export_Import_text_demo.zxp` |

---

## Features

- Export / import **XML** and **XLIFF 1.2** from the active Illustrator document
- **Batch** export & import for folders of `.ai`, `.eps`, `.svg`
- BCP47 language lists for XLIFF (full list + favorites)
- Paragraph formatting: alignment, indents, tab stops, fonts, CMYK colors
- Illustrator **CS6 (17.0) through 2026+ (v31.x)** · Windows & macOS

---

## Demo vs full license

| | Demo (free) | Full ($100) |
|---|:--:|:--:|
| XML / XLIFF / batch UI | ✓ | ✓ |
| Frames per document | 5 | Unlimited |
| Files per batch job | 5 | Unlimited |
| Commercial use | Evaluation | Licensed |

Download the demo from **[Releases](https://github.com/SergeyNT2006/illustrator-text-export-import/releases)**.  
Purchase the full version on **[Adobe Exchange (Plugin ID 205341)](https://exchange.adobe.com/creativecloud.details.205341.html)** or the **[direct buy page](docs/buy.html)**.

---

## Quick install (demo or full)

1. Download the `.zxp` from Releases (demo) or your purchase email (full).
2. Install with Extension Manager / ExManCmd / Creative Cloud install flow.
3. Restart Illustrator.
4. Open **Window → Extensions → Text Export and Import** (demo: **… (Demo)**).

Detailed steps: **[docs/usage.html](docs/usage.html)**

---

## Repository layout

```
docs/                                          Public site (GitHub Pages)
releases/                                      Release notes for GitHub
packaging/demo/                                Source tree for demo ZXP
packaging/production/                          Source tree for full ZXP (local only)
packaging/Illustrator_Export_Import_text_demo.zxp   Demo build (attach to Release)
packaging/Populate-ZxpSourceFolders.ps1        Regenerate demo/ and production/
assets/jsx/func_demo/                          Demo logic source
CSXS/manifest.xml                              CEP manifest
```

Full ZXP (`Illustrator_Export_Import_text_full.zxp`) and `func_bin` are **not** published on GitHub — only on Adobe Exchange (Plugin ID **205341**).

---

## Build ZXP (maintainers)

See **[packaging/README.md](packaging/README.md)** and **[GITHUB_SETUP.md](GITHUB_SETUP.md)**.

---

## Support

Email **[sinozemez@gmail.com](mailto:sinozemez@gmail.com)** with Illustrator version, OS, and steps to reproduce.

---

## License

Proprietary. Demo is free for evaluation. Full version requires a paid license. See [LICENSE](LICENSE).

Technical developer notes: [DEVELOPER.md](DEVELOPER.md)

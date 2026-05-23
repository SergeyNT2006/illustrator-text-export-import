# Illustrator Text Export and Import

CEP panel for **Adobe Illustrator** — export document text to **XML** or **XLIFF 1.2**, translate in your CAT tool, import back with formatting, fonts, and colors restored.

**Version:** 5.5.0 · **Author:** Sergey A. Inozemtsev · **Contact:** [sinozemez@gmail.com](mailto:sinozemez@gmail.com)

---

## Product site

| | |
|---|---|
| **Home & overview** | [docs/index.html](docs/index.html) → enable [GitHub Pages](GITHUB_SETUP.md) |
| **Usage guide** | [docs/usage.html](docs/usage.html) |
| **Purchase ($100 USD)** | [docs/buy.html](docs/buy.html) |
| **Free demo (.zxp)** | [GitHub Releases](https://github.com/SergeyNT2006/illustrator-text-export-import/releases) |

---

## Features

- Export / import **XML** and **XLIFF 1.2** from the active Illustrator document
- **Batch** export & import for folders of `.ai`, `.eps`, `.svg`
- BCP47 language lists for XLIFF (full list + favorites)
- Paragraph formatting: alignment, indents, tab stops, fonts, CMYK colors
- Illustrator **CS6 (17.0) through 2026 (30.x)** · Windows & macOS

---

## Demo vs full license

| | Demo (free) | Full ($100) |
|---|:--:|:--:|
| XML / XLIFF / batch UI | ✓ | ✓ |
| Frames per document | 5 | Unlimited |
| Files per batch job | 5 | Unlimited |
| Commercial use | Evaluation | Licensed |

Download the demo from **[Releases](https://github.com/SergeyNT2006/illustrator-text-export-import/releases)**.  
Purchase the full signed ZXP on the **[buy page](docs/buy.html)**.

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
docs/                 Public site (GitHub Pages)
releases/             Release notes & demo ZXP upload instructions
packaging/            Build scripts (demo / full ZXP)
assets/jsx/func_demo/ Demo logic (5-frame / 5-file limits)
CSXS/manifest.xml     CEP manifest
index.html            Panel UI
```

Full commercial JSX builds (`func_bin`) and developer sources are **not** published in this repository.

---

## Build ZXP (maintainers)

Requires **ZXPSignCmd** and a code-signing `.p12`.

```powershell
cd packaging

# Public demo for GitHub Releases
.\Build-Zxp.ps1 -Demo -CertificatePath "D:\path\to\cert.p12" -CertificatePassword "..."

# Full commercial build (not for public repo)
.\Build-Zxp.ps1 -Release -CertificatePath "D:\path\to\cert.p12" -CertificatePassword "..."
```

See also `packaging/ZXP_BUILD.md` and `packaging/ADOBE_EXCHANGE.md`.

---

## Support

Email **[sinozemez@gmail.com](mailto:sinozemez@gmail.com)** with Illustrator version, OS, and steps to reproduce.

---

## License

Proprietary. Demo is free for evaluation. Full version requires a paid license. See [LICENSE](LICENSE).

Technical developer notes: [DEVELOPER.md](DEVELOPER.md)

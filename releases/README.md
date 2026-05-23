# GitHub Releases — Demo ZXP

## Файл для загрузки

Прикрепите к release **только demo**:

```text
packaging/Illustrator_Export_Import_text_demo.zxp
```

Полная версия (`Illustrator_Export_Import_text_full.zxp`) **не загружается** на GitHub — только в Adobe Exchange (Plugin ID **205341**).

---

## Release v5.5.0-demo

| Поле | Значение |
|------|----------|
| Tag | `v5.5.0-demo` |
| Title | Demo 5.5.0 |
| Asset | `Illustrator_Export_Import_text_demo.zxp` |

### Release notes (copy-paste)

```markdown
## Illustrator Text Export and Import — Demo 5.5.0

Free evaluation build for Adobe Illustrator.

**Limits:** first 5 text frames per document, first 5 files per batch job.

### Install
1. Download `Illustrator_Export_Import_text_demo.zxp`
2. Install with Extension Manager / ExManCmd / Creative Cloud
3. Restart Illustrator
4. Open **Window → Extensions → Text Export and Import (Demo)**

### Full version ($100)
- [Adobe Exchange — Plugin ID 205341](https://exchange.adobe.com/creativecloud.details.205341.html)
- [Product site / buy page](https://sinozemez.github.io/illustrator-text-export-import/buy.html)

Support: sinozemez@gmail.com
```

---

## Пересборка demo (при обновлении)

```powershell
cd "D:\__Adobe_developers site\001_Illustrator_Text_Export_Import\packaging"
.\Populate-ZxpSourceFolders.ps1
ZXPSignCmd -sign ".\demo" ".\Illustrator_Export_Import_text_demo.zxp" "D:\path\to\cert.p12" "password"
```

Затем создайте новый Release (например `v5.5.1-demo`).

# GitHub repository — план публикации

**Продукт:** Illustrator Text Export and Import v5.5.0  
**Adobe Plugin ID:** 205341  
**Exchange:** https://exchange.adobe.com/creativecloud.details.205341.html

---

## Что уже готово локально

| Артефакт | Путь |
|----------|------|
| Demo ZXP | `packaging/Illustrator_Export_Import_text_demo.zxp` |
| Full ZXP | `packaging/Illustrator_Export_Import_text_full.zxp` |
| Исходники demo | `packaging/demo/` |
| Исходники production | `packaging/production/` |
| Сайт (Pages) | `docs/` |
| Документация | `README.md`, `releases/` |

---

## Что попадает в GitHub, а что нет

| В репозиторий (git push) | Не в репозиторий |
|--------------------------|------------------|
| `docs/`, `README.md`, `LICENSE` | `*.zxp` (оба файла) |
| `assets/jsx/func_demo/` (исходник demo) | `packaging/production/` (func_bin) |
| `packaging/Populate-ZxpSourceFolders.ps1` | `assets/jsx/func_bin/`, `functions/` |
| `packaging/README.md`, `PRODUCT.json` | `packaging/demo/` (генерируется скриптом) |
| Панель UI, manifest, components | Сертификат `.p12` |

**Full ZXP** загружается только в **Adobe Developer Distribution** (листинг 205341).  
**Demo ZXP** прикрепляется к **GitHub Release** (не коммитить в git).

---

## Шаг 1. Создать репозиторий на GitHub

1. [github.com/new](https://github.com/new)
2. Name: **`illustrator-text-export-import`**
3. Description: `CEP panel for Adobe Illustrator — export/import text to XML and XLIFF`
4. **Public**
5. Без README / .gitignore (уже в проекте)
6. Create repository

---

**Репозиторий:** https://github.com/SergeyNT2006/illustrator-text-export-import

---

## Шаг 2. Push кода

```powershell
cd "D:\__Adobe_developers site\001_Illustrator_Text_Export_Import"
git add -A
git commit -m "Point docs and links to SergeyNT2006 GitHub repo."
git branch -M main
git remote add origin https://github.com/SergeyNT2006/illustrator-text-export-import.git
git push -u origin main
```

Если `origin` уже есть:

```powershell
git remote set-url origin https://github.com/SergeyNT2006/illustrator-text-export-import.git
git push -u origin main
```

---

## Шаг 3. GitHub Pages

1. Repository → **Settings** → **Pages**
2. Source: branch **`main`**, folder **`/docs`**
3. Save

URL сайта:

```text
https://sergeynt2006.github.io/illustrator-text-export-import/
```

Обновите `YOUR_GITHUB_USERNAME` в `docs/assets/product-config.js` при необходимости.

---

## Шаг 4. GitHub Release (demo ZXP)

1. Repository → **Releases** → **Draft a new release**
2. **Tag:** `v5.5.0-demo`
3. **Title:** `Demo 5.5.0`
4. **Attach file:**  
   `D:\__Adobe_developers site\001_Illustrator_Text_Export_Import\packaging\Illustrator_Export_Import_text_demo.zxp`
5. Текст release — см. [releases/README.md](releases/README.md)
6. **Publish release**

После публикации ссылка «Download demo» в README ведёт на Releases.

---

## Шаг 5. Adobe Exchange (full ZXP)

1. [developer.adobe.com](https://developer.adobe.com/) → **Distribute** → листинг **205341**
2. Загрузить: `packaging/Illustrator_Export_Import_text_full.zxp`
3. Price: **$100 USD**
4. Where to find: **Window → Extensions → Text Export and Import**

---

## Шаг 6. Оплата $100 (опционально)

В `docs/buy.html` — ссылка на Exchange уже основная. Для прямой оплаты добавьте `directPaymentUrl` в `docs/assets/product-config.js`.

---

## Чеклист перед push

- [ ] В git нет `*.zxp`
- [ ] В git нет `packaging/production/`
- [ ] Demo ZXP готов для Release (файл локально в `packaging/`)
- [ ] Full ZXP готов для Exchange (не на GitHub)
- [ ] Username в `docs/assets/product-config.js` и ссылках совпадает с GitHub

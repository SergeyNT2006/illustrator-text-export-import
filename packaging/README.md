# Packaging — ZXP для demo и production

## Готовые файлы (локально)

| Файл | Назначение | Публиковать на GitHub |
|------|------------|------------------------|
| `Illustrator_Export_Import_text_demo.zxp` | Demo (5 фреймов / 5 файлов) | **Да** — GitHub Releases |
| `Illustrator_Export_Import_text_full.zxp` | Полная версия ($100) | **Нет** — только Adobe Exchange (Plugin ID **205341**) |

## Исходники для пересборки

| Папка | Содержимое |
|-------|------------|
| `demo/` | UI + `assets/jsx/func_demo` |
| `production/` | UI + `assets/jsx/func_bin` |

Обновить папки из корня проекта:

```powershell
cd "D:\__Adobe_developers site\001_Illustrator_Text_Export_Import\packaging"
.\Populate-ZxpSourceFolders.ps1
```

Подпись:

```powershell
ZXPSignCmd -sign ".\demo" ".\Illustrator_Export_Import_text_demo.zxp" "D:\path\to\cert.p12" "password"
ZXPSignCmd -sign ".\production" ".\Illustrator_Export_Import_text_full.zxp" "D:\path\to\cert.p12" "password"
```

Публикация: см. **[GITHUB_SETUP.md](../GITHUB_SETUP.md)** и **[releases/README.md](../releases/README.md)**.

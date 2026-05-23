# Сборка ZXP для публикации (CEP / Illustrator Text Export and Import)

Кратко: **ZXP** — это подписанный архив расширения. Для установки через **Adobe Exchange** или **Extension Manager** нужна **подпись** сертификатом (`.p12` / `.pfx`).

---

## 1. Что должно попасть в пакет

Минимально — всё, что нужно панели в Illustrator:

- `CSXS/manifest.xml`
- `index.html`, `mimetype`
- `assets/` (включая `jsx/functions`, `jsx/func_bin`, `jsx/func_demo`, `help`, `js`, `css`, `img`, …)
- `components/`
- `assets/jsx/hostscript.jsx`

Опционально в пакет можно положить `readme.md` для пользователя.

---

## 2. Что обычно **не** кладут в ZXP

| Путь / файл | Зачем исключать |
|-------------|-----------------|
| `.debug` | Только для отладки CEP в Chrome; в релизе не нужен |
| `dev_docs/` | Внутренняя документация разработчика |
| `to-do.md` | Внутренние заметки |
| `packaging/` | Скрипты сборки и staging (сам этот каталог) |
| `*.bak` | Резервные копии |
| Папки вида `_functions`, `_func_bin` | Если используете только для ручных тестов режимов — не включать в публикацию |

Папки **`functions`**, **`func_bin`**, **`func_demo`** без подчёркивания — **включайте**, если они должны быть у конечного пользователя (полная / bin / demo логика).

---

## 3. Подготовка staging (чистая копия)

Из каталога `packaging` в PowerShell:

```powershell
cd "d:\__Adobe_developers site\001_Illustrator_Text_Export_Import\packaging"
.\Copy-StagingForZxp.ps1
```

Для **Adobe Exchange** (только обфусцированный `func_bin`, без исходников `functions` / `func_demo`):

```powershell
.\Copy-StagingForZxp.ps1 -Release
```

Скрипт создаёт папку `packaging\staging_Illustrator_Text_Export_Import\`. Дальше подписываете эту папку через **ZXPSignCmd** или одной командой:

```powershell
.\Build-Zxp.ps1 -Release
```

Полный чеклист Exchange: **`packaging/ADOBE_EXCHANGE.md`**.

---

## 4. Инструмент: ZXPSignCmd (Adobe)

1. Скачайте **Adobe Exchange Packager** / **ZXPSignCmd** с [Adobe-CEP/CEP-Resources](https://github.com/Adobe-CEP/CEP-Resources) (версия под вашу ОС).  
   На этой машине уже есть: `D:\_Project\CEP-Resources-master\CEP-Resources-master\ZXPSignCMD\4.1.103\win64\ZXPSignCmd.exe`
2. Получите **сертификат для подписи** (Code Signing или сертификат, допустимый для распространения через Adobe; для внутреннего теста часто используют self-signed `.p12` — правила Exchange могут отличаться).

Типовой вызов (проверьте синтаксис в документации к вашей версии ZXPSignCmd):

```text
ZXPSignCmd -sign "<путь_к_staging_Illustrator_Text_Export_Import>" "<путь_к_выходу>\Illustrator_Text_Export_Import_5.5.zxp" "<путь>\certificate.p12" "<пароль>"
```

- Первый аргумент — **папка расширения** (внутри неё должны лежать `CSXS`, `index.html`, и т.д.).
- На выходе — один файл `.zxp`.

Если команда в вашей версии отличается, ориентируйтесь на `ZXPSignCmd -help` / PDF из комплекта Adobe.

---

## 5. Проверка перед выкладкой

1. Установить `.zxp` через **Adobe Exchange** / **Manage Extensions** / двойной клик (как принято в вашей среде).
2. Запустить Illustrator, открыть **Window → Extensions → Text Export and Import**.
3. Проверить строку режима **Mode(native)** / **Mode(bin)** / **Demo mode** в зависимости от того, какие папки положили в пакет.
4. Быстрый smoke: XML export → import на тестовом файле.

---

## 6. Версионирование

Перед сборкой синхронизируйте:

- `CSXS/manifest.xml` — `ExtensionBundleVersion`, `Version` у `<Extension>`
- При необходимости — строки версии в `assets/jsx/hostscript.jsx` / `_shared.jsx` / `readme.md` (как у вас принято в проекте)

---

## 7. Полезные ссылки (обновляйте при смене политики Adobe)

- Документация CEP / упаковка: репозиторий [Adobe-CEP/CEP-Resources](https://github.com/Adobe-CEP/CEP-Resources) и разделы про signing / manifest.

Если нужна установка **без** подписи (только для себя/теста): по-прежнему можно копировать распакованную папку в `CEP\extensions` с включённым `PlayerDebugMode` — это не ZXP, а «распакованное» расширение.

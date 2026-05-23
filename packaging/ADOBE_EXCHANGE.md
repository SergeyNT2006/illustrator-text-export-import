# Публикация на Adobe Exchange (Developer Distribution)

Расширение: **Illustrator Text Export and Import**  
Версия: **5.5.0**  
Bundle ID: `Illustrator_Text_Export_Import_5.5`

---

## Быстрый старт (сборка ZXP)

### 1. Релизный staging (только `func_bin`, без исходников)

```powershell
cd "d:\__Adobe_developers site\001_Illustrator_Text_Export_Import\packaging"
.\Build-Zxp.ps1 -Release
```

Если сертификата ещё нет — сначала тестовый (только для локальной проверки):

```powershell
.\Build-Zxp.ps1 -CreateSelfSignedTestCert -Release
```

Продакшен-сборка с вашим `.p12`:

```powershell
.\Build-Zxp.ps1 -Release -CertificatePath "D:\certs\exchange-signing.p12" -CertificatePassword "YOUR_PASSWORD"
```

На выходе: `packaging\Illustrator_Text_Export_Import_5.5.0_release.zxp`

### 2. Локальная проверка перед загрузкой

1. Установить `.zxp` (Anastasiy Extension Manager, ExManCmd или двойной клик — как принято у вас).
2. Illustrator → **Window → Extensions → Text Export and Import**.
3. В футере панели должно быть **Mode(bin)** (не native/demo).
4. Smoke-тест: Export XML → Import XML на тестовом `.ai`.

---

## Чеклист перед отправкой в Exchange

### Пакет (ZXP)

- [ ] Собран с `-Release` (в пакете только `assets/jsx/func_bin`, без `functions` и `func_demo`)
- [ ] Нет `.debug`, `dev_docs/`, `to-do.md`, `packaging/`, `*.bak`
- [ ] Есть `CSXS/manifest.xml`, `index.html`, `mimetype` (создаётся при подписи)
- [ ] `ExtensionBundleVersion` и `Version` = **5.5.0**
- [ ] `ExtensionBundleId` = `Illustrator_Text_Export_Import_5.5`
- [ ] Host: Illustrator `ILST` `[17.0,30.0]` (CS6–2026)
- [ ] ZXP подписан **продакшен-сертификатом** (не self-signed для публикации)
- [ ] `ZXPSignCmd -verify ... -certInfo` проходит без ошибок

### Портал Adobe Developer Distribution

Портал: [developer.adobe.com](https://developer.adobe.com/) → **Distribute** (бывший Exchange Partner Portal).

- [ ] Аккаунт разработчика / организация созданы
- [ ] Trader details для EU (если продаёте в ЕС) — см. [Submission overview](https://developer.adobe.com/developer-distribution/creative-cloud/docs/guides/submission/overview/)
- [ ] Тип продукта: **ZXP / CEP** для Illustrator
- [ ] Загружен `.zxp` как install package
- [ ] Заполнены listing: название, краткое и полное описание (EN)
- [ ] Скриншоты панели и workflow (рекомендуется 3–5 шт.)
- [ ] Иконка 512×512 (можно из `assets/img/appIcon/`)
- [ ] Support URL / email: `sinozemez@gmail.com`
- [ ] Privacy policy (если расширение не собирает данные — указать явно)
- [ ] Pricing: Free или Paid
- [ ] «Where to find it» после установки: **Window → Extensions → Text Export and Import**

### Тексты для листинга (черновик)

**Short description:**  
Export and import text in Adobe Illustrator to XML and XLIFF 1.2 for translation workflows.

**Keywords:** illustrator, translation, xliff, xml, localization, text export, text import, batch

**Compatibility:**  
Adobe Illustrator CS6 (17.0) through 2026 (30.x), Windows and macOS.

---

## Сертификат подписи

| Назначение | Сертификат |
|------------|------------|
| Локальный тест | Self-signed через `Build-Zxp.ps1 -CreateSelfSignedTestCert` |
| Adobe Exchange | Code signing от доверенного CA (GlobalSign, DigiCert, Sectigo и т.д.) |

Self-signed ZXP **не подходит** для публичной публикации на Exchange — пользователи получат ошибку проверки подписи.

Инструмент подписи на этой машине:

```text
D:\_Project\CEP-Resources-master\CEP-Resources-master\ZXPSignCMD\4.1.103\win64\ZXPSignCmd.exe
```

---

## Режимы JSX (важно для релиза)

`main.js` выбирает папку по приоритету: `functions` → `func_bin` → `func_demo`.

Для Exchange в ZXP должна остаться **только** `func_bin` (обфусцированный JSXBIN).  
Иначе в панели будет **Mode(native)** с открытым исходным кодом.

---

## Полезные ссылки

- [Package, Distribute, Install (Adobe CEP)](https://github.com/Adobe-CEP/Getting-Started-guides/tree/master/Package%20Distribute%20Install)
- [ZXP Distribution (Adobe Developer)](https://developer.adobe.com/developer-distribution/creative-cloud/docs/guides/zxp/distribution)
- [Submission and Review](https://developer.adobe.com/developer-distribution/creative-cloud/docs/guides/submission/overview/)
- Внутренняя инструкция сборки: `packaging/ZXP_BUILD.md`

---

## Текущий статус подготовки

| Шаг | Статус |
|-----|--------|
| Staging-скрипт | Готов (`Copy-StagingForZxp.ps1`, режим `-Release`) |
| Build-скрипт | Готов (`Build-Zxp.ps1`) |
| ZXPSignCmd | Найден локально (см. путь выше) |
| Продакшен-сертификат | **Нужно получить / указать** |
| Тестовый ZXP | Запустить `Build-Zxp.ps1 -CreateSelfSignedTestCert -Release` |
| Загрузка в Developer Distribution | После проверки ZXP на чистой машине |

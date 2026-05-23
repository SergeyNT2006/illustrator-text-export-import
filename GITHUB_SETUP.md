# GitHub repository setup

Follow these steps to publish the project and enable the product site.

## 1. Create the repository on GitHub

1. Open [github.com/new](https://github.com/new)
2. Repository name: **`illustrator-text-export-import`**
3. Description: `CEP panel for Adobe Illustrator — export/import text to XML and XLIFF for translation workflows`
4. **Public** repository
5. Do **not** add README / .gitignore (already in the project)
6. Create repository

## 2. Push from this folder

Replace `YOUR_GITHUB_USERNAME` if different from `sinozemez`:

```powershell
cd "d:\__Adobe_developers site\001_Illustrator_Text_Export_Import"
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/illustrator-text-export-import.git
git branch -M main
git push -u origin main
```

## 3. Enable GitHub Pages

1. Repository → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **`main`** · folder: **`/docs`**
4. Save

Site URL will be:

```text
https://YOUR_GITHUB_USERNAME.github.io/illustrator-text-export-import/
```

Update links in `docs/*.html` and `README.md` if the username or repo name differs.

## 4. Publish demo ZXP (Releases)

Build the signed demo:

```powershell
cd packaging
.\Build-Zxp.ps1 -Demo -CertificatePath "D:\path\to\your.p12" -CertificatePassword "YOUR_PASSWORD"
```

Upload to GitHub:

1. Repository → **Releases** → **Create a new release**
2. Tag: `v5.5.0-demo`
3. Title: `Demo 5.5.0`
4. Attach: `packaging/Illustrator_Text_Export_Import_Demo_5.5.0.zxp`
5. Publish release

## 5. Configure payment link ($100)

Edit `docs/buy.html` and set:

```javascript
paymentUrl: "https://your-checkout-page.example/..."
```

Options: Gumroad, Lemon Squeezy, Stripe Payment Link, PayPal, etc.

Until the URL is set, the Buy button opens email to **sinozemez@gmail.com**.

## 6. What stays private

These paths are **gitignored** and must not be pushed:

- `assets/jsx/functions/` — full source
- `assets/jsx/func_bin/` — commercial obfuscated build
- `assets/jsx/func_demo/native/` — dev copies
- `packaging/certs/`, `*.zxp`, staging folders

Keep full builds and certificate only on your local machine or a private backup.

## 7. Optional: Adobe Exchange

For marketplace listing in parallel with direct sales, see `packaging/ADOBE_EXCHANGE.md`.

# GitHub Releases

Attach the **signed demo ZXP** here for public download.

## Build

```powershell
cd ..\packaging
.\Build-Zxp.ps1 -Demo -CertificatePath "D:\path\to\cert.p12" -CertificatePassword "..."
```

Output file:

```text
packaging/Illustrator_Text_Export_Import_Demo_5.5.0.zxp
```

## Suggested release text

**Title:** Demo 5.5.0

**Notes:**

- Free evaluation build
- Limits: first 5 text frames per document, first 5 files per batch job
- Install via Extension Manager, restart Illustrator
- Window → Extensions → Text Export and Import (Demo)
- Full unlimited license: https://YOUR_GITHUB_USERNAME.github.io/illustrator-text-export-import/buy.html

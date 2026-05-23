# Builds a signed ZXP for distribution.
# Usage:
#   .\Build-Zxp.ps1 -Demo -CertificatePath "D:\certs\my.p12" -CertificatePassword "secret"
#   .\Build-Zxp.ps1 -Release -CertificatePath "D:\certs\my.p12" -CertificatePassword "secret"
#   .\Build-Zxp.ps1 -CreateSelfSignedTestCert -Demo

param(
    [switch] $Release,
    [switch] $Demo,
    [string] $CertificatePath = "",
    [string] $CertificatePassword = "",
    [switch] $CreateSelfSignedTestCert,
    [string] $ZxpSignCmd = "D:\_Project\CEP-Resources-master\CEP-Resources-master\ZXPSignCMD\4.1.103\win64\ZXPSignCmd.exe",
    [string] $OutputZxp = ""
)

if ($Release -and $Demo) {
    throw "Use either -Release or -Demo, not both."
}

$ErrorActionPreference = "Stop"

$packagingDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$extensionRoot = Split-Path -Parent $packagingDir
$certsDir = Join-Path $packagingDir "certs"
$defaultCert = Join-Path $certsDir "Illustrator_Text_Export_Import_test.p12"
$defaultCertPasswordFile = Join-Path $certsDir "test-cert-password.txt"
$version = "5.5.0"
$bundleName = "Illustrator_Text_Export_Import"

if (-not $Release -and -not $Demo) {
    Write-Host "Hint: use -Demo for public demo ZXP or -Release for full commercial build."
}

if (-not (Test-Path $ZxpSignCmd)) {
    throw "ZXPSignCmd not found: $ZxpSignCmd`nDownload from Adobe-CEP/CEP-Resources or set -ZxpSignCmd."
}

if ($CreateSelfSignedTestCert) {
    New-Item -ItemType Directory -Path $certsDir -Force | Out-Null
    if (Test-Path $defaultCert) {
        Remove-Item -LiteralPath $defaultCert -Force
    }

    $testPassword = "TestZxp2026!"
    & $ZxpSignCmd -selfSignedCert RU Moscow "Sergey Inozemtsev" "Illustrator Text Export and Import" $testPassword $defaultCert -email "sinozemez@gmail.com" -validityDays 3650
    if ($LASTEXITCODE -ne 0) {
        throw "ZXPSignCmd -selfSignedCert failed with exit code $LASTEXITCODE"
    }

    Set-Content -LiteralPath $defaultCertPasswordFile -Value $testPassword -NoNewline -Encoding UTF8
    Write-Host "Created test certificate:"
    Write-Host "  $defaultCert"
    Write-Host "  Password saved to: $defaultCertPasswordFile"
    Write-Host "Use this cert only for local smoke tests, not for Adobe Exchange submission."
    if (-not $Release -and -not $Demo -and -not $CertificatePath) {
        exit 0
    }
}

$stagingScript = Join-Path $packagingDir "Copy-StagingForZxp.ps1"
$stagingArgs = @{}
if ($Release) { $stagingArgs["Release"] = $true }
if ($Demo) { $stagingArgs["Demo"] = $true }
& $stagingScript @stagingArgs

$stagingDir = if ($Demo) {
    Join-Path $packagingDir "staging_Illustrator_Text_Export_Import_Demo"
} else {
    Join-Path $packagingDir "staging_Illustrator_Text_Export_Import"
}
$metaInf = Join-Path $stagingDir "META-INF"
if (Test-Path $metaInf) {
    Remove-Item -LiteralPath $metaInf -Recurse -Force
}

if (-not $CertificatePath -or $CertificatePath.Trim() -eq "") {
    $CertificatePath = $defaultCert
}
if ((-not $CertificatePassword -or $CertificatePassword.Trim() -eq "") -and (Test-Path $defaultCertPasswordFile)) {
    $CertificatePassword = Get-Content -LiteralPath $defaultCertPasswordFile -Raw
    $CertificatePassword = $CertificatePassword.Trim()
}

if (-not (Test-Path $CertificatePath)) {
    throw @"
Certificate not found: $CertificatePath

For local test:
  .\Build-Zxp.ps1 -CreateSelfSignedTestCert -Release

For Adobe Exchange:
  Obtain a code-signing .p12 (GlobalSign, DigiCert, etc.) and pass -CertificatePath / -CertificatePassword.
"@
}

if (-not $OutputZxp -or $OutputZxp.Trim() -eq "") {
    if ($Demo) {
        $OutputZxp = Join-Path $packagingDir "${bundleName}_Demo_${version}.zxp"
    } elseif ($Release) {
        $OutputZxp = Join-Path $packagingDir "${bundleName}_${version}_release.zxp"
    } else {
        $OutputZxp = Join-Path $packagingDir "${bundleName}_${version}_dev.zxp"
    }
}

Write-Host "Signing staging folder..."
Write-Host "  Input : $stagingDir"
Write-Host "  Output: $OutputZxp"

& $ZxpSignCmd -sign $stagingDir $OutputZxp $CertificatePath $CertificatePassword
if ($LASTEXITCODE -ne 0) {
    throw "ZXPSignCmd -sign failed with exit code $LASTEXITCODE"
}

Write-Host "Verifying..."
& $ZxpSignCmd -verify $OutputZxp -certInfo
if ($LASTEXITCODE -ne 0) {
    throw "ZXPSignCmd -verify failed with exit code $LASTEXITCODE"
}

Write-Host ""
Write-Host "ZXP ready:"
Write-Host $OutputZxp
Write-Host "Next: upload to Adobe Developer Distribution (see packaging/ADOBE_EXCHANGE.md)"

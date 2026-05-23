# Prepares a clean copy of the extension for ZXP signing (excludes dev-only files).
# Run from PowerShell:  .\Copy-StagingForZxp.ps1
# Optional: .\Copy-StagingForZxp.ps1 -Destination "D:\build\staging_Illustrator_Text_Export_Import"

param(
    [string] $Destination = "",
    [switch] $Release,
    [switch] $Demo
)

if ($Release -and $Demo) {
    throw "Use either -Release or -Demo, not both."
}

$ErrorActionPreference = "Stop"

$packagingDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$extensionRoot = Split-Path -Parent $packagingDir

if (-not $Destination -or $Destination.Trim() -eq "") {
    if ($Demo) {
        $Destination = Join-Path $packagingDir "staging_Illustrator_Text_Export_Import_Demo"
    } else {
        $Destination = Join-Path $packagingDir "staging_Illustrator_Text_Export_Import"
    }
}

$script:excludeDirNames = @(
    "dev_docs",
    "packaging",
    ".git"
)

$script:excludeExactFiles = @(
    ".debug",
    "to-do.md"
)

# Any directory name starting with "_" is skipped (test folders like _functions)
$script:excludeDirNamePrefixes = @(
    "_"
)

function Test-ExcludedDirectory {
    param([string] $relativePath)
    $parts = $relativePath -split '[\\/]+' | Where-Object { $_ -ne "" }
    foreach ($p in $parts) {
        if ($script:excludeDirNames -contains $p) { return $true }
        foreach ($prefix in $script:excludeDirNamePrefixes) {
            if ($p.Length -gt $prefix.Length -and $p.StartsWith($prefix)) { return $true }
        }
    }
    return $false
}

function Copy-Tree {
    param([string] $Source, [string] $DestRoot, [string] $BaseRelative)

    $destDir = Join-Path $DestRoot $BaseRelative
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null

    Get-ChildItem -LiteralPath $Source -Force | ForEach-Object {
        $n = $_.Name
        $childSrc = $_.FullName
        $childRel = Join-Path $BaseRelative $n

        if ($_.PSIsContainer) {
            if (Test-ExcludedDirectory -relativePath $childRel) { return }
            Copy-Tree -Source $childSrc -DestRoot $DestRoot -BaseRelative $childRel
        } else {
            if ($n -like "*.bak") { return }
            $destFile = Join-Path $DestRoot $childRel
            $parent = Split-Path -Parent $destFile
            if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
            Copy-Item -LiteralPath $childSrc -Destination $destFile -Force
        }
    }
}

if (Test-Path $Destination) {
    Remove-Item -LiteralPath $Destination -Recurse -Force
}
New-Item -ItemType Directory -Path $Destination -Force | Out-Null

Get-ChildItem -LiteralPath $extensionRoot -Force | ForEach-Object {
    $name = $_.Name
    $src = $_.FullName

    if ($_.PSIsContainer) {
        if ($script:excludeDirNames -contains $name) { return }
        if ($name.StartsWith("_")) { return }
    } else {
        if ($script:excludeExactFiles -contains $name) { return }
    }

    if ($_.PSIsContainer) {
        Copy-Tree -Source $src -DestRoot $Destination -BaseRelative $name
    } else {
        Copy-Item -LiteralPath $src -Destination (Join-Path $Destination $name) -Force
    }
}

function Remove-IfExists {
    param([string] $Path)
    if (Test-Path $Path) {
        Remove-Item -LiteralPath $Path -Recurse -Force
    }
}

function Set-DemoManifest {
    param([string] $StagingRoot)
    $manifestPath = Join-Path $StagingRoot "CSXS\manifest.xml"
    if (-not (Test-Path $manifestPath)) { return }

    [xml] $xml = Get-Content -LiteralPath $manifestPath -Encoding UTF8
    $root = $xml.ExtensionManifest
    $root.ExtensionBundleId = "Illustrator_Text_Export_Import_Demo_5.5"
    $root.ExtensionBundleName = "Illustrator Text Export and Import (Demo)"
    $root.ExtensionList.Extension.Version = "5.5.0"
    $root.ExtensionList.Extension.Id = "Illustrator_Text_Export_Import_Demo_5.5"

    $dispatch = $root.DispatchInfoList.Extension
    $dispatch.Id = "Illustrator_Text_Export_Import_Demo_5.5"
    $dispatch.DispatchInfo.UI.Menu = "Text Export and Import (Demo)"

    $settings = New-Object System.Xml.XmlWriterSettings
    $settings.Indent = $true
    $settings.Encoding = New-Object System.Text.UTF8Encoding($false)
    $writer = [System.Xml.XmlWriter]::Create($manifestPath, $settings)
    $xml.Save($writer)
    $writer.Close()
}

$jsxRoot = Join-Path $Destination "assets\jsx"

if ($Release) {
    foreach ($mode in @("functions", "func_demo")) {
        $modePath = Join-Path $jsxRoot $mode
        if (Test-Path $modePath) {
            Remove-Item -LiteralPath $modePath -Recurse -Force
            Write-Host "Release: removed assets/jsx/$mode"
        }
    }
}

if ($Demo) {
    foreach ($mode in @("functions", "func_bin")) {
        $modePath = Join-Path $jsxRoot $mode
        if (Test-Path $modePath) {
            Remove-Item -LiteralPath $modePath -Recurse -Force
            Write-Host "Demo: removed assets/jsx/$mode"
        }
    }
    Remove-IfExists (Join-Path $jsxRoot "func_demo\native")
    Set-DemoManifest -StagingRoot $Destination
}

Remove-IfExists (Join-Path $Destination "META-INF")

Write-Host "Staging ready:"
Write-Host $Destination
if ($Release) {
    Write-Host "Release mode: func_bin only (full commercial build)"
} elseif ($Demo) {
    Write-Host "Demo mode: func_demo only (5 frames / 5 files limit)"
}
Write-Host "Next: sign this folder with ZXPSignCmd (see packaging/ZXP_BUILD.md or Build-Zxp.ps1)"

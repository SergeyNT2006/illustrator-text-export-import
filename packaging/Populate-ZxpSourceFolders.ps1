# Populates packaging\demo and packaging\production with ZXP-ready extension trees.
# Run:  .\Populate-ZxpSourceFolders.ps1

$ErrorActionPreference = "Stop"

$packagingDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$extensionRoot = Split-Path -Parent $packagingDir
$demoDir = Join-Path $packagingDir "demo"
$productionDir = Join-Path $packagingDir "production"

$excludeDirNames = @(
    "dev_docs", "packaging", "docs", "releases", ".git",
    "functions", "func_bin", "func_demo", "native"
)

function Test-ExcludedPath {
    param([string] $RelativePath)
    $parts = $RelativePath -split '[\\/]+' | Where-Object { $_ -ne "" }
    foreach ($p in $parts) {
        if ($excludeDirNames -contains $p) { return $true }
        if ($p.StartsWith("_")) { return $true }
    }
    return $false
}

function Copy-RuntimeTree {
    param([string] $Source, [string] $DestRoot, [string] $BaseRelative)
    $destDir = Join-Path $DestRoot $BaseRelative
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    Get-ChildItem -LiteralPath $Source -Force | ForEach-Object {
        $n = $_.Name
        $childSrc = $_.FullName
        $childRel = if ($BaseRelative) { Join-Path $BaseRelative $n } else { $n }
        if ($_.PSIsContainer) {
            if (Test-ExcludedPath -RelativePath $childRel) { return }
            Copy-RuntimeTree -Source $childSrc -DestRoot $DestRoot -BaseRelative $childRel
        } else {
            if ($n -like "*.bak") { return }
            $destFile = Join-Path $DestRoot $childRel
            $parent = Split-Path -Parent $destFile
            if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
            Copy-Item -LiteralPath $childSrc -Destination $destFile -Force
        }
    }
}

function Reset-Destination { param([string] $Path)
    if (Test-Path $Path) { Remove-Item -LiteralPath $Path -Recurse -Force }
    New-Item -ItemType Directory -Path $Path -Force | Out-Null
}

function Copy-ExtensionShell {
    param([string] $Destination)
    Reset-Destination -Path $Destination
    @("index.html", "mimetype") | ForEach-Object {
        Copy-Item -LiteralPath (Join-Path $extensionRoot $_) -Destination (Join-Path $Destination $_) -Force
    }
    Copy-RuntimeTree -Source (Join-Path $extensionRoot "CSXS") -DestRoot $Destination -BaseRelative "CSXS"
    Copy-RuntimeTree -Source (Join-Path $extensionRoot "components") -DestRoot $Destination -BaseRelative "components"
    $assetsRoot = Join-Path $extensionRoot "assets"
    foreach ($sub in @("css", "fonts", "help", "img", "js")) {
        Copy-RuntimeTree -Source (Join-Path $assetsRoot $sub) -DestRoot $Destination -BaseRelative "assets\$sub"
    }
    $destHost = Join-Path $Destination "assets\jsx\hostscript.jsx"
    New-Item -ItemType Directory -Path (Split-Path -Parent $destHost) -Force | Out-Null
    Copy-Item -LiteralPath (Join-Path $assetsRoot "jsx\hostscript.jsx") -Destination $destHost -Force
    $metaInf = Join-Path $Destination "META-INF"
    if (Test-Path $metaInf) { Remove-Item -LiteralPath $metaInf -Recurse -Force }
}

function Set-DemoManifest {
    param([string] $StagingRoot)
    $manifestPath = Join-Path $StagingRoot "CSXS\manifest.xml"
    [xml] $xml = Get-Content -LiteralPath $manifestPath -Encoding UTF8
    $root = $xml.ExtensionManifest
    $root.ExtensionBundleId = "Illustrator_Text_Export_Import_Demo_5.5"
    $root.ExtensionBundleName = "Illustrator Text Export and Import (Demo)"
    $root.ExtensionList.Extension.Version = "5.5.0"
    $root.ExtensionList.Extension.Id = "Illustrator_Text_Export_Import_Demo_5.5"
    $dispatch = $root.DispatchInfoList.Extension
    $dispatch.Id = "Illustrator_Text_Export_Import_Demo_5.5"
    $dispatch.DispatchInfo.UI.Menu = "Text Export and Import (Demo)"
    $root.Legal.InnerText = "Copyright 2018-2026 Sergey A. Inozemtsev. Demo build. Adobe Exchange Plugin ID: 205341."
    $settings = New-Object System.Xml.XmlWriterSettings
    $settings.Indent = $true
    $settings.Encoding = New-Object System.Text.UTF8Encoding($false)
    $writer = [System.Xml.XmlWriter]::Create($manifestPath, $settings)
    $xml.Save($writer)
    $writer.Close()
}

function Copy-JsxMode {
    param([string] $Destination, [string] $ModeFolder)
    Copy-RuntimeTree -Source (Join-Path $extensionRoot "assets\jsx\$ModeFolder") -DestRoot $Destination -BaseRelative "assets\jsx\$ModeFolder"
}

Write-Host "Building production..."
Copy-ExtensionShell -Destination $productionDir
Copy-JsxMode -Destination $productionDir -ModeFolder "func_bin"
Write-Host "Building demo..."
Copy-ExtensionShell -Destination $demoDir
Copy-JsxMode -Destination $demoDir -ModeFolder "func_demo"
Set-DemoManifest -StagingRoot $demoDir
Write-Host "Done: demo, production"

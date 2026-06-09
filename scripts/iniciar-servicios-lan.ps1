# Abre Shonan (5000) y Almacén (5173) en ventanas separadas.
param(
    [string]$ShonanPath = "",
    [string]$AlmacenPath = "",
    [string]$Desktop = [Environment]::GetFolderPath("Desktop")
)

if (-not $ShonanPath) {
    $ShonanPath = @(
        (Join-Path $Desktop "shonan-machinery-os"),
        "C:\shonan-machinery-os"
    ) | Where-Object { Test-Path $_ } | Select-Object -First 1
}
if (-not $AlmacenPath) {
    $AlmacenPath = @(
        (Join-Path $Desktop "almacen-smex"),
        (Join-Path $Desktop "inventarios-v1-ready-main")
    ) | Where-Object { Test-Path $_ } | Select-Object -First 1
}

if (-not $ShonanPath -or -not $AlmacenPath) {
    throw "No se encontraron las carpetas. Ejecuta primero deploy-servidor-lan.ps1"
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ShonanPath'; npm run dev"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$AlmacenPath'; npm run dev"

Write-Host "Servicios iniciados. Shonan :5000 | Almacén :5173"

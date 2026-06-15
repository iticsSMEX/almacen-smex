<#
  Inicia AlmacenSMEX (Vite) en la red local.
  Escucha en 0.0.0.0:5173 (ver vite.config.js).

  Uso:
    cd C:\Users\Shonan\Projects\almacen-smex
    .\scripts\start-server.ps1
#>

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path $PSScriptRoot -Parent
Set-Location $ProjectRoot

$npm = "C:\Program Files\nodejs\npm.cmd"

if (-not (Test-Path $npm)) {
  Write-Host "Node.js no encontrado en C:\Program Files\nodejs\" -ForegroundColor Red
  Write-Host "Instala Node.js LTS: winget install OpenJS.NodeJS.LTS" -ForegroundColor Yellow
  exit 1
}

if (-not (Test-Path ".env")) {
  Write-Host "Falta el archivo .env. Copia .env.example y completa VITE_APP_SUPABASE_URL y VITE_APP_SUPABASE_ANON_KEY." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "AlmacenSMEX - servidor en http://0.0.0.0:5173" -ForegroundColor Green
Write-Host "Detener: Ctrl+C" -ForegroundColor DarkGray
Write-Host ""

& $npm run dev

# Despliegue Almacén + Shonan en red LAN (ej. 192.168.1.50)
# Ejecutar EN EL SERVIDOR como administrador de carpetas, en PowerShell:
#   Set-ExecutionPolicy -Scope Process Bypass -Force
#   .\scripts\deploy-servidor-lan.ps1

param(
    [string]$ServerIp = "192.168.1.50",
    [string]$ShonanPath = "",
    [string]$AlmacenPath = "",
    [string]$Desktop = [Environment]::GetFolderPath("Desktop")
)

$ErrorActionPreference = "Stop"
$ShonanRepo = "https://github.com/j-sato-smmx/shonan-machinery-os.git"
$AlmacenRepo = "https://github.com/iticsSMEX/almacen-smex.git"

if (-not $ShonanPath) {
    $candidates = @(
        (Join-Path $Desktop "shonan-machinery-os"),
        "C:\shonan-machinery-os",
        "C:\apps\shonan-machinery-os"
    )
    $ShonanPath = ($candidates | Where-Object { Test-Path $_ } | Select-Object -First 1)
    if (-not $ShonanPath) { $ShonanPath = Join-Path $Desktop "shonan-machinery-os" }
}

if (-not $AlmacenPath) {
    $candidates = @(
        (Join-Path $Desktop "almacen-smex"),
        (Join-Path $Desktop "inventarios-v1-ready-main"),
        "C:\almacen-smex"
    )
    $AlmacenPath = ($candidates | Where-Object { Test-Path $_ } | Select-Object -First 1)
    if (-not $AlmacenPath) { $AlmacenPath = Join-Path $Desktop "almacen-smex" }
}

function Ensure-Git {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        throw "Git no está instalado. Instálalo y vuelve a ejecutar este script."
    }
}

function Update-EnvLine {
    param([string]$File, [string]$Key, [string]$Value)
    if (-not (Test-Path $File)) { return $false }
    $lines = Get-Content $File
    $found = $false
    $out = foreach ($line in $lines) {
        if ($line -match "^\s*$([regex]::Escape($Key))\s*=") {
            $found = $true
            "$Key=$Value"
        } else { $line }
    }
    if (-not $found) { $out += "$Key=$Value" }
    Set-Content -Path $File -Value $out -Encoding UTF8
    return $true
}

function Sync-Repo {
    param([string]$Path, [string]$RemoteUrl, [string]$Label)
    if (Test-Path (Join-Path $Path ".git")) {
        Write-Host ">> Actualizando $Label en $Path" -ForegroundColor Cyan
        Push-Location $Path
        git pull origin main
        Pop-Location
        return
    }
    if (Test-Path $Path) {
        throw "La carpeta $Path existe pero no es un repo Git. Renómbrala o bórrala y vuelve a ejecutar."
    }
    Write-Host ">> Clonando $Label en $Path" -ForegroundColor Cyan
    git clone $RemoteUrl $Path
}

function Install-Npm {
    param([string]$Path, [string]$Label)
    Write-Host ">> npm install en $Label" -ForegroundColor Cyan
    Push-Location $Path
    if (-not (Test-Path "node_modules")) {
        npm install
    } else {
        npm install
    }
    Pop-Location
}

Write-Host "`n=== Despliegue LAN: Shonan + Almacén ===" -ForegroundColor Green
Write-Host "IP servidor: $ServerIp"
Write-Host "Shonan:  $ShonanPath"
Write-Host "Almacén: $AlmacenPath`n"

Ensure-Git

# --- Shonan ---
Sync-Repo -Path $ShonanPath -RemoteUrl $ShonanRepo -Label "Shonan OS"
Install-Npm -Path $ShonanPath -Label "Shonan"

$shonanEnv = Join-Path $ShonanPath ".env"
if (-not (Test-Path $shonanEnv)) {
    Copy-Item (Join-Path $ShonanPath ".env.example") $shonanEnv
    Write-Host "!! Creado .env de Shonan desde .env.example — revisa SUPABASE_* y SESSION_SECRET" -ForegroundColor Yellow
}
Update-EnvLine -File $shonanEnv -Key "INVENTARIOS_APP_URL" -Value "http://${ServerIp}:5173" | Out-Null
Update-EnvLine -File $shonanEnv -Key "VITE_INVENTARIOS_APP_URL" -Value "http://${ServerIp}:5173" | Out-Null
Update-EnvLine -File $shonanEnv -Key "PORT" -Value "5000" | Out-Null

# --- Almacén ---
Sync-Repo -Path $AlmacenPath -RemoteUrl $AlmacenRepo -Label "AlmacénSMEX"
Install-Npm -Path $AlmacenPath -Label "Almacén"

$almacenEnv = Join-Path $AlmacenPath ".env"
if (-not (Test-Path $almacenEnv)) {
    Copy-Item (Join-Path $AlmacenPath ".env.example") $almacenEnv
    Write-Host "!! Creado .env de Almacén desde .env.example — pega las claves de Supabase de inventarios" -ForegroundColor Yellow
}
Update-EnvLine -File $almacenEnv -Key "VITE_SHONAN_APP_URL" -Value "http://${ServerIp}:5000" | Out-Null

Write-Host "`n=== Listo. Siguiente paso ===" -ForegroundColor Green
Write-Host "1. Verifica .env en ambos proyectos (claves Supabase)."
Write-Host "2. Abre DOS terminales y ejecuta:"
Write-Host "   Terminal A: cd `"$ShonanPath`" ; npm run dev"
Write-Host "   Terminal B: cd `"$AlmacenPath`" ; npm run dev"
Write-Host "3. Prueba: http://${ServerIp}:5000  -> Compras -> clic Almacén"
Write-Host "4. API inventario: http://${ServerIp}:5000/api/inventory/total-value`n"

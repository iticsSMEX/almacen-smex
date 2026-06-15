<#
  Registra AlmacenSMEX para que arranque al iniciar sesion en Windows.

  Ejecutar como administrador NO es obligatorio (la tarea corre con tu usuario).
  Uso:
    cd C:\Users\Shonan\Projects\almacen-smex
    .\scripts\install-startup-task.ps1
#>

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path $PSScriptRoot -Parent
$StartScript = Join-Path $ProjectRoot "scripts\start-server.ps1"
$TaskName = "Almacen SMEX Server"

if (-not (Test-Path $StartScript)) {
  Write-Host "No se encuentra start-server.ps1 en $StartScript" -ForegroundColor Red
  exit 1
}

$Action = New-ScheduledTaskAction `
  -Execute "powershell.exe" `
  -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$StartScript`"" `
  -WorkingDirectory $ProjectRoot

$Trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME

$Settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -RestartCount 3 `
  -RestartInterval (New-TimeSpan -Minutes 1)

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $Action `
  -Trigger $Trigger `
  -Settings $Settings `
  -Description "Arranca AlmacenSMEX (Vite) en el puerto 5173 al iniciar sesion." `
  -Force | Out-Null

Write-Host "Tarea '$TaskName' instalada." -ForegroundColor Green
Write-Host "Arrancara al iniciar sesion. Para probar ahora:" -ForegroundColor Cyan
Write-Host "  Start-ScheduledTask -TaskName '$TaskName'" -ForegroundColor White
Write-Host ""
Write-Host "Para quitar el arranque automatico:" -ForegroundColor DarkGray
Write-Host "  Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:`$false" -ForegroundColor White

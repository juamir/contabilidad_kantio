param(
    [string]$WebhookUrl = "https://dokploy.kantio.online/api/deploy/compose/kantio_contabilidad_deploy_token_2026",
    [switch]$CheckOnly
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [*] KANTIO CONTABILIDAD - SISTEMA DE DESPLIEGUE AUTOMATIZADO" -ForegroundColor Cyan
Write-Host "     Dokploy PaaS - Zero-Downtime - https://contabilidad.kantio.online" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

if ($CheckOnly.IsPresent) {
    Write-Host "[*] Verificando estado del servicio en produccion..." -ForegroundColor Yellow
    try {
        $res = Invoke-RestMethod -Uri "https://contabilidad.kantio.online/api/v1/health" -Method Get -TimeoutSec 10
        Write-Host "[OK] Servicio Operativo:" -ForegroundColor Green
        Write-Host ($res | ConvertTo-Json -Depth 3)
    } catch {
        Write-Host "[ERROR] Error al verificar servicio: $($_.Exception.Message)" -ForegroundColor Red
    }
    exit 0
}

Write-Host "[*] Invocando Webhook de Despliegue en Dokploy..." -ForegroundColor Yellow
Write-Host "    URL: $WebhookUrl" -ForegroundColor Gray

$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

try {
    $response = Invoke-RestMethod -Uri $WebhookUrl -Method Post -TimeoutSec 30
    Write-Host "[OK] Dokploy ha recibido la solicitud de despliegue." -ForegroundColor Green
    if ($response.message) {
        Write-Host "     Mensaje Dokploy: $($response.message)" -ForegroundColor Gray
    }
} catch {
    Write-Host "[WARN] No se pudo invocar Webhook automatico: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "       (Si es el primer despliegue, cree la aplicacion Compose en Dokploy apuntando a docker-compose.prod.yml)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "[*] Esperando arranque de contenedores (8s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

Write-Host "[*] Ejecutando comprobacion de salud en produccion..." -ForegroundColor Yellow
$healthy = $false
$attempts = 0
$maxAttempts = 5

while (-not $healthy -and $attempts -lt $maxAttempts) {
    $attempts++
    try {
        $health = Invoke-RestMethod -Uri "https://contabilidad.kantio.online/api/v1/health" -Method Get -TimeoutSec 5
        if ($health -and $health.status -eq "healthy") {
            $healthy = $true
            break
        }
    } catch {
        Write-Host "    Intento $attempts de $maxAttempts - esperando servicio..." -ForegroundColor Gray
        Start-Sleep -Seconds 3
    }
}

$stopwatch.Stop()

if ($healthy) {
    $elapsed = [math]::Round($stopwatch.Elapsed.TotalSeconds, 1)
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " [OK] SERVICIO OPERATIVO Y DISPONIBLE EN $elapsed s!" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[INFO] Despliegue preparado para Dokploy. Para ejecutar manualmente en el servidor:" -ForegroundColor Cyan
    Write-Host "       cd /home/kantio/kantio_contabilidad" -ForegroundColor White
    Write-Host "       docker compose -f docker-compose.prod.yml up -d --build" -ForegroundColor White
}

Write-Host ""
Write-Host "----------------------------------------------------------" -ForegroundColor DarkCyan
Write-Host " * Frontend Web (PWA):  https://contabilidad.kantio.online/" -ForegroundColor White
Write-Host " * API RESTful Backend: https://contabilidad.kantio.online/api/v1" -ForegroundColor White
Write-Host " * Documentacion OpenAPI: https://contabilidad.kantio.online/api/v1/docs" -ForegroundColor White
Write-Host "----------------------------------------------------------" -ForegroundColor DarkCyan
Write-Host ""
Write-Host " [i] USUARIOS PRECARGADOS PARA PRUEBAS (Password: Kantio2026!):" -ForegroundColor Yellow
Write-Host "  1. SuperAdmin:       superadmin@kantio.online" -ForegroundColor Gray
Write-Host "  2. Admin Empresa:    admin.demo@kantio.online" -ForegroundColor Gray
Write-Host "  3. Contador Senior:  contador.alpha@kantio.online" -ForegroundColor Gray
Write-Host "  4. Asistente Carga:  asistente.alpha@kantio.online" -ForegroundColor Gray
Write-Host "  5. Auditor Forense:  auditor.externo@kantio.online" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

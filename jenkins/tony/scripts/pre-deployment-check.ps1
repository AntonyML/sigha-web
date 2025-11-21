param(
    [int]$Port = 3010,
    [int]$TimeoutSeconds = 30
)

Write-Host "========================================"
Write-Host "PRE-DEPLOYMENT VALIDATION"
Write-Host "========================================"
Write-Host ""

Write-Host "Checking current React server status on port $Port..."

try {
    $checkScript = ".\jenkins\tony\scripts\check-server-status.ps1"
    $checkResult = & $checkScript -Port $Port
    $lastExitCode = $LASTEXITCODE
    
    if ($lastExitCode -eq 0) {
        Write-Host "OK: React server is RUNNING on port $Port"
        Write-Host ""
        Write-Host "Initiating graceful shutdown before deployment..."
        Write-Host ""
        
        $shutdownScript = ".\jenkins\tony\scripts\graceful-shutdown.ps1"
        & $shutdownScript -Port $Port -GracefulTimeoutSeconds 15
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Graceful shutdown failed"
            Write-Host ""
            exit 1
        }
        
        Write-Host ""
        Write-Host "Confirming server is stopped..."
        Start-Sleep -Seconds 2
        
        & $checkScript -Port $Port
        if ($LASTEXITCODE -eq 0) {
            Write-Host "WARNING: React server still running after graceful shutdown"
            Write-Host "Forcing termination..."
            Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
        }
        
        Write-Host ""
        Write-Host "========================================"
        Write-Host "React server was RUNNING - gracefully stopped"
        Write-Host "========================================"
        Write-Host ""
        exit 0
        
    } else {
        Write-Host "OK: React server is NOT running on port $Port"
        Write-Host ""
        Write-Host "========================================"
        Write-Host "React server was STOPPED - no action needed"
        Write-Host "========================================"
        Write-Host ""
        exit 1  # 1 = was not running
    }
}
catch {
    Write-Host "ERROR: Pre-deployment validation failed"
    Write-Host $_.Exception.Message
    Write-Host ""
    exit 2  # 2 = error
}

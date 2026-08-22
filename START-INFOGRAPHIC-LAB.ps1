param(
    [switch]$Build
)

$ErrorActionPreference = "Stop"

& {
    $AppRoot = $PSScriptRoot
    $ComposeFile = Join-Path $AppRoot "docker-compose.yml"
    $EnvFile = Join-Path $AppRoot ".env"
    $VibeVolume = if ($env:VIBE_HOME_VOLUME) {
        $env:VIBE_HOME_VOLUME
    }
    else {
        "infographic-lab_vibe_home"
    }
    $ImageTag = if ($env:INFOGRAPHIC_LAB_IMAGE_TAG) {
        $env:INFOGRAPHIC_LAB_IMAGE_TAG
    }
    else {
        "1.0.0"
    }

    Write-Host "`n=== INFOGRAPHIC LAB 1.0.0 ===" -ForegroundColor Cyan
    Write-Host "Dossier : $AppRoot"

    if (-not (Test-Path $ComposeFile -PathType Leaf)) {
        throw "docker-compose.yml introuvable : $ComposeFile"
    }

    Write-Host "`n=== DOCKER ===" -ForegroundColor Cyan
    docker info *> $null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker Desktop n'est pas disponible."
    }
    Write-Host "Docker : OK" -ForegroundColor Green

    $HasKeyInEnvFile = $false
    if (Test-Path $EnvFile -PathType Leaf) {
        $HasKeyInEnvFile = [bool](Get-Content $EnvFile | Where-Object {
            $_ -match '^\s*MISTRAL_API_KEY\s*=\s*.+\S\s*$' -and $_ -notmatch '^\s*#'
        } | Select-Object -First 1)
    }

    Write-Host "`n=== PROFIL VIBE ===" -ForegroundColor Cyan
    $ExistingVolumes = @(docker volume ls --format "{{.Name}}")
    $CreatedVolume = $false
    if ($ExistingVolumes -notcontains $VibeVolume) {
        docker volume create $VibeVolume *> $null
        if ($LASTEXITCODE -ne 0) {
            throw "Impossible de créer le volume Vibe : $VibeVolume"
        }
        $CreatedVolume = $true
        Write-Host "Volume créé : $VibeVolume" -ForegroundColor Green
    }
    else {
        Write-Host "Volume existant : $VibeVolume" -ForegroundColor Green
    }

    if ($CreatedVolume -and -not $env:MISTRAL_API_KEY -and -not $HasKeyInEnvFile) {
        throw "Première installation : copiez .env.example vers .env puis renseignez MISTRAL_API_KEY avant de relancer."
    }

    $env:VIBE_HOME_VOLUME = $VibeVolume
    if (-not $env:RUNNER_SHARED_TOKEN) {
        $env:RUNNER_SHARED_TOKEN = ([guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N"))
    }

    Set-Location $AppRoot

    Write-Host "`n=== VALIDATION COMPOSE ===" -ForegroundColor Cyan
    docker compose config --quiet
    if ($LASTEXITCODE -ne 0) {
        throw "docker compose config a échoué."
    }

    if ($Build.IsPresent) {
        Write-Host "L'option -Build n'est plus nécessaire : les images publiées sur Docker Hub sont utilisées." -ForegroundColor Yellow
    }

    $AppImage = "erwanntorrent/infographic-lab:$ImageTag"
    $RunnerImage = "erwanntorrent/infographic-vibe-runner:$ImageTag"

    Write-Host "`n=== IMAGES DOCKER HUB ===" -ForegroundColor Cyan
    Write-Host "Application : $AppImage"
    Write-Host "Vibe runner : $RunnerImage"
    docker compose pull
    if ($LASTEXITCODE -ne 0) {
        $AppCached = $true
        $RunnerCached = $true
        docker image inspect $AppImage *> $null
        if ($LASTEXITCODE -ne 0) { $AppCached = $false }
        docker image inspect $RunnerImage *> $null
        if ($LASTEXITCODE -ne 0) { $RunnerCached = $false }

        if (-not $AppCached -or -not $RunnerCached) {
            throw "Impossible de télécharger les images Docker Hub et aucune copie locale complète n'est disponible."
        }

        Write-Host "Docker Hub indisponible : utilisation des images déjà présentes localement." -ForegroundColor Yellow
    }
    else {
        Write-Host "Images Docker Hub : OK" -ForegroundColor Green
    }

    Write-Host "`n=== DEMARRAGE ===" -ForegroundColor Cyan
    docker compose up -d
    if ($LASTEXITCODE -ne 0) {
        docker compose logs --tail 120
        throw "Le démarrage Infographic Lab a échoué."
    }

    Write-Host "`n=== HEALTHCHECKS ===" -ForegroundColor Cyan
    $RunnerHealthy = $false
    for ($i = 0; $i -lt 30; $i++) {
        $RunnerStatus = docker inspect infographic-vibe-runner --format '{{.State.Health.Status}}' 2>$null
        if ($RunnerStatus -eq "healthy") {
            $RunnerHealthy = $true
            break
        }
        Start-Sleep -Seconds 2
    }

    if (-not $RunnerHealthy) {
        docker compose logs --tail 120 vibe-runner
        throw "Le runner Vibe n'est pas healthy. Vérifiez la configuration MISTRAL_API_KEY ou le profil Vibe réutilisé."
    }

    $AppHealthy = $false
    for ($i = 0; $i -lt 30; $i++) {
        try {
            $Health = Invoke-RestMethod -Uri "http://127.0.0.1:3091/health" -TimeoutSec 3
            if ($Health.status -eq "ok") {
                $AppHealthy = $true
                break
            }
        }
        catch {
            Start-Sleep -Seconds 2
        }
    }

    if (-not $AppHealthy) {
        docker compose logs --tail 120 app
        throw "Infographic Lab ne répond pas sur le port 3091."
    }

    Write-Host "Vibe : healthy" -ForegroundColor Green
    Write-Host "Application : healthy" -ForegroundColor Green

    Write-Host "`n=== ETAT ===" -ForegroundColor Cyan
    docker compose ps

    Write-Host "`nInfographic Lab : http://127.0.0.1:3091" -ForegroundColor Green
    Write-Host "Les prochains lancements réutilisent les images Docker Hub de la version $ImageTag." -ForegroundColor DarkGray
}

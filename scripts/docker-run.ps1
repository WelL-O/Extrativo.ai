# ============================================
# EXTRATIVO.AI - DOCKER HELPER SCRIPT (PowerShell)
# ============================================
# Script para facilitar operações com Docker no Windows

# Functions
function Print-Header {
    Write-Host "================================" -ForegroundColor Blue
    Write-Host "  EXTRATIVO.AI - Docker Helper" -ForegroundColor Blue
    Write-Host "================================`n" -ForegroundColor Blue
}

function Print-Success {
    param($message)
    Write-Host "✓ $message" -ForegroundColor Green
}

function Print-Error {
    param($message)
    Write-Host "✗ $message" -ForegroundColor Red
}

function Print-Info {
    param($message)
    Write-Host "ℹ $message" -ForegroundColor Yellow
}

function Check-Env {
    # Navigate to project root
    Set-Location (Join-Path $PSScriptRoot "..")
    if (-not (Test-Path .env)) {
        Print-Error "Arquivo .env não encontrado!"
        Print-Info "Copie o arquivo .env.example para .env e configure as variáveis"
        Write-Host "  cp .env.example .env"
        exit 1
    }
}

function Show-Menu {
    Print-Header
    Write-Host "Escolha uma opção:"
    Write-Host "1) Iniciar em modo desenvolvimento"
    Write-Host "2) Iniciar em modo produção"
    Write-Host "3) Build da imagem de produção"
    Write-Host "4) Parar todos os containers"
    Write-Host "5) Ver logs"
    Write-Host "6) Limpar containers e volumes"
    Write-Host "7) Health check"
    Write-Host "8) Acessar shell do container"
    Write-Host "0) Sair`n"
}

function Start-DevMode {
    Print-Info "Iniciando em modo desenvolvimento..."
    Check-Env
    docker-compose -f docker/docker-compose.dev.yml up
}

function Start-ProdMode {
    Print-Info "Iniciando em modo produção..."
    Check-Env
    docker-compose -f docker/docker-compose.yml up -d
    Print-Success "Aplicação rodando em http://localhost:3000"
}

function Build-Prod {
    Print-Info "Construindo imagem de produção..."
    Check-Env
    docker-compose -f docker/docker-compose.yml build --no-cache
    Print-Success "Build concluído!"
}

function Stop-All {
    Print-Info "Parando containers..."
    docker-compose -f docker/docker-compose.yml down
    docker-compose -f docker/docker-compose.dev.yml down
    Print-Success "Containers parados!"
}

function View-Logs {
    docker-compose -f docker/docker-compose.yml logs -f
}

function Clean-All {
    Print-Info "Removendo containers, volumes e imagens..."
    docker-compose -f docker/docker-compose.yml down -v --rmi all
    docker-compose -f docker/docker-compose.dev.yml down -v --rmi all
    Print-Success "Limpeza concluída!"
}

function Test-Health {
    Print-Info "Verificando saúde da aplicação..."
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Print-Success "Aplicação está saudável!"
            $response.Content | ConvertFrom-Json | ConvertTo-Json
        }
    }
    catch {
        Print-Error "Aplicação não está respondendo!"
        exit 1
    }
}

function Open-Shell {
    Print-Info "Acessando shell do container..."
    docker-compose -f docker/docker-compose.yml exec extrativo-frontend sh
}

# Main loop
while ($true) {
    Show-Menu
    $choice = Read-Host "Opção"
    Write-Host ""

    switch ($choice) {
        "1" { Start-DevMode }
        "2" { Start-ProdMode }
        "3" { Build-Prod }
        "4" { Stop-All }
        "5" { View-Logs }
        "6" { Clean-All }
        "7" { Test-Health }
        "8" { Open-Shell }
        "0" {
            Print-Info "Saindo..."
            exit 0
        }
        default { Print-Error "Opção inválida!" }
    }

    Write-Host ""
    Read-Host "Pressione ENTER para continuar"
}

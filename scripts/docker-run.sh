#!/bin/bash

# ============================================
# EXTRATIVO.AI - DOCKER HELPER SCRIPT
# ============================================
# Script para facilitar operações com Docker

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  EXTRATIVO.AI - Docker Helper${NC}"
    echo -e "${BLUE}================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

check_env() {
    # Navigate to project root
    cd "$(dirname "$0")/.."
    if [ ! -f .env ]; then
        print_error "Arquivo .env não encontrado!"
        print_info "Copie o arquivo .env.example para .env e configure as variáveis"
        echo "  cp .env.example .env"
        exit 1
    fi
}

# Main menu
show_menu() {
    print_header
    echo "Escolha uma opção:"
    echo "1) Iniciar em modo desenvolvimento"
    echo "2) Iniciar em modo produção"
    echo "3) Build da imagem de produção"
    echo "4) Parar todos os containers"
    echo "5) Ver logs"
    echo "6) Limpar containers e volumes"
    echo "7) Health check"
    echo "8) Acessar shell do container"
    echo "0) Sair"
    echo ""
}

dev_mode() {
    print_info "Iniciando em modo desenvolvimento..."
    check_env
    docker-compose -f docker/docker-compose.dev.yml up
}

prod_mode() {
    print_info "Iniciando em modo produção..."
    check_env
    docker-compose -f docker/docker-compose.yml up -d
    print_success "Aplicação rodando em http://localhost:3000"
}

build_prod() {
    print_info "Construindo imagem de produção..."
    check_env
    docker-compose -f docker/docker-compose.yml build --no-cache
    print_success "Build concluído!"
}

stop_all() {
    print_info "Parando containers..."
    docker-compose -f docker/docker-compose.yml down
    docker-compose -f docker/docker-compose.dev.yml down
    print_success "Containers parados!"
}

view_logs() {
    docker-compose -f docker/docker-compose.yml logs -f
}

clean_all() {
    print_info "Removendo containers, volumes e imagens..."
    docker-compose -f docker/docker-compose.yml down -v --rmi all
    docker-compose -f docker/docker-compose.dev.yml down -v --rmi all
    print_success "Limpeza concluída!"
}

health_check() {
    print_info "Verificando saúde da aplicação..."
    if curl -f http://localhost:3000/api/health &>/dev/null; then
        print_success "Aplicação está saudável!"
        curl -s http://localhost:3000/api/health | jq .
    else
        print_error "Aplicação não está respondendo!"
        exit 1
    fi
}

shell_access() {
    print_info "Acessando shell do container..."
    docker-compose -f docker/docker-compose.yml exec extrativo-frontend sh
}

# Main loop
while true; do
    show_menu
    read -p "Opção: " choice
    echo ""

    case $choice in
        1) dev_mode ;;
        2) prod_mode ;;
        3) build_prod ;;
        4) stop_all ;;
        5) view_logs ;;
        6) clean_all ;;
        7) health_check ;;
        8) shell_access ;;
        0) print_info "Saindo..."; exit 0 ;;
        *) print_error "Opção inválida!" ;;
    esac

    echo ""
    read -p "Pressione ENTER para continuar..."
done

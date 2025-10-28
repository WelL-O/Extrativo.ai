# 🐳 Guia Docker - Extrativo.ai

Este guia explica como executar o projeto Extrativo.ai usando Docker e Docker Compose.

## 📋 Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) instalado
- Arquivo `.env` configurado com as variáveis de ambiente

## 🚀 Início Rápido

### 1. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e preencha os valores:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase.

### 2. Modo Desenvolvimento

Para rodar em modo desenvolvimento com hot reload:

```bash
docker-compose -f docker-compose.dev.yml up
```

A aplicação estará disponível em: `http://localhost:3000`

### 3. Modo Produção

#### Build e execução:

```bash
docker-compose up --build
```

#### Executar em background:

```bash
docker-compose up -d
```

#### Ver logs:

```bash
docker-compose logs -f
```

#### Parar containers:

```bash
docker-compose down
```

## 📁 Arquitetura

### Dockerfile

- **Multi-stage build** para otimizar o tamanho da imagem
- **Stage 1 (deps)**: Instala dependências de produção
- **Stage 2 (builder)**: Compila a aplicação Next.js
- **Stage 3 (runner)**: Imagem final otimizada com apenas os arquivos necessários

### Docker Compose

#### `docker-compose.yml` (Produção)
- Imagem otimizada e compilada
- Health checks configurados
- Restart automático em caso de falha
- Network isolada

#### `docker-compose.dev.yml` (Desenvolvimento)
- Hot reload ativado
- Volumes montados para desenvolvimento
- Node_modules em volume separado

## 🔧 Comandos Úteis

### Build da imagem sem cache:

```bash
docker-compose build --no-cache
```

### Acessar shell do container:

```bash
docker-compose exec extrativo-frontend sh
```

### Remover volumes e containers:

```bash
docker-compose down -v
```

### Ver status dos containers:

```bash
docker-compose ps
```

### Health Check manual:

```bash
curl http://localhost:3000/api/health
```

## 🛡️ Segurança

- Container roda com usuário não-root (`nextjs:nodejs`)
- Variáveis de ambiente isoladas
- `.dockerignore` configurado para não incluir arquivos sensíveis
- Telemetria do Next.js desabilitada

## 📊 Monitoramento

O health check está configurado para verificar a saúde da aplicação:

- **Endpoint**: `/api/health`
- **Intervalo**: 30 segundos
- **Timeout**: 10 segundos
- **Retries**: 3 tentativas

## 🐛 Troubleshooting

### Container não inicia

Verifique as variáveis de ambiente:
```bash
docker-compose config
```

### Erro de permissão

Certifique-se de que o Docker tem permissão para acessar os arquivos.

### Hot reload não funciona no Windows

O `WATCHPACK_POLLING=true` está configurado no `docker-compose.dev.yml` para resolver isso.

### Build muito lento

Use cache do Docker:
```bash
docker-compose build
```

## 📝 Notas

- O modo standalone do Next.js (`output: 'standalone'`) está ativado para otimizar a imagem Docker
- A porta padrão é `3000`, mas pode ser alterada no `docker-compose.yml`
- Os logs do Next.js são direcionados para stdout/stderr para melhor integração com Docker

## 🔗 Links Úteis

- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Supabase Documentation](https://supabase.com/docs)

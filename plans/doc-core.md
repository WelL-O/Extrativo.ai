# 📘 Documentação Completa: Extrativo-Core

**Motor de Extração de Dados do Google Maps**

---

## 📑 Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura](#2-arquitetura)
3. [Sistema de Jobs](#3-sistema-de-jobs)
4. [Dados Extraídos](#4-dados-extraídos)
5. [Modos de Execução](#5-modos-de-execução)
6. [Fluxo de Extração](#6-fluxo-de-extração)
7. [API Reference](#7-api-reference)
8. [Configuração & Deploy](#8-configuração--deploy)
9. [Integração com Frontend](#9-integração-com-frontend)
10. [Performance & Escalabilidade](#10-performance--escalabilidade)
11. [Troubleshooting](#11-troubleshooting)
12. [Referência de Código](#12-referência-de-código)

---

## 1. Visão Geral

### O que é o Extrativo-Core?

O **extrativo-core** é um motor de extração de dados do Google Maps altamente escalável e robusto, construído em **Go 1.24+**. É baseado no projeto open-source `google-maps-scraper` do gosom, adaptado para as necessidades do projeto Extrativo.

### Características Principais

- ✅ **Extração Completa**: 33+ campos de dados por negócio
- ✅ **Múltiplos Modos**: CLI, Web UI, Database distribuído, AWS Lambda
- ✅ **Escalável**: De scraping local até Kubernetes com centenas de workers
- ✅ **Anti-Detecção**: Playwright com stealth mode + suporte a proxies
- ✅ **Reviews**: Extração de até ~300 reviews por lugar
- ✅ **Emails**: Extração automática de emails dos websites
- ✅ **API REST**: Interface completa para integração

### Casos de Uso

- 🎯 Geração de leads para vendas
- 📊 Pesquisa de mercado e análise competitiva
- 🗄️ Construção de bases de dados de negócios
- 📍 Mapeamento de estabelecimentos por região
- 📧 Coleta de contatos para marketing

---

## 2. Arquitetura

### 2.1 Estrutura do Projeto

```
extrativo-core/
├── main.go                 # Entry point, factory pattern para runners
├── cmd/                    # Ferramentas de linha de comando
├── gmaps/                  # 🎯 CORE: Lógica de extração do Google Maps
│   ├── job.go             # GmapJob (busca de lugares)
│   ├── place.go           # PlaceJob (extração de detalhes)
│   ├── emailjob.go        # EmailJob (extração de emails)
│   ├── entry.go           # Estrutura de dados (33+ campos)
│   ├── reviews.go         # Extração de reviews estendidas
│   ├── searchjob.go       # Modo fast (API do Google)
│   └── multiple.go        # Processamento de múltiplos resultados
├── runner/                 # 🚀 Modos de execução
│   ├── filerunner/        # Modo CLI simples
│   ├── databaserunner/    # Modo distribuído (PostgreSQL)
│   ├── webrunner/         # Modo Web UI + API
│   ├── lambdaaws/         # Modo serverless (AWS Lambda)
│   └── installplaywright/ # Setup do navegador
├── web/                    # 🌐 Servidor Web + API REST
│   ├── web.go             # HTTP handlers
│   ├── service.go         # Lógica de negócio
│   ├── job.go             # Modelo de Job
│   ├── sqlite/            # Storage para Web mode
│   └── static/            # UI (HTML + HTMX)
├── postgres/               # 💾 Integração PostgreSQL
│   ├── provider.go        # Job queue distribuído
│   └── resultwriter.go    # Gravação de resultados
├── deduper/               # 🔄 Sistema de deduplicação
├── exiter/                # 🚪 Monitor de conclusão
├── s3uploader/            # ☁️ Upload para S3 (Lambda mode)
├── tlmt/                  # 📊 Telemetria (PostHog)
├── scripts/               # 📜 Migrations SQL
└── Dockerfile             # 🐳 Containerização
```

### 2.2 Modos de Execução

O extrativo-core possui **6 modos de execução** diferentes:

| Modo | ID | Uso | Escalabilidade |
|------|-----|-----|----------------|
| **File** | 1 | CLI simples, testes | Vertical (CPU) |
| **Database** | 2 | Produção distribuída | Horizontal (add workers) |
| **Database Produce** | 3 | Popular fila de jobs | N/A |
| **Install Playwright** | 4 | Setup inicial | N/A |
| **Web** | 5 | UI local + API | Vertical |
| **AWS Lambda** | 6 | Serverless | Automática (AWS) |

### 2.3 Stack Tecnológico

**Core:**
- **Go 1.24+**: Linguagem principal
- **Playwright**: Automação de navegador (Chromium)
- **Goquery**: Parsing de HTML
- **ScrapeMatE**: Framework de scraping (custom)

**Storage:**
- **PostgreSQL 15+**: Job queue + resultados (modo distribuído)
- **SQLite**: Storage local (Web mode)
- **AWS S3**: Armazenamento de resultados (Lambda mode)

**Web:**
- **net/http**: Servidor HTTP nativo
- **HTMX**: UI dinâmica
- **OpenAPI**: Documentação da API

---

## 3. Sistema de Jobs

### 3.1 Hierarquia de Jobs

O sistema utiliza 3 tipos de jobs que herdam de `scrapemate.Job`:

```
1️⃣ GmapJob (Search Job)
    ↓ [Gera múltiplos]
    2️⃣ PlaceJob (Detail Extraction)
        ↓ [Opcional]
        3️⃣ EmailJob (Email Extraction)
```

### 3.2 GmapJob - Busca de Lugares

**Arquivo:** `gmaps/job.go`

**Propósito:** Buscar lugares no Google Maps que correspondem a uma query.

**Processo:**
1. Constrói URL de busca: `https://www.google.com/maps/search/{query}`
2. Navega com Playwright
3. Lida com popup de cookies (clica em "Rejeitar")
4. Scroll na lista de resultados (N vezes configurável)
5. Extrai URLs dos lugares encontrados
6. **Cria um PlaceJob para cada URL**

**Configurações:**
- `depth`: Profundidade do scroll (default: 10)
- `lang`: Idioma da interface (default: "en")
- `geo`: Coordenadas para busca geolocalizada

**Exemplo de Query:**
```
restaurantes em São Paulo
hotéis em Lisboa #!# HOTEIS_LISBOA_2024
cafés próximos a -23.5505,-46.6333
```

### 3.3 PlaceJob - Extração de Detalhes

**Arquivo:** `gmaps/place.go`

**Propósito:** Extrair todos os dados de um lugar específico.

**Processo:**
1. Navega até a URL do lugar
2. Executa JavaScript para extrair `APP_INITIALIZATION_STATE`
3. Faz parsing de arrays JSON profundamente aninhados
4. Extrai 33+ campos de dados
5. *[Opcional]* Extrai reviews estendidas (até ~300)
6. *[Opcional]* Cria EmailJob se houver website

**Técnica de Extração:**

O Google armazena dados em estruturas JavaScript como:
```javascript
window.APP_INITIALIZATION_STATE[3][6][4][8][0]
```

O extrativo-core usa funções helpers como `getNthElementAndCast[T]` para navegar esses arrays de forma type-safe.

**Exemplo de Parsing:**
```go
// Extrair título
title := getNthElementAndCast[string](data, 6, 11)

// Extrair coordenadas
lat := getNthElementAndCast[float64](data, 6, 9, 2)
lon := getNthElementAndCast[float64](data, 6, 9, 3)
```

### 3.4 EmailJob - Extração de Emails

**Arquivo:** `gmaps/emailjob.go`

**Propósito:** Extrair emails do website do negócio.

**Processo:**
1. Faz fetch HTTP do website
2. Procura por links `mailto:`
3. Aplica regex para encontrar emails no HTML
4. Valida formato dos emails
5. Filtra emails de redes sociais (Facebook, Instagram, etc)

**Regex Utilizado:**
```regex
[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}
```

**Limitações Atuais:**
- Apenas verifica a homepage
- Não navega em páginas de contato/sobre
- Emails ofuscados (como `info [at] example.com`) não são detectados

### 3.5 Fast Mode - Modo API

**Arquivo:** `gmaps/searchjob.go`

**Propósito:** Extração rápida usando API do Google Maps (não scraping).

**Características:**
- ⚡ Muito mais rápido (sem navegador)
- 📊 Máximo de 21 resultados por query
- 📍 Requer coordenadas geográficas (lat, lon, radius)
- ⚠️ Modo Beta (pode sofrer bloqueios)

**Quando Usar:**
- Buscas localizadas com poucos resultados
- Prototipagem rápida
- Validação de queries

**Exemplo:**
```bash
./google-maps-scraper \
  -fast-mode \
  -geo "-23.5505,-46.6333" \
  -radius 5000 \
  -zoom 14 \
  -input queries.txt
```

---

## 4. Dados Extraídos

### 4.1 Estrutura de Dados (Entry)

**Arquivo:** `gmaps/entry.go`

O extrativo-core extrai **33+ campos** por negócio:

#### Informações Básicas

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `input_id` | string | ID customizado da query | "SP_RESTAURANTS_2024" |
| `title` | string | Nome do negócio | "Joe's Pizza" |
| `category` | string | Categoria principal | "Pizza restaurant" |
| `categories` | string | Todas as categorias | "Pizza, Italian, Delivery" |
| `link` | string | URL do Google Maps | "https://maps.google.com/?cid=..." |
| `cid` | string | ID único do Google Maps | "12345678901234567890" |
| `data_id` | string | ID interno do Google | "0x89c259..." |

#### Localização

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `address` | string | Endereço resumido | "123 Main St, New York, NY 10001" |
| `complete_address` | JSON | Endereço estruturado | Ver seção 4.2 |
| `latitude` | float64 | Latitude | 40.7128 |
| `longitude` | float64 | Longitude | -74.0060 |
| `plus_code` | string | Google Plus Code | "P27Q+MC New York" |
| `timezone` | string | Fuso horário | "America/New_York" |

#### Contato

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `phone` | string | Telefone principal | "+1 212-555-1234" |
| `website` | string | Site oficial | "https://joespizza.com" |
| `emails` | []string | Emails extraídos | ["info@joespizza.com"] |

#### Avaliações

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `review_count` | int | Total de reviews | 1523 |
| `review_rating` | float64 | Nota média | 4.5 |
| `reviews_per_rating` | JSON | Distribuição de notas | `{"5": 1200, "4": 200, ...}` |
| `reviews_link` | string | Link para reviews | "https://maps.google.com/..." |
| `user_reviews` | []JSON | Reviews básicas (8) | Ver seção 4.3 |
| `user_reviews_extended` | []JSON | Reviews estendidas (~300) | Ver seção 4.3 |

#### Horários & Fluxo

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `open_hours` | JSON | Horários de funcionamento | Ver seção 4.4 |
| `popular_times` | JSON | Horários populares | Ver seção 4.4 |

#### Mídia

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `thumbnail` | string | Foto de capa (URL) | "https://lh3.googleusercontent.com/..." |
| `images` | []JSON | Todas as fotos | `[{"title": "Interior", "url": "..."}]` |

#### Serviços

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `reservations` | bool | Aceita reservas | true |
| `order_online` | string | Link para pedidos online | "https://ubereats.com/..." |
| `menu` | string | Link do menu | "https://joespizza.com/menu" |

#### Outros

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `status` | string | Status atual | "Open", "Closed", "Permanently closed" |
| `description` | string | Descrição do negócio | "Family-owned pizzeria since 1975" |
| `price_range` | string | Faixa de preço | "$$" |
| `about` | JSON | Características/opções | Ver seção 4.5 |
| `owner` | JSON | Dados do proprietário | `{"id": "...", "name": "Joe Smith", "link": "..."}` |

### 4.2 Complete Address (Estrutura)

```json
{
  "borough": "Manhattan",
  "street": "123 Main Street",
  "city": "New York",
  "postal_code": "10001",
  "state": "NY",
  "country": "United States",
  "country_code": "US"
}
```

### 4.3 User Reviews (Estrutura)

**Reviews Básicas** (primeiras 8):
```json
{
  "name": "John Doe",
  "profile_picture": "https://lh3.googleusercontent.com/...",
  "rating": 5,
  "description": "Amazing pizza! Best in the city.",
  "images": ["https://..."],
  "date": "2 months ago"
}
```

**Reviews Estendidas** (`--extra-reviews`):
- Até ~300 reviews
- Dados mais completos
- Ordenação cronológica

### 4.4 Open Hours & Popular Times

**Open Hours:**
```json
{
  "Monday": ["9:00 AM", "10:00 PM"],
  "Tuesday": ["9:00 AM", "10:00 PM"],
  "Wednesday": ["Closed"],
  "Thursday": ["9:00 AM", "10:00 PM"],
  "Friday": ["9:00 AM", "11:00 PM"],
  "Saturday": ["10:00 AM", "11:00 PM"],
  "Sunday": ["10:00 AM", "9:00 PM"]
}
```

**Popular Times:**
```json
{
  "Monday": {
    "0": 10,   // 00h: 10% de ocupação
    "6": 45,   // 06h: 45%
    "12": 90,  // 12h: 90% (pico)
    "18": 70,  // 18h: 70%
    "23": 15   // 23h: 15%
  },
  "Tuesday": {...}
}
```
*Valores: 0-100 representando % de ocupação*

### 4.5 About (Características)

```json
{
  "Service options": ["Dine-in", "Takeout", "Delivery"],
  "Accessibility": ["Wheelchair accessible entrance"],
  "Offerings": ["Comfort food", "Quick bite"],
  "Dining options": ["Lunch", "Dinner", "Dessert"],
  "Amenities": ["Good for kids", "High chairs"],
  "Atmosphere": ["Casual", "Cozy"],
  "Payments": ["Credit cards", "Debit cards"]
}
```

---

## 5. Modos de Execução

### 5.1 File Runner - Modo CLI

**Arquivo:** `runner/filerunner/filerunner.go`

**Quando Usar:**
- Testes locais
- Scraping de até ~100 queries
- Prototipagem
- Resultados em arquivo único

**Vantagens:**
- ✅ Simples de usar
- ✅ Não requer database
- ✅ Ideal para testes

**Desvantagens:**
- ❌ Não escala horizontalmente
- ❌ Se parar, perde progresso
- ❌ Limitado ao CPU da máquina

**Exemplo de Uso:**

```bash
# 1. Criar arquivo de queries
cat > queries.txt << EOF
restaurantes em São Paulo
cafés em Copacabana
padarias em Porto Alegre
EOF

# 2. Executar scraper
./google-maps-scraper \
  -input queries.txt \
  -results output.csv \
  -depth 10 \
  -c 4 \
  -email \
  -extra-reviews \
  -lang pt-BR \
  -exit-on-inactivity 10m

# 3. Resultados em output.csv
```

**Parâmetros Importantes:**
- `-c`: Concorrência (default: CPU/2)
- `-depth`: Profundidade de scroll (default: 10)
- `-email`: Habilita extração de emails
- `-extra-reviews`: Busca até 300 reviews
- `-exit-on-inactivity`: Encerra após X tempo sem atividade

### 5.2 Database Runner - Modo Distribuído

**Arquivo:** `runner/databaserunner/databaserunner.go`

**Quando Usar:**
- Produção com milhares de queries
- Múltiplas máquinas trabalhando simultaneamente
- Necessidade de tolerância a falhas
- Resultados em banco de dados

**Arquitetura:**

```
PostgreSQL (Job Queue)
    ↓
┌─────────┬─────────┬─────────┐
│ Worker 1│ Worker 2│ Worker 3│  ... (N workers)
└─────────┴─────────┴─────────┘
    ↓         ↓         ↓
PostgreSQL (Results Table)
```

**Vantagens:**
- ✅ Escalabilidade horizontal ilimitada
- ✅ Tolerância a falhas (workers podem reiniciar)
- ✅ Priorização de jobs
- ✅ Monitoramento em tempo real

**Desvantagens:**
- ❌ Requer PostgreSQL configurado
- ❌ Setup mais complexo

**Schema do Banco:**

```sql
-- Tabela de jobs
CREATE TABLE gmaps_jobs (
    id UUID PRIMARY KEY,
    priority SMALLINT NOT NULL,
    payload_type TEXT NOT NULL,  -- 'search', 'place', 'email'
    payload BYTEA NOT NULL,       -- Job serializado (GOB)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL          -- 'new' ou 'queued'
);

-- Tabela de resultados
CREATE TABLE results (
    id SERIAL PRIMARY KEY,
    input_id TEXT,
    title TEXT,
    category TEXT,
    address TEXT,
    phone TEXT,
    website TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    review_count INTEGER,
    review_rating NUMERIC,
    -- ... outros campos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Passo a Passo:**

```bash
# 1. Subir PostgreSQL
docker-compose -f docker-compose.dev.yaml up -d

# 2. Popular fila de jobs (Producer Mode)
./google-maps-scraper \
  -produce \
  -dsn "postgres://user:pass@localhost:5432/gmapsdb" \
  -input big-queries.txt

# 3. Iniciar workers (em múltiplas máquinas)
# Máquina 1:
./google-maps-scraper \
  -dsn "postgres://user:pass@db.example.com:5432/gmapsdb" \
  -c 8

# Máquina 2:
./google-maps-scraper \
  -dsn "postgres://user:pass@db.example.com:5432/gmapsdb" \
  -c 8

# Máquina 3:
./google-maps-scraper \
  -dsn "postgres://user:pass@db.example.com:5432/gmapsdb" \
  -c 8

# 4. Monitorar progresso
psql -h db.example.com -U user -d gmapsdb -c \
  "SELECT status, COUNT(*) FROM gmaps_jobs GROUP BY status;"

# 5. Exportar resultados
psql -h db.example.com -U user -d gmapsdb -c \
  "COPY results TO '/tmp/results.csv' WITH CSV HEADER;"
```

**Mecanismo de Distribuição:**

O segredo está na query com `FOR UPDATE SKIP LOCKED`:

```sql
UPDATE gmaps_jobs
SET status = 'queued'
WHERE id IN (
    SELECT id FROM gmaps_jobs
    WHERE status = 'new'
    ORDER BY priority ASC, created_at ASC
    FOR UPDATE SKIP LOCKED  -- ⭐ Evita deadlocks!
    LIMIT 10
)
RETURNING *
```

Cada worker pega 10 jobs atomicamente, sem conflitos.

### 5.3 Web Runner - Modo UI

**Arquivo:** `runner/webrunner/webrunner.go`

**Quando Usar:**
- Interface gráfica para usuários
- Jobs sob demanda
- Testes locais com visualização
- API REST para integrações

**Arquitetura:**

```
┌──────────────────┐
│   HTTP Server    │ :8080
│  (web/web.go)    │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐  ┌─▼──────────────┐
│  UI   │  │ Background     │
│(HTMX) │  │ Worker         │
└───────┘  │ (polls SQLite) │
           └────────────────┘
                  │
           ┌──────▼──────┐
           │   SQLite    │
           │ (jobs.db)   │
           └─────────────┘
```

**Fluxo de Execução:**

1. Usuário submete job via UI ou API
2. Job salvo em SQLite com status `pending`
3. Background worker (goroutine) faz polling a cada 1s
4. Worker pega job, marca como `working`
5. Executa scraping (cria ScrapeMate engine)
6. Salva CSV em `dataFolder/{job_id}.csv`
7. Marca job como `ok` ou `failed`

**Iniciar Web Server:**

```bash
# Básico
./google-maps-scraper -web

# Com configurações
./google-maps-scraper \
  -web \
  -addr ":8080" \
  -data-folder ./webdata \
  -c 4
```

**Acessar:**
- UI: http://localhost:8080
- API Docs: http://localhost:8080/api/docs

**Rotas da UI:**
- `GET /` - Home page
- `GET /scrape` - Formulário de criação de job
- `GET /jobs` - Lista de jobs
- `GET /download/{id}` - Download do CSV
- `DELETE /delete/{id}` - Deletar job

### 5.4 AWS Lambda Runner

**Arquivo:** `runner/lambdaaws/`

**Quando Usar:**
- Redução de custos (pay-per-use)
- Scraping esporádico
- Escalabilidade automática
- Zero manutenção de servidores

**Arquitetura:**

```
┌──────────────────┐
│  Lambda Invoker  │ (sua máquina local)
└────────┬─────────┘
         │ Divide em chunks
         ├────────────────┬────────────────┐
         │                │                │
    ┌────▼───┐       ┌────▼───┐      ┌────▼───┐
    │Lambda 1│       │Lambda 2│  ... │Lambda N│
    └────┬───┘       └────┬───┘      └────┬───┘
         │                │                │
         └────────────────┴────────────────┘
                         │
                    ┌────▼────┐
                    │   S3    │
                    │ Bucket  │
                    └─────────┘
```

**Setup:**

```bash
# 1. Build para Linux
GOOS=linux GOARCH=amd64 go build -o bootstrap main.go
zip function.zip bootstrap

# 2. Deploy para AWS Lambda
aws lambda create-function \
  --function-name gmaps-scraper \
  --runtime provided.al2 \
  --handler bootstrap \
  --zip-file fileb://function.zip \
  --role arn:aws:iam::123456789:role/lambda-role \
  --timeout 900 \
  --memory-size 2048

# 3. Executar com Invoker
./google-maps-scraper \
  -aws-lambda-invoker \
  -function-name gmaps-scraper \
  -s3-bucket my-results-bucket \
  -input queries.txt \
  -aws-lambda-chunk-size 100
```

**Resultado:**
- Cada Lambda processa 100 queries
- Resultados salvos em `s3://my-results-bucket/results-{chunk}.csv`

**Custos Estimados:**
- 10.000 queries × 16 resultados = 160.000 jobs
- ~5 horas com concurrency 8
- Lambda: 5h × 2GB = ~$0.50
- Muito mais barato que manter servidor 24/7!

---

## 6. Fluxo de Extração

### 6.1 Modo Normal (Browser Automation)

```
┌─────────────────────────────────────────────────────────┐
│                  1. INPUT DO USUÁRIO                     │
│          Query: "restaurantes em São Paulo"              │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  2. GMAP JOB CRIADO                      │
│  URL: maps.google.com/search/restaurantes+em+São+Paulo  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│           3. PLAYWRIGHT BROWSER ACTIONS                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │ • Navegar para URL                               │   │
│  │ • Lidar com popup de cookies (rejeitar)         │   │
│  │ • Aguardar feed carregar                         │   │
│  │ • Scroll N vezes (depth parameter)               │   │
│  │ • Extrair HTML final                             │   │
│  └─────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              4. PROCESSAR RESPOSTA HTML                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │ • Parse HTML com goquery                         │   │
│  │ • Encontrar todos <a> no feed                    │   │
│  │ • Extrair URLs dos lugares                       │   │
│  │ • Criar PlaceJob para cada URL                   │   │
│  └─────────────────────────────────────────────────┘   │
│           Exemplo: 16 lugares encontrados                │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│         5. PLACE JOB EXECUTION (por lugar)               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ • Navegar para URL do lugar                      │   │
│  │ • Executar JavaScript:                           │   │
│  │   window.APP_INITIALIZATION_STATE                │   │
│  │ • Parse arrays JSON aninhados                    │   │
│  │ • Extrair 33 campos de dados                     │   │
│  │ • [Opcional] Buscar reviews estendidas (~300)    │   │
│  │ • [Opcional] Criar EmailJob                      │   │
│  └─────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼ (se --email habilitado)
┌─────────────────────────────────────────────────────────┐
│         6. EMAIL JOB EXECUTION (se houver site)          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ • Visitar website do negócio                     │   │
│  │ • Procurar por links mailto:                     │   │
│  │ • Regex search por padrões de email              │   │
│  │ • Validar formato de emails                      │   │
│  │ • Adicionar emails ao Entry                      │   │
│  └─────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    7. OUTPUT                             │
│     Gravar Entry em CSV / JSON / PostgreSQL              │
│                                                          │
│  Title: "Restaurante Fogo de Chão"                      │
│  Category: "Brazilian restaurant"                        │
│  Phone: "+55 11 3123-4567"                               │
│  Rating: 4.5 ⭐ (2,341 reviews)                          │
│  Emails: ["contato@fogodechao.com.br"]                  │
│  ... (+ 28 campos)                                       │
└─────────────────────────────────────────────────────────┘
```

**Tempo Estimado:**
- 1 GmapJob (depth 10): ~30s
- 1 PlaceJob (sem reviews): ~5s
- 1 PlaceJob (com reviews): ~15s
- 1 EmailJob: ~2s

**Total para 1 query com 16 resultados:**
- Com email: ~30s + (16 × 7s) = ~2min
- Com concurrency 4: ~30s (paralelização)

### 6.2 Modo Fast (API)

```
┌─────────────────────────────────────────────────────────┐
│                  1. INPUT DO USUÁRIO                     │
│     Query: "restaurantes"                                │
│     Location: lat=-23.5505, lon=-46.6333                 │
│     Radius: 5000m, Zoom: 14                              │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│               2. SEARCH JOB CRIADO                       │
│  Constrói URL da API do Google Maps com parâmetro 'pb'  │
│  https://maps.google.com/search?tbm=map&pb=...           │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              3. HTTP FETCH (sem browser)                 │
│         GET para API do Google Maps                      │
│              ⚡ Muito mais rápido!                       │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  4. PARSE RESPONSE                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │ • JSON array com dados dos negócios              │   │
│  │ • Extrair campos básicos (max 21 resultados)     │   │
│  │ • Calcular distância haversine                   │   │
│  │ • Filtrar por radius                             │   │
│  │ • Ordenar por proximidade                        │   │
│  └─────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    5. OUTPUT                             │
│   Gravar entries diretamente (sem PlaceJob)              │
│          ⚡ Sem navegação adicional!                     │
└─────────────────────────────────────────────────────────┘
```

**Vantagens:**
- ⚡ 10-20x mais rápido
- 💰 Menor uso de recursos (sem browser)
- 🚀 Ideal para validação rápida

**Desvantagens:**
- 📊 Max 21 resultados
- 📉 Menos campos de dados
- ⚠️ Pode sofrer bloqueios

---

## 7. API Reference

### 7.1 Visão Geral

O modo Web expõe uma **API REST completa** para gerenciamento de jobs.

**Base URL:** `http://localhost:8080/api/v1`

**Documentação Interativa:** `http://localhost:8080/api/docs` (ReDoc)

**Autenticação:** Nenhuma (adicionar na integração com frontend)

### 7.2 Endpoints

#### POST /api/v1/jobs

Cria um novo job de scraping.

**Request Body:**
```json
{
  "query": "restaurantes em São Paulo",
  "lang": "pt-BR",
  "depth": 10,
  "maxTime": 3600,
  "email": true,
  "extraReviews": true,
  "proxy": "http://user:pass@proxy.com:8080"
}
```

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "created_at": "2024-11-02T10:30:00Z"
}
```

#### GET /api/v1/jobs

Lista todos os jobs.

**Response:** `200 OK`
```json
{
  "jobs": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "query": "restaurantes em São Paulo",
      "status": "ok",
      "created_at": "2024-11-02T10:30:00Z",
      "finished_at": "2024-11-02T10:35:00Z",
      "results_count": 156
    },
    {
      "id": "660f9511-f30c-52e5-b827-557766551111",
      "query": "hotéis em Lisboa",
      "status": "working",
      "created_at": "2024-11-02T11:00:00Z",
      "progress": 45
    }
  ]
}
```

#### GET /api/v1/jobs/{id}

Obtém detalhes de um job específico.

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "query": "restaurantes em São Paulo",
  "status": "ok",
  "config": {
    "lang": "pt-BR",
    "depth": 10,
    "email": true,
    "extraReviews": true
  },
  "created_at": "2024-11-02T10:30:00Z",
  "started_at": "2024-11-02T10:30:05Z",
  "finished_at": "2024-11-02T10:35:00Z",
  "duration_seconds": 295,
  "results_count": 156,
  "error": null
}
```

**Possíveis Status:**
- `pending`: Aguardando processamento
- `working`: Em execução
- `ok`: Concluído com sucesso
- `failed`: Falhou (ver campo `error`)

#### GET /api/v1/jobs/{id}/download

Faz download dos resultados em CSV.

**Response:** `200 OK`
```
Content-Type: text/csv
Content-Disposition: attachment; filename="results_550e8400.csv"

input_id,link,title,category,address,phone,...
SP_2024,https://maps.google.com/?cid=123,"Joe's Pizza",...
```

#### DELETE /api/v1/jobs/{id}

Deleta um job e seus resultados.

**Response:** `204 No Content`

### 7.3 Exemplos de Integração

#### JavaScript (Fetch API)

```javascript
// Criar job
const response = await fetch('http://localhost:8080/api/v1/jobs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'cafés em Porto',
    lang: 'pt-BR',
    depth: 5,
    email: true
  })
});

const { id } = await response.json();
console.log('Job criado:', id);

// Polling para status
const pollStatus = async (jobId) => {
  const res = await fetch(`http://localhost:8080/api/v1/jobs/${jobId}`);
  const job = await res.json();

  if (job.status === 'ok') {
    console.log('Job concluído! Resultados:', job.results_count);
    // Download do CSV
    window.location.href = `http://localhost:8080/api/v1/jobs/${jobId}/download`;
  } else if (job.status === 'failed') {
    console.error('Job falhou:', job.error);
  } else {
    // Continuar polling
    setTimeout(() => pollStatus(jobId), 5000);
  }
};

pollStatus(id);
```

#### Python (requests)

```python
import requests
import time

# Criar job
response = requests.post(
    'http://localhost:8080/api/v1/jobs',
    json={
        'query': 'pizzarias em Curitiba',
        'lang': 'pt-BR',
        'depth': 10,
        'email': True,
        'extraReviews': False
    }
)

job_id = response.json()['id']
print(f'Job criado: {job_id}')

# Polling
while True:
    status_response = requests.get(f'http://localhost:8080/api/v1/jobs/{job_id}')
    job = status_response.json()

    if job['status'] == 'ok':
        print(f"Concluído! {job['results_count']} resultados")
        # Download CSV
        csv_response = requests.get(f'http://localhost:8080/api/v1/jobs/{job_id}/download')
        with open('results.csv', 'wb') as f:
            f.write(csv_response.content)
        break
    elif job['status'] == 'failed':
        print(f"Falhou: {job['error']}")
        break
    else:
        print(f"Status: {job['status']}")
        time.sleep(5)
```

---

## 8. Configuração & Deploy

### 8.1 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DISABLE_TELEMETRY` | Desabilita telemetria PostHog | `1` |
| `MY_AWS_ACCESS_KEY` | AWS Access Key (Lambda mode) | `AKIAIOSFODNN7EXAMPLE` |
| `MY_AWS_SECRET_KEY` | AWS Secret Key | `wJalrXUtnFEMI/K7MDENG/...` |
| `MY_AWS_REGION` | AWS Region | `us-east-1` |
| `PLAYWRIGHT_BROWSERS_PATH` | Caminho customizado para navegadores | `/opt/browsers` |

### 8.2 Docker

#### Build da Imagem

```bash
cd extrativo-core
docker build -t extrativo-core:latest .
```

**Multi-stage Build:**
- Stage 1: Ubuntu 20.04 (instala Playwright)
- Stage 2: Golang (compila aplicação)
- Stage 3: Debian slim (imagem final ~800MB)

#### Executar CLI Mode

```bash
docker run --rm \
  -v $(pwd)/queries.txt:/input.txt \
  -v $(pwd)/results:/output \
  extrativo-core:latest \
  -input /input.txt \
  -results /output/results.csv \
  -depth 5 \
  -exit-on-inactivity 10m
```

#### Executar Web Mode

```bash
docker run -d \
  --name extrativo-web \
  -p 8080:8080 \
  -v $(pwd)/webdata:/data \
  extrativo-core:latest \
  -web \
  -data-folder /data \
  -addr :8080
```

Acessar: http://localhost:8080

### 8.3 Docker Compose

**Arquivo:** `docker-compose.dev.yaml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15.2
    environment:
      POSTGRES_USER: gmaps
      POSTGRES_PASSWORD: secretpassword
      POSTGRES_DB: gmapsdb
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U gmaps"]
      interval: 10s
      timeout: 5s
      retries: 5

  migrations:
    image: migrate/migrate:v4.15.2
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./scripts/migrations:/migrations
    command: >
      -path=/migrations
      -database postgres://gmaps:secretpassword@postgres:5432/gmapsdb?sslmode=disable
      up

  scraper:
    build: .
    depends_on:
      - postgres
      - migrations
    environment:
      - DISABLE_TELEMETRY=1
    command: >
      -dsn "postgres://gmaps:secretpassword@postgres:5432/gmapsdb?sslmode=disable"
      -c 8
      -depth 10
      -email
    deploy:
      replicas: 3  # 3 workers simultâneos

volumes:
  pgdata:
```

**Iniciar:**
```bash
docker-compose -f docker-compose.dev.yaml up -d
```

### 8.4 Kubernetes

**Deployment Example:**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: extrativo-config
data:
  DSN: "postgres://user:pass@postgres-service:5432/gmapsdb"
  CONCURRENCY: "8"
  DEPTH: "10"

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: extrativo-scraper
  labels:
    app: extrativo
spec:
  replicas: 5  # Escalar conforme necessário
  selector:
    matchLabels:
      app: extrativo
  template:
    metadata:
      labels:
        app: extrativo
    spec:
      containers:
      - name: scraper
        image: extrativo-core:latest
        args:
          - "-dsn"
          - "$(DSN)"
          - "-c"
          - "$(CONCURRENCY)"
          - "-depth"
          - "$(DEPTH)"
          - "-email"
          - "-extra-reviews"
        envFrom:
        - configMapRef:
            name: extrativo-config
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          exec:
            command:
            - sh
            - -c
            - "pgrep google-maps-scraper"
          initialDelaySeconds: 30
          periodSeconds: 30

---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
```

**Deploy:**
```bash
kubectl apply -f k8s-deployment.yaml
```

**Escalar:**
```bash
kubectl scale deployment extrativo-scraper --replicas=10
```

**Monitorar:**
```bash
kubectl logs -f deployment/extrativo-scraper
kubectl top pods -l app=extrativo
```

### 8.5 Systemd Service (Linux)

**Arquivo:** `/etc/systemd/system/extrativo-scraper.service`

```ini
[Unit]
Description=Extrativo Google Maps Scraper
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=extrativo
Group=extrativo
WorkingDirectory=/opt/extrativo-core
ExecStart=/opt/extrativo-core/google-maps-scraper \
  -dsn "postgres://user:pass@localhost:5432/gmapsdb" \
  -c 8 \
  -depth 10 \
  -email
Restart=on-failure
RestartSec=10s
Environment="DISABLE_TELEMETRY=1"

[Install]
WantedBy=multi-user.target
```

**Comandos:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable extrativo-scraper
sudo systemctl start extrativo-scraper
sudo systemctl status extrativo-scraper
sudo journalctl -u extrativo-scraper -f
```

### 8.6 Proxy Configuration

#### Suporte a Proxies

O extrativo-core suporta múltiplos protocolos:
- HTTP
- HTTPS
- SOCKS5
- SOCKS5H (resolve DNS via proxy)

#### Formato

```
scheme://username:password@host:port
```

#### Exemplos

```bash
# HTTP proxy
-proxies "http://user:pass@proxy.example.com:8080"

# SOCKS5 proxy
-proxies "socks5://user:pass@proxy.example.com:1080"

# Múltiplos proxies (rotação automática)
-proxies "http://proxy1.com:8080,http://proxy2.com:8080,socks5://proxy3.com:1080"
```

#### Provedores Recomendados

1. **Decodo**: 125M+ IPs, 195+ localizações
2. **Evomi**: Qualidade suíça, $0.49/GB
3. **Thordata**: Targeting preciso
4. **Scrapeless**: $0.1/mil queries

---

## 9. Integração com Frontend

### 9.1 Arquitetura Proposta

```
┌─────────────────────────────────────────────────────┐
│              EXTRATIVO FRONTEND                      │
│           (Next.js + Supabase Auth)                  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  Dashboard UI                                 │  │
│  │  • Criar projetos de scraping                │  │
│  │  • Monitorar jobs em tempo real              │  │
│  │  • Visualizar resultados                     │  │
│  │  • Gerenciar créditos                        │  │
│  └──────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/REST
                       ▼
┌─────────────────────────────────────────────────────┐
│           EXTRATIVO BACKEND API                      │
│      (Node.js/Express ou Go Gateway)                 │
│                                                      │
│  • Autenticação (JWT)                               │
│  • Multi-tenancy (user isolation)                   │
│  • Rate limiting                                    │
│  • Billing/Credits                                  │
│  • Job orchestration                               │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│          EXTRATIVO-CORE (Scraping Engine)           │
│                                                      │
│  Modo Web (-web) com API REST                       │
│  Porta interna: 8080 (não exposta publicamente)     │
└─────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              SUPABASE POSTGRESQL                     │
│                                                      │
│  • users (autenticação)                             │
│  • projects (projetos de scraping)                  │
│  • scraping_jobs (fila de jobs)                     │
│  • scraping_results (dados extraídos)               │
│  • credits_transactions (billing)                   │
└─────────────────────────────────────────────────────┘
```

### 9.2 Schema de Banco Proposto

```sql
-- Tabela de projetos de scraping
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de jobs
CREATE TABLE scraping_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    query TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',  -- pending, working, ok, failed
    config JSONB NOT NULL,  -- { lang, depth, email, etc }

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,

    -- Resultados
    results_count INTEGER DEFAULT 0,
    error TEXT,

    -- Custo
    credits_used INTEGER DEFAULT 0,

    -- Índices
    INDEX idx_user_jobs (user_id, created_at DESC),
    INDEX idx_project_jobs (project_id, created_at DESC),
    INDEX idx_status (status, created_at ASC)
);

-- Tabela de resultados
CREATE TABLE scraping_results (
    id BIGSERIAL PRIMARY KEY,
    job_id UUID REFERENCES scraping_jobs(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,

    -- Dados do Google Maps (33 campos)
    input_id TEXT,
    title TEXT,
    category TEXT,
    address TEXT,
    complete_address JSONB,
    latitude NUMERIC,
    longitude NUMERIC,
    phone TEXT,
    website TEXT,
    emails TEXT[],
    review_count INTEGER,
    review_rating NUMERIC,
    -- ... outros campos

    raw_data JSONB,  -- Dados completos em JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Índices
    INDEX idx_job_results (job_id),
    INDEX idx_user_results (user_id, created_at DESC)
);

-- Tabela de créditos
CREATE TABLE credits_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    amount INTEGER NOT NULL,  -- Positivo = compra, Negativo = uso
    type TEXT NOT NULL,  -- 'purchase', 'usage', 'refund'
    reference_id UUID,  -- ID do job (se type = 'usage')
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- View de saldo de créditos
CREATE VIEW user_credits AS
SELECT
    user_id,
    SUM(amount) as balance
FROM credits_transactions
GROUP BY user_id;
```

### 9.3 Fluxo de Integração

#### 1. Usuário Cria Job no Frontend

```typescript
// Frontend (React/Next.js)
async function createScrapingJob(projectId: string, query: string) {
  const response = await fetch('/api/scraping/jobs', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      projectId,
      query,
      config: {
        lang: 'pt-BR',
        depth: 10,
        email: true,
        extraReviews: false
      }
    })
  });

  const { jobId } = await response.json();
  return jobId;
}
```

#### 2. Backend API Processa Request

```typescript
// Backend API (Node.js/Express)
app.post('/api/scraping/jobs', authenticateUser, async (req, res) => {
  const { projectId, query, config } = req.body;
  const userId = req.user.id;

  // 1. Verificar créditos do usuário
  const credits = await getUserCredits(userId);
  const estimatedCost = estimateJobCost(config);

  if (credits < estimatedCost) {
    return res.status(402).json({ error: 'Insufficient credits' });
  }

  // 2. Criar job no Supabase
  const { data: job } = await supabase
    .from('scraping_jobs')
    .insert({
      project_id: projectId,
      user_id: userId,
      query,
      status: 'pending',
      config
    })
    .select()
    .single();

  // 3. Enviar para extrativo-core
  await fetch('http://extrativo-core:8080/api/v1/jobs', {
    method: 'POST',
    body: JSON.stringify({
      ...config,
      query
    })
  });

  // 4. Iniciar polling em background
  startJobMonitoring(job.id);

  res.json({ jobId: job.id });
});
```

#### 3. Background Worker Monitora Status

```typescript
// Background worker (polling)
async function monitorJob(jobId: string) {
  const job = await getJobFromSupabase(jobId);

  // Consultar status no extrativo-core
  const response = await fetch(`http://extrativo-core:8080/api/v1/jobs/${jobId}`);
  const coreJob = await response.json();

  if (coreJob.status === 'ok') {
    // 1. Download dos resultados
    const csvResponse = await fetch(`http://extrativo-core:8080/api/v1/jobs/${jobId}/download`);
    const csvData = await csvResponse.text();

    // 2. Parse CSV e salvar no Supabase
    const results = parseCSV(csvData);
    await saveResultsToSupabase(jobId, results);

    // 3. Atualizar status do job
    await supabase
      .from('scraping_jobs')
      .update({
        status: 'ok',
        finished_at: new Date(),
        results_count: results.length
      })
      .eq('id', jobId);

    // 4. Debitar créditos
    const creditsUsed = calculateCredits(results.length);
    await debitCredits(job.user_id, creditsUsed, jobId);

  } else if (coreJob.status === 'failed') {
    // Marcar como falho
    await supabase
      .from('scraping_jobs')
      .update({
        status: 'failed',
        finished_at: new Date(),
        error: coreJob.error
      })
      .eq('id', jobId);
  } else {
    // Continuar monitorando
    setTimeout(() => monitorJob(jobId), 5000);
  }
}
```

### 9.4 Real-time Updates (Supabase)

```typescript
// Frontend - Subscrever a mudanças em tempo real
useEffect(() => {
  const subscription = supabase
    .channel('job-updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'scraping_jobs',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        // Atualizar UI em tempo real
        updateJobInUI(payload.new);
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, [userId]);
```

### 9.5 Sistema de Créditos

```typescript
// Estimativa de custos
function estimateJobCost(config: JobConfig): number {
  let baseCost = 1;  // 1 crédito por busca

  if (config.depth > 10) baseCost += 1;
  if (config.email) baseCost += 0.5;
  if (config.extraReviews) baseCost += 1;

  // Estimar resultados (depth * 5 em média)
  const estimatedResults = config.depth * 5;
  const resultCost = estimatedResults * 0.1;  // 0.1 crédito por resultado

  return Math.ceil(baseCost + resultCost);
}

// Debitar créditos
async function debitCredits(userId: string, amount: number, jobId: string) {
  await supabase
    .from('credits_transactions')
    .insert({
      user_id: userId,
      amount: -amount,
      type: 'usage',
      reference_id: jobId,
      description: `Scraping job ${jobId}`
    });
}
```

### 9.6 Exportação de Resultados

```typescript
// Endpoint para download de resultados
app.get('/api/scraping/jobs/:id/export', authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { format = 'csv' } = req.query;

  // Verificar ownership
  const job = await getJob(id);
  if (job.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Buscar resultados
  const results = await supabase
    .from('scraping_results')
    .select('*')
    .eq('job_id', id);

  if (format === 'csv') {
    const csv = convertToCSV(results.data);
    res.header('Content-Type', 'text/csv');
    res.attachment(`results_${id}.csv`);
    res.send(csv);
  } else if (format === 'json') {
    res.json(results.data);
  } else if (format === 'xlsx') {
    const xlsx = convertToExcel(results.data);
    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment(`results_${id}.xlsx`);
    res.send(xlsx);
  }
});
```

---

## 10. Performance & Escalabilidade

### 10.1 Benchmarks

#### Configuração de Teste
- Máquina: 8 CPU cores, 16GB RAM
- Concorrência: 8
- Profundidade: 10 scrolls
- Email: desabilitado
- Reviews: básicas apenas

#### Resultados

| Métrica | Valor |
|---------|-------|
| Queries processadas/minuto | ~8-10 |
| Lugares extraídos/minuto | ~120-160 |
| Jobs totais/minuto | ~130-170 |
| Tempo médio por GmapJob | ~30s |
| Tempo médio por PlaceJob | ~5s |
| Tempo médio por EmailJob | ~2s |

#### Cálculo para 1.000 Keywords

```
1.000 keywords × 16 resultados médios = 16.000 places

Jobs totais:
- 1.000 GmapJobs
- 16.000 PlaceJobs
- 16.000 EmailJobs (se habilitado)
= 33.000 jobs totais

Tempo estimado:
- Com concurrency 8: ~3-4 horas
- Com 4 workers (32 concurrency): ~1 hora
- Com 10 workers (80 concurrency): ~25 minutos
```

### 10.2 Otimizações

#### 1. Page Reuse

```go
// O Playwright reusa páginas do navegador até 200 vezes
const maxPageReuse = 200
```

**Benefício:** Reduz overhead de criar/destruir páginas (20-30% mais rápido)

#### 2. Disable Images

```go
playwright.BrowserType.Launch(playwright.BrowserTypeLaunchOptions{
    Args: []string{"--disable-images", "--blink-settings=imagesEnabled=false"}
})
```

**Benefício:** Reduz bandwidth e renderização (15-20% mais rápido)

#### 3. Concurrent Workers

**File/Web Mode:**
```bash
-c 16  # 16 navegadores simultâneos
```

**Database Mode:**
```bash
# 5 máquinas × 8 concurrency = 40 workers
# 40 × 120 places/min = 4,800 places/min
```

#### 4. Fast Mode

**Normal Mode:** 1.000 keywords em ~3h
**Fast Mode:** 1.000 keywords em ~15min

**Trade-off:** Max 21 resultados por query

#### 5. Proxy Rotation

```bash
-proxies "proxy1,proxy2,proxy3,..."
```

**Benefício:** Reduz rate limiting, distribui carga

### 10.3 Estratégias de Escalabilidade

#### Vertical (Single Machine)

```
┌────────────────────────────┐
│    1 Máquina Potente       │
│    32 CPU cores            │
│    64GB RAM                │
│    Concurrency: 24         │
│    ~300 places/min         │
└────────────────────────────┘
```

**Custo:** ~$200-300/mês (cloud)
**Limite:** ~500.000 places/dia

#### Horizontal (Database Mode)

```
┌─────────┐  ┌─────────┐  ┌─────────┐
│Worker 1 │  │Worker 2 │  │Worker N │
│8 cores  │  │8 cores  │  │8 cores  │
│c=8      │  │c=8      │  │c=8      │
└────┬────┘  └────┬────┘  └────┬────┘
     │            │            │
     └────────────┴────────────┘
                  │
          ┌───────▼───────┐
          │  PostgreSQL   │
          │  Job Queue    │
          └───────────────┘
```

**Custo:** $50/worker/mês × N workers
**Limite:** Praticamente ilimitado

#### Serverless (Lambda)

```
1.000 queries → 10 Lambda functions × 100 queries each
Execução: ~30 minutos
Custo: ~$5
```

**Ideal para:**
- Scraping esporádico
- Picos de demanda
- POCs/MVPs

### 10.4 Monitoramento

#### Métricas Importantes

```sql
-- Jobs por status
SELECT status, COUNT(*)
FROM gmaps_jobs
GROUP BY status;

-- Taxa de processamento (últimos 5min)
SELECT
    COUNT(*) as completed_jobs,
    COUNT(*) / 5.0 as jobs_per_minute
FROM gmaps_jobs
WHERE status = 'queued'
  AND updated_at > NOW() - INTERVAL '5 minutes';

-- Tempo médio de processamento
SELECT
    AVG(finished_at - started_at) as avg_duration
FROM scraping_jobs
WHERE status = 'ok'
  AND finished_at > NOW() - INTERVAL '1 hour';
```

#### Health Checks

```bash
# Verificar se workers estão ativos
ps aux | grep google-maps-scraper | wc -l

# Memória utilizada
free -h

# Processos do Chromium
ps aux | grep chromium | wc -l
```

#### Logs

```bash
# Erros recentes
journalctl -u extrativo-scraper --since "10 minutes ago" | grep ERROR

# Taxa de sucesso
journalctl -u extrativo-scraper --since "1 hour ago" | grep -c "Job completed"
```

---

## 11. Troubleshooting

### 11.1 Problemas Comuns

#### Erro: "Playwright not installed"

**Causa:** Navegador Chromium não instalado

**Solução:**
```bash
# Opção 1: Usar modo de instalação
./google-maps-scraper -install

# Opção 2: Manual
npx playwright install chromium

# Opção 3: Docker (já vem instalado)
docker run ... extrativo-core:latest
```

#### Erro: "No places found"

**Causas possíveis:**
1. Query muito específica (sem resultados)
2. Bloqueio por rate limiting
3. Mudança na estrutura HTML do Google Maps

**Soluções:**
```bash
# 1. Testar com query genérica
echo "restaurants" | ./google-maps-scraper -input /dev/stdin -debug

# 2. Usar proxy
./google-maps-scraper -proxies "http://proxy.com:8080" ...

# 3. Reduzir concurrency
./google-maps-scraper -c 1 ...

# 4. Aumentar timeouts
# (Modificar código: scrapemate timeout configs)
```

#### Erro: "Database connection failed"

**Solução:**
```bash
# Testar conexão
psql "postgres://user:pass@host:5432/db"

# Verificar se migrations rodaram
psql ... -c "SELECT * FROM schema_migrations;"

# Executar migrations manualmente
migrate -path ./scripts/migrations \
        -database "postgres://..." \
        up
```

#### Erro: "Out of memory"

**Causa:** Muitos navegadores Chromium abertos

**Soluções:**
```bash
# 1. Reduzir concurrency
-c 4  # Ao invés de 16

# 2. Aumentar RAM da máquina
# Ou usar múltiplas máquinas com Database mode

# 3. Habilitar swap (Linux)
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### Jobs ficam "stuck" em "working"

**Causa:** Worker crashou sem atualizar status

**Solução:**
```sql
-- Resetar jobs travados há mais de 1 hora
UPDATE gmaps_jobs
SET status = 'new'
WHERE status = 'queued'
  AND updated_at < NOW() - INTERVAL '1 hour';
```

#### Emails não estão sendo extraídos

**Causas:**
1. Website usa JavaScript para ofuscar emails
2. Email em página de contato (não homepage)
3. Website protegido (Cloudflare, etc)

**Melhorias futuras:**
- Navegar para `/contact`, `/about`
- Executar JavaScript no website
- Técnicas de de-ofuscação

#### Muitos "Permanently closed"

**Causa:** Dados desatualizados do Google Maps

**Não é erro:** O Google Maps realmente lista negócios fechados

**Filtrar no frontend:**
```sql
SELECT * FROM scraping_results WHERE status != 'Permanently closed'
```

### 11.2 Debug Mode

```bash
# Executar em modo debug (headful browser)
./google-maps-scraper \
  -debug \
  -input test.txt \
  -c 1

# Você verá o navegador abrir e interagir com o Google Maps
```

**Quando usar:**
- Investigar por que lugares não são encontrados
- Verificar se cookie consent está funcionando
- Ver exatamente o que o Playwright está fazendo

### 11.3 Performance Issues

#### Problema: Scraping muito lento

**Diagnóstico:**
```bash
# 1. Verificar CPU
top

# 2. Verificar latência de rede
ping maps.google.com

# 3. Verificar I/O de disco (se salvando em arquivo)
iostat -x 1

# 4. Verificar se proxy está lento
curl -x http://proxy:8080 -w "%{time_total}\n" https://google.com
```

**Soluções:**
- Aumentar concurrency (`-c`)
- Usar SSD ao invés de HDD
- Trocar de proxy
- Usar fast mode (`-fast-mode`)
- Desabilitar reviews (`-extra-reviews=false`)

#### Problema: Alto uso de CPU

**Causa:** Muitos navegadores renderizando páginas

**Soluções:**
- Reduzir `-c`
- Usar headless mode (padrão)
- Disable images (já habilitado por padrão)

#### Problema: Alto uso de RAM

**Causa:** Page reuse acumulando memória

**Solução:**
```bash
# Desabilitar page reuse
./google-maps-scraper -disable-page-reuse ...
```

**Trade-off:** Mais lento, mas usa menos memória

### 11.4 Logs & Monitoring

#### Estrutura de Logs

```
2024-11-02 10:30:00 INFO Starting google-maps-scraper
2024-11-02 10:30:01 INFO Loaded 100 queries from input file
2024-11-02 10:30:02 INFO Starting scrapemate engine with concurrency=8
2024-11-02 10:30:15 INFO [GmapJob] Processed query "restaurants in NYC" - found 16 places
2024-11-02 10:30:18 INFO [PlaceJob] Extracted data for "Joe's Pizza"
2024-11-02 10:30:20 ERROR [EmailJob] Failed to fetch website: connection timeout
2024-11-02 10:35:00 INFO All jobs completed - total results: 1523
```

#### Onde Encontrar Logs

**Docker:**
```bash
docker logs -f extrativo-web
```

**Systemd:**
```bash
journalctl -u extrativo-scraper -f
```

**Kubernetes:**
```bash
kubectl logs -f deployment/extrativo-scraper
```

#### Grep Útil

```bash
# Erros apenas
journalctl -u extrativo-scraper | grep ERROR

# Jobs completados
journalctl -u extrativo-scraper | grep "All jobs completed"

# Performance stats
journalctl -u extrativo-scraper | grep "jobs/minute"
```

---

## 12. Referência de Código

### 12.1 Arquivos Principais

#### Entry Point
**Caminho:** `extrativo-core/main.go`
**Função:** Factory pattern, inicialização de runners, graceful shutdown

#### Core - Extração Google Maps
| Arquivo | Propósito |
|---------|-----------|
| `gmaps/job.go` | GmapJob - busca de lugares |
| `gmaps/place.go` | PlaceJob - extração de detalhes |
| `gmaps/emailjob.go` | EmailJob - extração de emails |
| `gmaps/entry.go` | Estrutura de dados (33 campos) |
| `gmaps/reviews.go` | Extração de reviews estendidas |
| `gmaps/searchjob.go` | Fast mode (API) |
| `gmaps/multiple.go` | Processamento múltiplo |

#### Runners
| Arquivo | Modo |
|---------|------|
| `runner/filerunner/filerunner.go` | CLI simples |
| `runner/databaserunner/databaserunner.go` | PostgreSQL distribuído |
| `runner/webrunner/webrunner.go` | Web UI + worker |
| `runner/lambdaaws/lambdaaws.go` | AWS Lambda function |
| `runner/lambdaaws/invoker.go` | AWS Lambda invoker |

#### Web Server
| Arquivo | Propósito |
|---------|-----------|
| `web/web.go` | HTTP handlers, rotas |
| `web/service.go` | Lógica de negócio |
| `web/job.go` | Modelo de Job |
| `web/sqlite/sqlite.go` | Storage SQLite |

#### Database
| Arquivo | Propósito |
|---------|-----------|
| `postgres/provider.go` | Job queue provider |
| `postgres/resultwriter.go` | Gravação de resultados |
| `scripts/migrations/*.sql` | Schema migrations |

#### Utilidades
| Arquivo | Propósito |
|---------|-----------|
| `deduper/deduper.go` | Deduplicação in-memory |
| `exiter/exiter.go` | Monitor de conclusão |
| `s3uploader/s3uploader.go` | Upload para S3 |
| `tlmt/goposthog/` | Telemetria PostHog |

### 12.2 Funções-Chave

#### Parsing de Dados Aninhados

```go
// gmaps/place.go
func getNthElementAndCast[T any](arr []any, indices ...int) (T, error) {
    var result T
    current := arr

    for _, idx := range indices {
        if idx >= len(current) {
            return result, fmt.Errorf("index out of bounds")
        }

        if reflect.TypeOf(current[idx]).Kind() == reflect.Slice {
            current = current[idx].([]any)
        } else {
            result = current[idx].(T)
            return result, nil
        }
    }

    return result, fmt.Errorf("failed to extract")
}

// Uso:
title := getNthElementAndCast[string](data, 6, 11)
```

#### Extração de Reviews

```go
// gmaps/reviews.go
func (j *ReviewsJob) Process(ctx context.Context, resp *scrapemate.Response) (any, []scrapemate.IJob, error) {
    // Faz request para API de reviews
    url := "https://www.google.com/maps/rpc/listugcposts"

    // Usa pagination token para próximas páginas
    for hasMore {
        reviews := parseReviewsResponse(response)
        allReviews = append(allReviews, reviews...)

        token = getNextToken(response)
        if token == "" {
            break
        }
    }

    return allReviews, nil, nil
}
```

#### Job Queue Atômica

```go
// postgres/provider.go
func (p *Provider) Pop(ctx context.Context) ([]scrapemate.IJob, error) {
    query := `
        UPDATE gmaps_jobs
        SET status = 'queued'
        WHERE id IN (
            SELECT id FROM gmaps_jobs
            WHERE status = 'new'
            ORDER BY priority ASC, created_at ASC
            FOR UPDATE SKIP LOCKED
            LIMIT $1
        )
        RETURNING *
    `

    rows, err := p.db.Query(ctx, query, p.batchSize)
    // ... decode GOB payload para IJob
}
```

### 12.3 Estruturas de Dados

#### Entry (Resultado Completo)

```go
// gmaps/entry.go
type Entry struct {
    InputID          string              `json:"input_id"`
    Title            string              `json:"title"`
    Category         string              `json:"category"`
    Categories       string              `json:"categories"`
    Address          string              `json:"address"`
    CompleteAddress  *Address            `json:"complete_address"`
    Latitude         float64             `json:"latitude"`
    Longitude        float64             `json:"longitude"`
    Phone            string              `json:"phone"`
    Website          string              `json:"website"`
    Emails           []string            `json:"emails"`
    ReviewCount      int                 `json:"review_count"`
    ReviewRating     float64             `json:"review_rating"`
    OpenHours        map[string][]string `json:"open_hours"`
    PopularTimes     map[string]map[int]int `json:"popular_times"`
    // ... 15+ campos adicionais
}
```

#### Job Interface

```go
// scrapemate (framework)
type IJob interface {
    GetID() string
    GetURL() string
    GetPriority() int
    GetMaxRetries() int

    // Ações no navegador (Playwright)
    BrowserActions(context.Context, playwright.Page) Response

    // Processar resposta
    Process(context.Context, *Response) (result any, newJobs []IJob, err error)

    // Se deve processar mesmo com erro de fetch
    ProcessOnFetchError() bool
}
```

### 12.4 Configurações

#### CLI Flags

```go
// main.go
var (
    input            = flag.String("input", "", "Input file")
    results          = flag.String("results", "", "Results file")
    concurrency      = flag.Int("c", runtime.NumCPU()/2, "Concurrency")
    depth            = flag.Int("depth", 10, "Scroll depth")
    lang             = flag.String("lang", "en", "Language")
    email            = flag.Bool("email", false, "Extract emails")
    extraReviews     = flag.Bool("extra-reviews", false, "Fetch extended reviews")
    proxies          = flag.String("proxies", "", "Comma-separated proxies")
    fastMode         = flag.Bool("fast-mode", false, "Use fast API mode")
    dsn              = flag.String("dsn", "", "PostgreSQL DSN")
    // ... 20+ flags
)
```

### 12.5 Dependências (go.mod)

```go
module github.com/gosom/google-maps-scraper

go 1.24

require (
    github.com/playwright-community/playwright-go v0.5200.0
    github.com/PuerkitoBio/goquery v1.10.3
    github.com/gosom/scrapemate v0.9.6
    github.com/jackc/pgx/v5 v5.7.4
    github.com/google/uuid v1.6.0
    github.com/aws/aws-sdk-go-v2 v1.32.8
    github.com/posthog/posthog-go v1.5.2
    modernc.org/sqlite v1.37.0
)
```

---

## 📚 Recursos Adicionais

### Documentação Original

- **README**: `extrativo-core/README.md`
- **Agents**: `extrativo-core/AGENTS.md`
- **Google Maps Extractor**: `extrativo-core/gmaps-extractor.md`
- **SerpAPI**: `extrativo-core/serpapi.md`
- **Scrap.io**: `extrativo-core/scrap_io.md`
- **Decodo Proxies**: `extrativo-core/decodo.md`

### Repositório Original

[github.com/gosom/google-maps-scraper](https://github.com/gosom/google-maps-scraper)

### Comunidade

- Issues: Reportar bugs no repositório original
- Discussões: GitHub Discussions

---

## 🎯 Próximos Passos Recomendados

1. **Setup Inicial**
   - [ ] Fazer build do extrativo-core
   - [ ] Testar file mode com queries de exemplo
   - [ ] Configurar PostgreSQL local
   - [ ] Testar database mode

2. **Integração**
   - [ ] Definir schema do Supabase
   - [ ] Criar API Gateway no backend
   - [ ] Implementar autenticação
   - [ ] Criar worker de monitoramento

3. **Frontend**
   - [ ] Criar UI para criação de jobs
   - [ ] Implementar real-time updates
   - [ ] Dashboard de jobs e resultados
   - [ ] Sistema de créditos

4. **Produção**
   - [ ] Deploy em Docker/K8s
   - [ ] Configurar proxies
   - [ ] Setup de monitoring (Prometheus)
   - [ ] CI/CD pipeline

---

**Documento criado em:** 02/11/2024
**Versão:** 1.0
**Autor:** Equipe Extrativo

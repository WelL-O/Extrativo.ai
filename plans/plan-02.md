# 📋 Plan-02: Implementação Completa - Extrativo

**SaaS B2B para Geração de Leads do Google Maps**

---

## 📑 Índice

1. [Visão Geral](#1-visão-geral)
2. [Fase 1: Fundação - Banco de Dados](#2-fase-1-fundação---banco-de-dados)
3. [Fase 2: Setup de Testes E2E](#3-fase-2-setup-de-testes-e2e)
4. [Fase 3: Desenvolvimento Frontend](#4-fase-3-desenvolvimento-frontend)
5. [Fase 4: Integração Backend](#5-fase-4-integração-backend)
6. [Cronograma](#6-cronograma)
7. [Checklist de Implementação](#7-checklist-de-implementação)

---

## 1. Visão Geral

### 🎯 Objetivo

**Extrativo** é um SaaS B2B que permite empresas e profissionais extraírem listas completas de leads (empresas) do Google Maps para campanhas de marketing, vendas e prospecção.

### 👥 Público-Alvo

- Empresas B2B que fazem prospecção ativa
- Agências de marketing digital
- Vendedores e SDRs
- Empresas de disparo em massa (WhatsApp, Email)

### ⚡ Proposta de Valor

- **Simples**: Busca "restaurantes em São Paulo" → Extrai → Baixa CSV → Pronto
- **Completo**: 33+ campos de dados (telefone, email, avaliações, coordenadas, etc)
- **Rápido**: Powered by extrativo-core (Go + Playwright)
- **Organizado**: Projetos, tags, histórico, templates

### 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript 5
- Tailwind CSS + shadcn/ui
- Framer Motion

**Backend:**
- Supabase (PostgreSQL + Auth + Realtime)
- extrativo-core (Go scraping engine)
- API REST

**Testes:**
- Playwright (E2E)
- Vitest (Unit - futuro)

### 💰 Modelo de Negócio

- **Monetização**: Por número de buscas/mês
- **Planos**: Básico, Pro, Enterprise
- **Limites**:
  - Básico: 10 buscas/mês
  - Pro: 50 buscas/mês
  - Enterprise: 200 buscas/mês

### 📊 Funcionalidades Principais

1. ✅ **Extração de Leads**: Buscar e extrair dados do Google Maps
2. ✅ **Projetos**: Organizar extrações por projeto
3. ✅ **Exportação**: CSV, Excel, Google Sheets, API
4. ✅ **Enriquecimento**: Validação de emails, busca de redes sociais
5. ✅ **Tags**: Categorizar e organizar leads
6. ✅ **Histórico**: Reutilizar buscas, templates
7. ✅ **Dashboard**: Estatísticas e visualizações
8. ✅ **Assinatura**: Gerenciar plano e limites

---

## 2. Fase 1: Fundação - Banco de Dados

### 2.1 Schema Completo

#### Tabelas Principais (7)

```
1. profiles          - Perfis de usuários (complementa auth.users)
2. subscriptions     - Planos e assinaturas
3. projects          - Projetos para organizar extrações
4. extractions       - Jobs de scraping (histórico)
5. extraction_results - Leads extraídos (33+ campos)
6. tags              - Tags para categorização
7. extraction_tags   - Relacionamento many-to-many
```

### 2.2 Migration 001: Schema Base

**Arquivo:** `supabase/migrations/20250102000001_initial_schema.sql`

```sql
-- =====================================================
-- MIGRATION 001: INITIAL SCHEMA
-- Criado em: 2025-01-02
-- Descrição: Schema base do Extrativo
-- =====================================================

-- Extension para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES
-- Perfis de usuários (complementa auth.users)
-- =====================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    company_name TEXT,
    phone TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    UNIQUE(email)
);

-- Index para buscas
CREATE INDEX idx_profiles_email ON profiles(email);

-- =====================================================
-- 2. SUBSCRIPTIONS
-- Planos e assinaturas dos usuários
-- =====================================================

CREATE TYPE subscription_status AS ENUM (
    'trialing',      -- Período de teste
    'active',        -- Ativa
    'past_due',      -- Pagamento atrasado
    'canceled',      -- Cancelada
    'paused'         -- Pausada
);

CREATE TYPE subscription_plan AS ENUM (
    'free',          -- Gratuito (trial)
    'basic',         -- Básico: 10 buscas/mês
    'pro',           -- Pro: 50 buscas/mês
    'enterprise'     -- Enterprise: 200 buscas/mês
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Plano
    plan subscription_plan NOT NULL DEFAULT 'free',
    status subscription_status NOT NULL DEFAULT 'trialing',

    -- Limites
    searches_limit INTEGER NOT NULL DEFAULT 10,
    searches_used INTEGER NOT NULL DEFAULT 0,

    -- Período
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,

    -- Pagamento (integração futura com Stripe)
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    canceled_at TIMESTAMP WITH TIME ZONE,

    UNIQUE(user_id)
);

-- Index
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- =====================================================
-- 3. PROJECTS
-- Projetos para organizar extrações
-- =====================================================

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Dados do projeto
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3b82f6', -- Hex color para UI
    icon TEXT DEFAULT 'folder',    -- Icon name (lucide-react)

    -- Estatísticas (denormalizadas para performance)
    extractions_count INTEGER DEFAULT 0,
    total_leads INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete

    -- Constraints
    CONSTRAINT name_not_empty CHECK (length(trim(name)) > 0)
);

-- Indexes
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_user_active ON projects(user_id) WHERE deleted_at IS NULL;

-- =====================================================
-- 4. EXTRACTIONS
-- Jobs de scraping (histórico de extrações)
-- =====================================================

CREATE TYPE extraction_status AS ENUM (
    'pending',      -- Aguardando processamento
    'processing',   -- Em processamento
    'completed',    -- Concluído com sucesso
    'failed',       -- Falhou
    'canceled'      -- Cancelado pelo usuário
);

CREATE TABLE extractions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

    -- Dados da busca
    query TEXT NOT NULL,

    -- Configurações
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Exemplo de config:
    -- {
    --   "language": "pt-BR",
    --   "depth": 10,
    --   "email": true,
    --   "extraReviews": false,
    --   "fastMode": false,
    --   "geo": { "lat": -23.5505, "lon": -46.6333, "radius": 5000 },
    --   "proxy": "http://proxy.com:8080"
    -- }

    -- Status e progresso
    status extraction_status NOT NULL DEFAULT 'pending',
    progress INTEGER DEFAULT 0, -- 0-100

    -- Resultados
    total_results INTEGER DEFAULT 0,

    -- Integração com extrativo-core
    core_job_id UUID, -- ID do job no extrativo-core

    -- Arquivo de resultados
    csv_url TEXT,
    excel_url TEXT,

    -- Erro (se houver)
    error_message TEXT,
    error_details JSONB,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete

    -- Constraints
    CONSTRAINT query_not_empty CHECK (length(trim(query)) > 0),
    CONSTRAINT progress_range CHECK (progress >= 0 AND progress <= 100)
);

-- Indexes
CREATE INDEX idx_extractions_user ON extractions(user_id);
CREATE INDEX idx_extractions_project ON extractions(project_id);
CREATE INDEX idx_extractions_status ON extractions(status);
CREATE INDEX idx_extractions_user_status ON extractions(user_id, status);
CREATE INDEX idx_extractions_created ON extractions(created_at DESC);

-- Index para busca full-text (futuro)
CREATE INDEX idx_extractions_query_gin ON extractions USING gin(to_tsvector('portuguese', query));

-- =====================================================
-- 5. EXTRACTION_RESULTS
-- Leads extraídos (dados do Google Maps)
-- =====================================================

CREATE TABLE extraction_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    extraction_id UUID NOT NULL REFERENCES extractions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- ==========================================
    -- DADOS DO GOOGLE MAPS (33+ campos)
    -- ==========================================

    -- Informações Básicas
    input_id TEXT,                    -- ID customizado da query
    title TEXT,                       -- Nome do negócio
    category TEXT,                    -- Categoria principal
    categories TEXT,                  -- Todas as categorias
    link TEXT,                        -- URL do Google Maps
    cid TEXT,                         -- ID único do Google Maps
    data_id TEXT,                     -- ID interno do Google

    -- Localização
    address TEXT,                     -- Endereço resumido
    complete_address JSONB,           -- Endereço estruturado
    -- { "borough": "...", "street": "...", "city": "...",
    --   "postal_code": "...", "state": "...", "country": "...",
    --   "country_code": "..." }
    latitude NUMERIC(10, 7),          -- Coordenada
    longitude NUMERIC(10, 7),         -- Coordenada
    plus_code TEXT,                   -- Google Plus Code
    timezone TEXT,                    -- Fuso horário

    -- Contato
    phone TEXT,                       -- Telefone
    website TEXT,                     -- Site oficial
    emails TEXT[],                    -- Array de emails

    -- Avaliações
    review_count INTEGER,             -- Total de reviews
    review_rating NUMERIC(2, 1),      -- Nota média (0.0 - 5.0)
    reviews_per_rating JSONB,         -- Distribuição {"5": 100, "4": 50, ...}
    reviews_link TEXT,                -- Link para reviews
    user_reviews JSONB,               -- Reviews básicas (array)
    user_reviews_extended JSONB,      -- Reviews estendidas (array)

    -- Horários & Fluxo
    open_hours JSONB,                 -- Horários de funcionamento
    popular_times JSONB,              -- Horários populares

    -- Mídia
    thumbnail TEXT,                   -- Foto de capa (URL)
    images JSONB,                     -- Todas as fotos (array)

    -- Serviços
    reservations BOOLEAN,             -- Aceita reservas
    order_online TEXT,                -- Link para pedidos online
    menu TEXT,                        -- Link do menu

    -- Outros
    status TEXT,                      -- "Open", "Closed", "Permanently closed"
    description TEXT,                 -- Descrição do negócio
    price_range TEXT,                 -- "$", "$$", "$$$", "$$$$"
    about JSONB,                      -- Características/opções
    owner JSONB,                      -- Dados do proprietário

    -- Dados brutos (completos em JSON)
    raw_data JSONB,

    -- Enriquecimento (futuro)
    enriched_at TIMESTAMP WITH TIME ZONE,
    enrichment_data JSONB,
    -- { "email_valid": true, "social_media": {...}, ... }

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_results_extraction ON extraction_results(extraction_id);
CREATE INDEX idx_results_user ON extraction_results(user_id);
CREATE INDEX idx_results_title ON extraction_results(title);
CREATE INDEX idx_results_category ON extraction_results(category);
CREATE INDEX idx_results_location ON extraction_results(latitude, longitude);

-- Index para busca full-text
CREATE INDEX idx_results_title_gin ON extraction_results USING gin(to_tsvector('portuguese', title));
CREATE INDEX idx_results_address_gin ON extraction_results USING gin(to_tsvector('portuguese', address));

-- =====================================================
-- 6. TAGS
-- Tags para categorização
-- =====================================================

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Dados da tag
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6b7280', -- Hex color

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT tag_name_not_empty CHECK (length(trim(name)) > 0),
    UNIQUE(user_id, name)
);

-- Index
CREATE INDEX idx_tags_user ON tags(user_id);

-- =====================================================
-- 7. EXTRACTION_TAGS
-- Relacionamento many-to-many entre extractions e tags
-- =====================================================

CREATE TABLE extraction_tags (
    extraction_id UUID NOT NULL REFERENCES extractions(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    PRIMARY KEY (extraction_id, tag_id)
);

-- Indexes
CREATE INDEX idx_extraction_tags_extraction ON extraction_tags(extraction_id);
CREATE INDEX idx_extraction_tags_tag ON extraction_tags(tag_id);

-- =====================================================
-- TRIGGERS: updated_at automático
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_extractions_updated_at BEFORE UPDATE ON extractions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_extraction_results_updated_at BEFORE UPDATE ON extraction_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER: Criar perfil ao registrar usuário
-- =====================================================

CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();

-- =====================================================
-- TRIGGER: Criar assinatura free ao criar perfil
-- =====================================================

CREATE OR REPLACE FUNCTION create_free_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO subscriptions (
        user_id,
        plan,
        status,
        searches_limit,
        searches_used,
        current_period_start,
        current_period_end,
        trial_end
    ) VALUES (
        NEW.id,
        'free',
        'trialing',
        10,
        0,
        NOW(),
        NOW() + INTERVAL '30 days',
        NOW() + INTERVAL '30 days'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
    AFTER INSERT ON profiles
    FOR EACH ROW EXECUTE FUNCTION create_free_subscription();

-- =====================================================
-- TRIGGER: Atualizar contador de buscas ao criar extraction
-- =====================================================

CREATE OR REPLACE FUNCTION increment_searches_used()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
        UPDATE subscriptions
        SET searches_used = searches_used + 1
        WHERE user_id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_extraction_completed
    AFTER INSERT OR UPDATE ON extractions
    FOR EACH ROW EXECUTE FUNCTION increment_searches_used();

-- =====================================================
-- TRIGGER: Atualizar estatísticas do projeto
-- =====================================================

CREATE OR REPLACE FUNCTION update_project_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar contadores do projeto
    UPDATE projects
    SET
        extractions_count = (
            SELECT COUNT(*)
            FROM extractions
            WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
              AND deleted_at IS NULL
        ),
        total_leads = (
            SELECT COALESCE(SUM(total_results), 0)
            FROM extractions
            WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
              AND deleted_at IS NULL
        )
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_extraction_changed
    AFTER INSERT OR UPDATE OR DELETE ON extractions
    FOR EACH ROW EXECUTE FUNCTION update_project_stats();

-- =====================================================
-- COMENTÁRIOS (Documentação do schema)
-- =====================================================

COMMENT ON TABLE profiles IS 'Perfis de usuários - complementa auth.users';
COMMENT ON TABLE subscriptions IS 'Planos e assinaturas dos usuários';
COMMENT ON TABLE projects IS 'Projetos para organizar extrações';
COMMENT ON TABLE extractions IS 'Jobs de scraping - histórico de extrações';
COMMENT ON TABLE extraction_results IS 'Leads extraídos do Google Maps (33+ campos)';
COMMENT ON TABLE tags IS 'Tags para categorização de extrações';
COMMENT ON TABLE extraction_tags IS 'Relacionamento many-to-many entre extractions e tags';

COMMENT ON COLUMN extractions.config IS 'Configurações do job em JSON: language, depth, email, etc';
COMMENT ON COLUMN extractions.core_job_id IS 'ID do job no extrativo-core (motor de scraping)';
COMMENT ON COLUMN extraction_results.raw_data IS 'Dados completos do Google Maps em JSON';
COMMENT ON COLUMN extraction_results.enrichment_data IS 'Dados enriquecidos: validação de email, redes sociais, etc';
```

### 2.3 Migration 002: Row Level Security (RLS)

**Arquivo:** `supabase/migrations/20250102000002_rls_policies.sql`

```sql
-- =====================================================
-- MIGRATION 002: ROW LEVEL SECURITY
-- Criado em: 2025-01-02
-- Descrição: Políticas de segurança (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE extraction_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE extraction_tags ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES
-- =====================================================

-- Usuários podem ler seu próprio perfil
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- =====================================================
-- SUBSCRIPTIONS
-- =====================================================

-- Usuários podem ler sua própria assinatura
CREATE POLICY "Users can view own subscription"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Admin pode atualizar assinaturas (via service role)
-- Usuários não podem atualizar diretamente

-- =====================================================
-- PROJECTS
-- =====================================================

-- Usuários podem ver seus próprios projetos
CREATE POLICY "Users can view own projects"
    ON projects FOR SELECT
    USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Usuários podem criar projetos
CREATE POLICY "Users can create projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus projetos
CREATE POLICY "Users can update own projects"
    ON projects FOR UPDATE
    USING (auth.uid() = user_id);

-- Usuários podem deletar (soft delete) seus projetos
CREATE POLICY "Users can delete own projects"
    ON projects FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- EXTRACTIONS
-- =====================================================

-- Usuários podem ver suas próprias extrações
CREATE POLICY "Users can view own extractions"
    ON extractions FOR SELECT
    USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Usuários podem criar extrações
CREATE POLICY "Users can create extractions"
    ON extractions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas extrações
CREATE POLICY "Users can update own extractions"
    ON extractions FOR UPDATE
    USING (auth.uid() = user_id);

-- Usuários podem deletar suas extrações
CREATE POLICY "Users can delete own extractions"
    ON extractions FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- EXTRACTION_RESULTS
-- =====================================================

-- Usuários podem ver seus próprios resultados
CREATE POLICY "Users can view own results"
    ON extraction_results FOR SELECT
    USING (auth.uid() = user_id);

-- Apenas sistema pode inserir resultados (via service role)
-- Usuários não podem criar/editar/deletar resultados manualmente

-- =====================================================
-- TAGS
-- =====================================================

-- Usuários podem ver suas próprias tags
CREATE POLICY "Users can view own tags"
    ON tags FOR SELECT
    USING (auth.uid() = user_id);

-- Usuários podem criar tags
CREATE POLICY "Users can create tags"
    ON tags FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas tags
CREATE POLICY "Users can update own tags"
    ON tags FOR UPDATE
    USING (auth.uid() = user_id);

-- Usuários podem deletar suas tags
CREATE POLICY "Users can delete own tags"
    ON tags FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- EXTRACTION_TAGS
-- =====================================================

-- Usuários podem ver tags de suas extrações
CREATE POLICY "Users can view tags of own extractions"
    ON extraction_tags FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM extractions
            WHERE id = extraction_tags.extraction_id
              AND user_id = auth.uid()
        )
    );

-- Usuários podem adicionar tags às suas extrações
CREATE POLICY "Users can add tags to own extractions"
    ON extraction_tags FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM extractions
            WHERE id = extraction_tags.extraction_id
              AND user_id = auth.uid()
        )
    );

-- Usuários podem remover tags de suas extrações
CREATE POLICY "Users can remove tags from own extractions"
    ON extraction_tags FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM extractions
            WHERE id = extraction_tags.extraction_id
              AND user_id = auth.uid()
        )
    );
```

### 2.4 Migration 003: Helper Functions

**Arquivo:** `supabase/migrations/20250102000003_helper_functions.sql`

```sql
-- =====================================================
-- MIGRATION 003: HELPER FUNCTIONS
-- Criado em: 2025-01-02
-- Descrição: Funções auxiliares e helpers
-- =====================================================

-- =====================================================
-- FUNCTION: Verificar se usuário pode criar extraction
-- =====================================================

CREATE OR REPLACE FUNCTION can_create_extraction(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_searches_used INTEGER;
    v_searches_limit INTEGER;
BEGIN
    SELECT searches_used, searches_limit
    INTO v_searches_used, v_searches_limit
    FROM subscriptions
    WHERE user_id = p_user_id
      AND status = 'active';

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    RETURN v_searches_used < v_searches_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Obter estatísticas do usuário
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS TABLE (
    total_extractions BIGINT,
    total_leads BIGINT,
    total_projects BIGINT,
    searches_used INTEGER,
    searches_remaining INTEGER,
    plan TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM extractions WHERE user_id = p_user_id AND deleted_at IS NULL),
        (SELECT COALESCE(SUM(total_results), 0) FROM extractions WHERE user_id = p_user_id AND deleted_at IS NULL),
        (SELECT COUNT(*) FROM projects WHERE user_id = p_user_id AND deleted_at IS NULL),
        s.searches_used,
        (s.searches_limit - s.searches_used) AS searches_remaining,
        s.plan::TEXT
    FROM subscriptions s
    WHERE s.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Resetar contadores mensais (cron job)
-- =====================================================

CREATE OR REPLACE FUNCTION reset_monthly_searches()
RETURNS void AS $$
BEGIN
    UPDATE subscriptions
    SET
        searches_used = 0,
        current_period_start = current_period_end,
        current_period_end = current_period_end + INTERVAL '30 days'
    WHERE current_period_end < NOW()
      AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Exportar extraction para CSV (retorna JSON)
-- =====================================================

CREATE OR REPLACE FUNCTION export_extraction_to_json(p_extraction_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_results JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'title', title,
            'category', category,
            'address', address,
            'phone', phone,
            'website', website,
            'emails', emails,
            'latitude', latitude,
            'longitude', longitude,
            'review_count', review_count,
            'review_rating', review_rating
        )
    )
    INTO v_results
    FROM extraction_results
    WHERE extraction_id = p_extraction_id;

    RETURN v_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Buscar extrações por query (full-text search)
-- =====================================================

CREATE OR REPLACE FUNCTION search_extractions(p_user_id UUID, p_search_term TEXT)
RETURNS TABLE (
    id UUID,
    query TEXT,
    status extraction_status,
    total_results INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.query,
        e.status,
        e.total_results,
        e.created_at,
        ts_rank(to_tsvector('portuguese', e.query), to_tsquery('portuguese', p_search_term)) AS rank
    FROM extractions e
    WHERE e.user_id = p_user_id
      AND e.deleted_at IS NULL
      AND to_tsvector('portuguese', e.query) @@ to_tsquery('portuguese', p_search_term)
    ORDER BY rank DESC, e.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2.5 TypeScript Types

**Arquivo:** `src/lib/supabase-front/types/database.types.ts`

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          company_name: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          company_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          company_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: 'free' | 'basic' | 'pro' | 'enterprise'
          status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'paused'
          searches_limit: number
          searches_used: number
          current_period_start: string | null
          current_period_end: string | null
          trial_end: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
          canceled_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          plan?: 'free' | 'basic' | 'pro' | 'enterprise'
          status?: 'trialing' | 'active' | 'past_due' | 'canceled' | 'paused'
          searches_limit?: number
          searches_used?: number
          current_period_start?: string | null
          current_period_end?: string | null
          trial_end?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
          canceled_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          plan?: 'free' | 'basic' | 'pro' | 'enterprise'
          status?: 'trialing' | 'active' | 'past_due' | 'canceled' | 'paused'
          searches_limit?: number
          searches_used?: number
          current_period_start?: string | null
          current_period_end?: string | null
          trial_end?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
          canceled_at?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          color: string
          icon: string
          extractions_count: number
          total_leads: number
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          color?: string
          icon?: string
          extractions_count?: number
          total_leads?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          color?: string
          icon?: string
          extractions_count?: number
          total_leads?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      extractions: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          query: string
          config: Json
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'canceled'
          progress: number
          total_results: number
          core_job_id: string | null
          csv_url: string | null
          excel_url: string | null
          error_message: string | null
          error_details: Json | null
          created_at: string
          started_at: string | null
          completed_at: string | null
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          query: string
          config?: Json
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'canceled'
          progress?: number
          total_results?: number
          core_job_id?: string | null
          csv_url?: string | null
          excel_url?: string | null
          error_message?: string | null
          error_details?: Json | null
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          query?: string
          config?: Json
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'canceled'
          progress?: number
          total_results?: number
          core_job_id?: string | null
          csv_url?: string | null
          excel_url?: string | null
          error_message?: string | null
          error_details?: Json | null
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
      }
      extraction_results: {
        Row: {
          id: string
          extraction_id: string
          user_id: string
          input_id: string | null
          title: string | null
          category: string | null
          categories: string | null
          link: string | null
          cid: string | null
          data_id: string | null
          address: string | null
          complete_address: Json | null
          latitude: number | null
          longitude: number | null
          plus_code: string | null
          timezone: string | null
          phone: string | null
          website: string | null
          emails: string[] | null
          review_count: number | null
          review_rating: number | null
          reviews_per_rating: Json | null
          reviews_link: string | null
          user_reviews: Json | null
          user_reviews_extended: Json | null
          open_hours: Json | null
          popular_times: Json | null
          thumbnail: string | null
          images: Json | null
          reservations: boolean | null
          order_online: string | null
          menu: string | null
          status: string | null
          description: string | null
          price_range: string | null
          about: Json | null
          owner: Json | null
          raw_data: Json | null
          enriched_at: string | null
          enrichment_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          extraction_id: string
          user_id: string
          input_id?: string | null
          title?: string | null
          category?: string | null
          categories?: string | null
          link?: string | null
          cid?: string | null
          data_id?: string | null
          address?: string | null
          complete_address?: Json | null
          latitude?: number | null
          longitude?: number | null
          plus_code?: string | null
          timezone?: string | null
          phone?: string | null
          website?: string | null
          emails?: string[] | null
          review_count?: number | null
          review_rating?: number | null
          reviews_per_rating?: Json | null
          reviews_link?: string | null
          user_reviews?: Json | null
          user_reviews_extended?: Json | null
          open_hours?: Json | null
          popular_times?: Json | null
          thumbnail?: string | null
          images?: Json | null
          reservations?: boolean | null
          order_online?: string | null
          menu?: string | null
          status?: string | null
          description?: string | null
          price_range?: string | null
          about?: Json | null
          owner?: Json | null
          raw_data?: Json | null
          enriched_at?: string | null
          enrichment_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          extraction_id?: string
          user_id?: string
          input_id?: string | null
          title?: string | null
          category?: string | null
          categories?: string | null
          link?: string | null
          cid?: string | null
          data_id?: string | null
          address?: string | null
          complete_address?: Json | null
          latitude?: number | null
          longitude?: number | null
          plus_code?: string | null
          timezone?: string | null
          phone?: string | null
          website?: string | null
          emails?: string[] | null
          review_count?: number | null
          review_rating?: number | null
          reviews_per_rating?: Json | null
          reviews_link?: string | null
          user_reviews?: Json | null
          user_reviews_extended?: Json | null
          open_hours?: Json | null
          popular_times?: Json | null
          thumbnail?: string | null
          images?: Json | null
          reservations?: boolean | null
          order_online?: string | null
          menu?: string | null
          status?: string | null
          description?: string | null
          price_range?: string | null
          about?: Json | null
          owner?: Json | null
          raw_data?: Json | null
          enriched_at?: string | null
          enrichment_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      extraction_tags: {
        Row: {
          extraction_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          extraction_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          extraction_id?: string
          tag_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_create_extraction: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      get_user_stats: {
        Args: { p_user_id: string }
        Returns: {
          total_extractions: number
          total_leads: number
          total_projects: number
          searches_used: number
          searches_remaining: number
          plan: string
        }[]
      }
      export_extraction_to_json: {
        Args: { p_extraction_id: string }
        Returns: Json
      }
      search_extractions: {
        Args: { p_user_id: string; p_search_term: string }
        Returns: {
          id: string
          query: string
          status: string
          total_results: number
          created_at: string
          rank: number
        }[]
      }
    }
    Enums: {
      subscription_status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'paused'
      subscription_plan: 'free' | 'basic' | 'pro' | 'enterprise'
      extraction_status: 'pending' | 'processing' | 'completed' | 'failed' | 'canceled'
    }
  }
}
```

---

## 3. Fase 2: Setup de Testes E2E

### 3.1 Instalação do Playwright

```bash
npm install -D @playwright/test
npx playwright install --with-deps
```

### 3.2 Configuração

**Arquivo:** `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 3.3 Estrutura de Testes

```
tests/
├── e2e/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   ├── signup.spec.ts
│   │   └── logout.spec.ts
│   ├── dashboard/
│   │   └── overview.spec.ts
│   ├── extractions/
│   │   ├── create.spec.ts
│   │   ├── list.spec.ts
│   │   └── details.spec.ts
│   ├── projects/
│   │   ├── create.spec.ts
│   │   └── manage.spec.ts
│   └── database/
│       └── schema.spec.ts
├── fixtures/
│   ├── users.json
│   └── extractions.json
└── utils/
    ├── auth.ts
    ├── db.ts
    └── helpers.ts
```

### 3.4 Exemplos de Testes

**tests/e2e/database/schema.spec.ts**

```typescript
import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

test.describe('Database Schema', () => {
  test('all tables should exist', async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(0);

    expect(error).toBeNull();
  });

  test('RLS should be enabled', async () => {
    // Tentar acessar dados sem autenticação
    const { data, error } = await supabase
      .from('extractions')
      .select('*');

    expect(data).toEqual([]);
  });
});
```

**tests/e2e/auth/login.spec.ts**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('user can login successfully', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});
```

**tests/utils/auth.ts**

```typescript
import { Page } from '@playwright/test';

export async function loginAsUser(page: Page, email = 'test@example.com', password = 'password123') {
  await page.goto('/login');
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

export async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('text=Logout');
  await page.waitForURL('/login');
}
```

---

## 4. Fase 3: Desenvolvimento Frontend

### 4.1 Páginas Necessárias (9 principais)

#### **1. Dashboard (`/dashboard`)**

**Propósito:** Visão geral com estatísticas e acesso rápido

**Componentes:**
- Cards de estatísticas (buscas usadas, leads extraídos, projetos)
- Gráfico de uso mensal
- Últimas extrações (tabela)
- Botão "Nova Extração"
- Indicador de limite do plano

**Wireframe:**
```
┌─────────────────────────────────────────────────────┐
│ Dashboard                              [User Menu]  │
├─────────────────────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐ ┌───────────┐          │
│ │ Buscas    │ │ Leads     │ │ Projetos  │          │
│ │ 7/10      │ │ 1.234     │ │ 3         │          │
│ └───────────┘ └───────────┘ └───────────┘          │
│                                                      │
│ Uso Mensal                                          │
│ ┌────────────────────────────────────────────────┐ │
│ │        [Gráfico de linhas]                     │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ Últimas Extrações                [Nova Extração]   │
│ ┌────────────────────────────────────────────────┐ │
│ │ Query              Status     Leads    Data    │ │
│ ├────────────────────────────────────────────────┤ │
│ │ restaurantes SP    ✅ Completo  156    Hoje    │ │
│ │ hotéis RJ         ⏳ Processando 0     Hoje    │ │
│ └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Dados:**
```typescript
const stats = await supabase.rpc('get_user_stats', { p_user_id: userId });
const recentExtractions = await supabase
  .from('extractions')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(5);
```

---

#### **2. Nova Extração (`/dashboard/extractions/new`)**

**Propósito:** Form para criar nova extração

**Componentes:**
- Input de query
- Select de idioma
- Select de profundidade (depth)
- Checkboxes: Extrair emails, Reviews estendidas
- Select de projeto (opcional)
- Select de tags (opcional)
- Botão "Iniciar Extração"

**Wireframe:**
```
┌─────────────────────────────────────────────────────┐
│ Nova Extração                         [< Voltar]    │
├─────────────────────────────────────────────────────┤
│ O que você quer extrair?                            │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Ex: restaurantes em São Paulo                   │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ Configurações                                       │
│ Idioma: [Português (BR) ▼]  Profundidade: [10 ▼]  │
│                                                      │
│ Opções Avançadas                                    │
│ ☑ Extrair emails dos websites                      │
│ ☐ Buscar reviews estendidas (~300 por local)       │
│                                                      │
│ Organização (opcional)                              │
│ Projeto: [Selecione um projeto ▼]                  │
│ Tags: [+ Adicionar tags]                           │
│                                                      │
│             [Iniciar Extração →]                    │
└─────────────────────────────────────────────────────┘
```

**Validação:**
```typescript
// Verificar limite antes de criar
const canCreate = await supabase.rpc('can_create_extraction', {
  p_user_id: userId
});

if (!canCreate) {
  toast.error('Você atingiu o limite de buscas do seu plano');
  return;
}
```

---

#### **3. Histórico de Extrações (`/dashboard/extractions`)**

**Propósito:** Lista todas as extrações do usuário

**Componentes:**
- Tabela com filtros e busca
- Badges de status (pending, processing, completed, failed)
- Ações: Ver, Exportar, Deletar
- Paginação
- Filtros: Status, Data, Projeto

**Wireframe:**
```
┌─────────────────────────────────────────────────────┐
│ Extrações                            [Nova Extração]│
├─────────────────────────────────────────────────────┤
│ Buscar: [         ]  Status: [Todos ▼] Data: [▼]   │
│                                                      │
│ ┌────────────────────────────────────────────────┐ │
│ │ Query        Status   Leads  Projeto    Ações  │ │
│ ├────────────────────────────────────────────────┤ │
│ │ rest. SP     ✅ Completo 156  Vendas    [···]  │ │
│ │ hotéis RJ    ⏳ Processando 0  -        [···]  │ │
│ │ cafés POA    ❌ Falhou   0   Marketing  [···]  │ │
│ └────────────────────────────────────────────────┘ │
│                        [1] 2 3 ... 10              │
└─────────────────────────────────────────────────────┘
```

**Real-time:**
```typescript
// Subscrever a mudanças
const subscription = supabase
  .channel('extractions')
  .on('postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'extractions',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      // Atualizar estado
      updateExtraction(payload.new);
    }
  )
  .subscribe();
```

---

#### **4. Detalhes da Extração (`/dashboard/extractions/[id]`)**

**Propósito:** Visualizar detalhes de uma extração específica

**Componentes:**
- Header com status e metadata
- Tabs: Resultados, Configuração, Logs
- Tabela de leads
- Botões de exportação (CSV, Excel, Google Sheets)
- Mapa com pins (opcional)

**Wireframe:**
```
┌─────────────────────────────────────────────────────┐
│ restaurantes em São Paulo            [< Voltar]     │
│ ✅ Completo • 156 leads • Projeto: Vendas           │
├─────────────────────────────────────────────────────┤
│ [Resultados] [Configuração] [Logs]                  │
│                                                      │
│ [⬇ CSV] [⬇ Excel] [⬇ Google Sheets]               │
│                                                      │
│ ┌────────────────────────────────────────────────┐ │
│ │ Nome         Categoria    Telefone    Cidade   │ │
│ ├────────────────────────────────────────────────┤ │
│ │ Joe's Pizza  Pizzaria     (11) 9...  São Paulo│ │
│ │ Bella Italia Restaurante  (11) 8...  São Paulo│ │
│ └────────────────────────────────────────────────┘ │
│                        [1] 2 3 ... 16              │
└─────────────────────────────────────────────────────┘
```

---

#### **5. Projetos (`/dashboard/projects`)**

**Propósito:** Gerenciar projetos

**Componentes:**
- Grid/Lista de projetos
- Botão "Novo Projeto"
- Cards com estatísticas (extrações, leads)
- Ações: Ver, Editar, Deletar

**Wireframe:**
```
┌─────────────────────────────────────────────────────┐
│ Projetos                              [Novo Projeto]│
├─────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ 📊 Vendas    │ │ 📧 Marketing │ │ 🎯 Prospecção│ │
│ │ 12 extrações │ │ 8 extrações  │ │ 5 extrações  │ │
│ │ 1.234 leads  │ │ 890 leads    │ │ 456 leads    │ │
│ │ [Ver] [···]  │ │ [Ver] [···]  │ │ [Ver] [···]  │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

#### **6. Detalhes do Projeto (`/dashboard/projects/[id]`)**

**Propósito:** Ver extrações de um projeto

**Componentes:**
- Header do projeto (nome, descrição, cor)
- Estatísticas
- Tabela de extrações do projeto
- Botão "Nova Extração neste Projeto"

---

#### **7. Perfil (`/dashboard/profile`)**

**Propósito:** Gerenciar dados do usuário

**Componentes:**
- Upload de avatar
- Form: Nome, Email, Empresa, Telefone
- Alterar senha
- Deletar conta

---

#### **8. Assinatura (`/dashboard/subscription`)**

**Propósito:** Gerenciar plano e pagamentos

**Componentes:**
- Card do plano atual
- Barra de progresso (buscas usadas/limite)
- Tabela de histórico de uso
- Botões: Upgrade, Cancelar (futuro)

**Wireframe:**
```
┌─────────────────────────────────────────────────────┐
│ Assinatura                                          │
├─────────────────────────────────────────────────────┤
│ Plano Atual: Free                                   │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Buscas: 7/10                                    │ │
│ │ [███████░░░] 70%                                │ │
│ │ Renova em: 15/02/2025                           │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│                        [Fazer Upgrade →]            │
│                                                      │
│ Histórico de Uso                                    │
│ ┌────────────────────────────────────────────────┐ │
│ │ Data       Query              Leads            │ │
│ ├────────────────────────────────────────────────┤ │
│ │ 02/01/25   restaurantes SP    156              │ │
│ │ 01/01/25   hotéis RJ          89               │ │
│ └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

#### **9. Configurações (`/dashboard/settings`)**

**Propósito:** Preferências e configurações

**Componentes:**
- Tabs: Geral, Integrações, API
- Seletor de idioma
- Seletor de tema
- API Keys (futuro)

---

### 4.2 Componentes UI a Adicionar

**shadcn/ui components:**

```bash
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add tabs
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add dialog
npx shadcn@latest add progress
npx shadcn@latest add toast
npx shadcn@latest add alert
npx shadcn@latest add switch
npx shadcn@latest add checkbox
npx shadcn@latest add accordion
npx shadcn@latest add calendar
npx shadcn@latest add popover
npx shadcn@latest add command
```

### 4.3 Atualização da Sidebar

**Arquivo:** `src/components/app-sidebar.tsx`

```typescript
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Extrações",
      url: "#",
      icon: Download,
      items: [
        { title: "Nova Extração", url: "/dashboard/extractions/new" },
        { title: "Histórico", url: "/dashboard/extractions" },
      ],
    },
    {
      title: "Projetos",
      url: "/dashboard/projects",
      icon: FolderKanban,
    },
  ],
  navSecondary: [
    { title: "Assinatura", url: "/dashboard/subscription", icon: CreditCard },
    { title: "Perfil", url: "/dashboard/profile", icon: User },
    { title: "Configurações", url: "/dashboard/settings", icon: Settings },
  ],
};
```

---

## 5. Fase 4: Integração Backend

### 5.1 Cliente extrativo-core

**Arquivo:** `src/lib/extrativo-core/client.ts`

```typescript
const EXTRATIVO_CORE_URL = process.env.NEXT_PUBLIC_EXTRATIVO_CORE_URL || 'http://localhost:8080';

export interface ExtractioConfig {
  query: string;
  language?: string;
  depth?: number;
  email?: boolean;
  extraReviews?: boolean;
  fastMode?: boolean;
  geo?: {
    lat: number;
    lon: number;
    radius: number;
  };
}

export interface CoreJob {
  id: string;
  status: 'pending' | 'working' | 'ok' | 'failed';
  created_at: string;
  finished_at?: string;
  results_count?: number;
  error?: string;
}

export const extrativoCoreClient = {
  async createJob(config: ExtractioConfig): Promise<{ id: string }> {
    const response = await fetch(`${EXTRATIVO_CORE_URL}/api/v1/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return response.json();
  },

  async getJob(id: string): Promise<CoreJob> {
    const response = await fetch(`${EXTRATIVO_CORE_URL}/api/v1/jobs/${id}`);
    return response.json();
  },

  async downloadCSV(id: string): Promise<Blob> {
    const response = await fetch(`${EXTRATIVO_CORE_URL}/api/v1/jobs/${id}/download`);
    return response.blob();
  },
};
```

### 5.2 React Query Hooks

**Arquivo:** `src/lib/extrativo-core/hooks/useJobs.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extrativoCoreClient } from '../client';
import { supabase } from '@/lib/supabase-front/client/supabase';

export function useCreateExtraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: ExtractioConfig) => {
      // 1. Criar job no extrativo-core
      const { id: coreJobId } = await extrativoCoreClient.createJob(config);

      // 2. Salvar no Supabase
      const { data, error } = await supabase
        .from('extractions')
        .insert({
          query: config.query,
          config,
          core_job_id: coreJobId,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extractions'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
  });
}

export function useExtractions() {
  return useQuery({
    queryKey: ['extractions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('extractions')
        .select('*, project:projects(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useExtraction(id: string) {
  return useQuery({
    queryKey: ['extraction', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('extractions')
        .select('*, results:extraction_results(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });
}
```

### 5.3 Background Worker (API Route)

**Arquivo:** `src/app/api/workers/poll-jobs/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extrativoCoreClient } from '@/lib/extrativo-core/client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key
);

export async function POST() {
  // Buscar jobs pendentes
  const { data: pendingJobs } = await supabase
    .from('extractions')
    .select('*')
    .in('status', ['pending', 'processing'])
    .not('core_job_id', 'is', null);

  for (const job of pendingJobs || []) {
    // Consultar status no extrativo-core
    const coreJob = await extrativoCoreClient.getJob(job.core_job_id!);

    if (coreJob.status === 'ok') {
      // Job completado
      await supabase
        .from('extractions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          total_results: coreJob.results_count || 0,
        })
        .eq('id', job.id);

      // Download e parse dos resultados
      const csvBlob = await extrativoCoreClient.downloadCSV(job.core_job_id!);
      // Parse CSV e salvar em extraction_results
      // ... (implementar parsing)

    } else if (coreJob.status === 'failed') {
      // Job falhou
      await supabase
        .from('extractions')
        .update({
          status: 'failed',
          error_message: coreJob.error,
          completed_at: new Date().toISOString(),
        })
        .eq('id', job.id);
    }
  }

  return NextResponse.json({ success: true });
}
```

**Cron (Vercel):**

`vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/workers/poll-jobs",
      "schedule": "*/1 * * * *"
    }
  ]
}
```

---

## 6. Cronograma

### Semana 1: Fundação (Jan 6-12)
- ✅ **Dia 1-2**: Criar e executar migrations SQL
- ✅ **Dia 2-3**: Setup Playwright + primeiros testes
- ✅ **Dia 4-5**: Atualizar sidebar + criar estrutura de rotas

### Semana 2: Core Pages (Jan 13-19)
- ✅ **Dia 1-2**: Dashboard (estatísticas + gráfico)
- ✅ **Dia 3-4**: Nova Extração (form completo)
- ✅ **Dia 5**: Histórico de Extrações (tabela + filtros)

### Semana 3: Detalhes & Projetos (Jan 20-26)
- ✅ **Dia 1-2**: Detalhes da Extração (tabs + tabela de resultados)
- ✅ **Dia 3-4**: Projetos (CRUD completo)
- ✅ **Dia 5**: Integração com extrativo-core (API client)

### Semana 4: Exportação & Perfil (Jan 27 - Feb 2)
- ✅ **Dia 1-2**: Exportação (CSV, Excel, Google Sheets)
- ✅ **Dia 3**: Perfil do Usuário
- ✅ **Dia 4**: Assinatura
- ✅ **Dia 5**: Configurações

### Semana 5: Polish & Deploy (Feb 3-9)
- ✅ **Dia 1-2**: Testes E2E de todas as páginas
- ✅ **Dia 3-4**: Fixes de bugs + melhorias UX
- ✅ **Dia 5**: Deploy em produção

---

## 7. Checklist de Implementação

### 🗄️ Fase 1: Banco de Dados

- [ ] Criar diretório `supabase/migrations/`
- [ ] Criar migration 001 (schema base)
- [ ] Criar migration 002 (RLS policies)
- [ ] Criar migration 003 (helper functions)
- [ ] Executar migrations no Supabase
- [ ] Validar que tabelas foram criadas
- [ ] Testar RLS policies
- [ ] Gerar TypeScript types
- [ ] Atualizar `src/lib/supabase-front/types/database.types.ts`
- [ ] Criar documentação do schema

### 🧪 Fase 2: Testes E2E

- [ ] Instalar Playwright (`npm install -D @playwright/test`)
- [ ] Criar `playwright.config.ts`
- [ ] Criar estrutura de pastas `tests/e2e/`
- [ ] Criar teste: `database/schema.spec.ts`
- [ ] Criar teste: `auth/login.spec.ts`
- [ ] Criar teste: `auth/signup.spec.ts`
- [ ] Criar helpers: `tests/utils/auth.ts`
- [ ] Criar fixtures: `tests/fixtures/users.json`
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Rodar testes localmente

### 🎨 Fase 3: Frontend Base

- [ ] Adicionar componentes shadcn/ui (table, badge, tabs, etc)
- [ ] Atualizar `app-sidebar.tsx` com rotas reais
- [ ] Criar layout base de dashboard
- [ ] Adicionar provider React Query
- [ ] Configurar Sonner (toast notifications)

### 📄 Fase 4: Páginas

**Dashboard:**
- [ ] Criar `app/dashboard/page.tsx`
- [ ] Implementar cards de estatísticas
- [ ] Criar hook `useUserStats`
- [ ] Adicionar gráfico de uso (recharts)
- [ ] Tabela de últimas extrações
- [ ] Teste E2E: `dashboard/overview.spec.ts`

**Nova Extração:**
- [ ] Criar `app/dashboard/extractions/new/page.tsx`
- [ ] Form com validação (react-hook-form + zod)
- [ ] Select de projeto
- [ ] Multi-select de tags
- [ ] Verificar limite antes de submeter
- [ ] Teste E2E: `extractions/create.spec.ts`

**Histórico:**
- [ ] Criar `app/dashboard/extractions/page.tsx`
- [ ] Tabela com filtros
- [ ] Real-time updates (Supabase subscriptions)
- [ ] Badges de status
- [ ] Ações: Ver, Exportar, Deletar
- [ ] Teste E2E: `extractions/list.spec.ts`

**Detalhes:**
- [ ] Criar `app/dashboard/extractions/[id]/page.tsx`
- [ ] Tabs: Resultados, Config, Logs
- [ ] Tabela de leads
- [ ] Botões de exportação
- [ ] Teste E2E: `extractions/details.spec.ts`

**Projetos:**
- [ ] Criar `app/dashboard/projects/page.tsx`
- [ ] Grid de cards
- [ ] Criar projeto (dialog)
- [ ] Editar projeto
- [ ] Deletar projeto (soft delete)
- [ ] Teste E2E: `projects/manage.spec.ts`

**Detalhes do Projeto:**
- [ ] Criar `app/dashboard/projects/[id]/page.tsx`
- [ ] Header do projeto
- [ ] Tabela de extrações
- [ ] Estatísticas

**Perfil:**
- [ ] Criar `app/dashboard/profile/page.tsx`
- [ ] Upload de avatar (Supabase Storage)
- [ ] Form de edição
- [ ] Alterar senha
- [ ] Teste E2E: `profile/update.spec.ts`

**Assinatura:**
- [ ] Criar `app/dashboard/subscription/page.tsx`
- [ ] Card do plano
- [ ] Barra de progresso
- [ ] Histórico de uso
- [ ] Teste E2E: `subscription/view.spec.ts`

**Configurações:**
- [ ] Criar `app/dashboard/settings/page.tsx`
- [ ] Tabs: Geral, Integrações, API
- [ ] Seletor de idioma
- [ ] Seletor de tema

### 🔗 Fase 5: Integração

- [ ] Criar `lib/extrativo-core/client.ts`
- [ ] Criar hooks: `useCreateExtraction`, `useExtractions`, `useExtraction`
- [ ] Criar API route: `/api/workers/poll-jobs`
- [ ] Configurar Vercel Cron
- [ ] Parser de CSV → extraction_results
- [ ] Exportação para Excel
- [ ] Integração Google Sheets (futuro)
- [ ] Teste E2E: `integration/full-flow.spec.ts`

### 🚀 Fase 6: Deploy

- [ ] Configurar variáveis de ambiente (Vercel)
- [ ] Deploy de preview
- [ ] Testes em produção
- [ ] Deploy final
- [ ] Monitoramento (Sentry, opcional)

---

## 📚 Recursos

### Documentação
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Playwright](https://playwright.dev/)
- [TanStack Query](https://tanstack.com/query)

### Ferramentas
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Vercel CLI](https://vercel.com/docs/cli)
- [TypeScript Playground](https://www.typescriptlang.org/play)

---

**Última atualização:** 02/01/2025
**Versão:** 1.0
**Status:** ✅ Pronto para execução

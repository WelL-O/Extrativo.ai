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

CREATE TABLE IF NOT EXISTS profiles (
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
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- =====================================================
-- 2. SUBSCRIPTIONS
-- Planos e assinaturas dos usuários
-- =====================================================

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM (
        'trialing',      -- Período de teste
        'active',        -- Ativa
        'past_due',      -- Pagamento atrasado
        'canceled',      -- Cancelada
        'paused'         -- Pausada
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_plan AS ENUM (
        'free',          -- Gratuito (trial)
        'basic',         -- Básico: 10 buscas/mês
        'pro',           -- Pro: 50 buscas/mês
        'enterprise'     -- Enterprise: 200 buscas/mês
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS subscriptions (
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
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- =====================================================
-- 3. PROJECTS
-- Projetos para organizar extrações
-- =====================================================

CREATE TABLE IF NOT EXISTS projects (
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
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_active ON projects(user_id) WHERE deleted_at IS NULL;

-- =====================================================
-- 4. EXTRACTIONS
-- Jobs de scraping (histórico de extrações)
-- =====================================================

DO $$ BEGIN
    CREATE TYPE extraction_status AS ENUM (
        'pending',      -- Aguardando processamento
        'processing',   -- Em processamento
        'completed',    -- Concluído com sucesso
        'failed',       -- Falhou
        'canceled'      -- Cancelado pelo usuário
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop tabela extractions existente se houver (cuidado em produção!)
-- Comentado por segurança - descomentar apenas se necessário
-- DROP TABLE IF EXISTS extractions CASCADE;

CREATE TABLE IF NOT EXISTS extractions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_extractions_user ON extractions(user_id);
CREATE INDEX IF NOT EXISTS idx_extractions_project ON extractions(project_id);
CREATE INDEX IF NOT EXISTS idx_extractions_status ON extractions(status);
CREATE INDEX IF NOT EXISTS idx_extractions_user_status ON extractions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_extractions_created ON extractions(created_at DESC);

-- Index para busca full-text (futuro)
CREATE INDEX IF NOT EXISTS idx_extractions_query_gin ON extractions USING gin(to_tsvector('portuguese', query));

-- =====================================================
-- 5. EXTRACTION_RESULTS
-- Leads extraídos (dados do Google Maps)
-- =====================================================

CREATE TABLE IF NOT EXISTS extraction_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    extraction_id UUID NOT NULL REFERENCES extractions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

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
CREATE INDEX IF NOT EXISTS idx_results_extraction ON extraction_results(extraction_id);
CREATE INDEX IF NOT EXISTS idx_results_user ON extraction_results(user_id);
CREATE INDEX IF NOT EXISTS idx_results_title ON extraction_results(title);
CREATE INDEX IF NOT EXISTS idx_results_category ON extraction_results(category);
CREATE INDEX IF NOT EXISTS idx_results_location ON extraction_results(latitude, longitude);

-- Index para busca full-text
CREATE INDEX IF NOT EXISTS idx_results_title_gin ON extraction_results USING gin(to_tsvector('portuguese', title));
CREATE INDEX IF NOT EXISTS idx_results_address_gin ON extraction_results USING gin(to_tsvector('portuguese', address));

-- =====================================================
-- 6. TAGS
-- Tags para categorização
-- =====================================================

CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

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
CREATE INDEX IF NOT EXISTS idx_tags_user ON tags(user_id);

-- =====================================================
-- 7. EXTRACTION_TAGS
-- Relacionamento many-to-many entre extractions e tags
-- =====================================================

CREATE TABLE IF NOT EXISTS extraction_tags (
    extraction_id UUID NOT NULL REFERENCES extractions(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    PRIMARY KEY (extraction_id, tag_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_extraction_tags_extraction ON extraction_tags(extraction_id);
CREATE INDEX IF NOT EXISTS idx_extraction_tags_tag ON extraction_tags(tag_id);

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
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_extractions_updated_at ON extractions;
CREATE TRIGGER update_extractions_updated_at BEFORE UPDATE ON extractions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_extraction_results_updated_at ON extraction_results;
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
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
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
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created ON profiles;
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

DROP TRIGGER IF EXISTS on_extraction_completed ON extractions;
CREATE TRIGGER on_extraction_completed
    AFTER INSERT OR UPDATE ON extractions
    FOR EACH ROW EXECUTE FUNCTION increment_searches_used();

-- =====================================================
-- TRIGGER: Atualizar estatísticas do projeto
-- =====================================================

CREATE OR REPLACE FUNCTION update_project_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_project_id UUID;
BEGIN
    -- Determinar qual project_id usar
    v_project_id := COALESCE(
        CASE WHEN TG_OP = 'DELETE' THEN OLD.project_id ELSE NEW.project_id END,
        OLD.project_id
    );

    -- Só atualizar se houver um project_id
    IF v_project_id IS NOT NULL THEN
        UPDATE projects
        SET
            extractions_count = (
                SELECT COUNT(*)
                FROM extractions
                WHERE project_id = v_project_id
                  AND deleted_at IS NULL
            ),
            total_leads = (
                SELECT COALESCE(SUM(total_results), 0)
                FROM extractions
                WHERE project_id = v_project_id
                  AND deleted_at IS NULL
            )
        WHERE id = v_project_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_extraction_changed ON extractions;
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

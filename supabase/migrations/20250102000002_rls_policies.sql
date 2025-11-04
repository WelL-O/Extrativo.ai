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
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Usuários podem inserir seu próprio perfil (para signup)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- =====================================================
-- SUBSCRIPTIONS
-- =====================================================

-- Usuários podem ler sua própria assinatura
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
CREATE POLICY "Users can view own subscription"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Admin pode atualizar assinaturas (via service role)
-- Usuários não podem atualizar diretamente

-- =====================================================
-- PROJECTS
-- =====================================================

-- Usuários podem ver seus próprios projetos
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own projects"
    ON projects FOR SELECT
    USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Usuários podem criar projetos
DROP POLICY IF EXISTS "Users can create projects" ON projects;
CREATE POLICY "Users can create projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus projetos
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own projects"
    ON projects FOR UPDATE
    USING (auth.uid() = user_id);

-- Usuários podem deletar (soft delete) seus projetos
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
CREATE POLICY "Users can delete own projects"
    ON projects FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- EXTRACTIONS
-- =====================================================

-- Usuários podem ver suas próprias extrações
DROP POLICY IF EXISTS "Users can view own extractions" ON extractions;
CREATE POLICY "Users can view own extractions"
    ON extractions FOR SELECT
    USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Usuários podem criar extrações
DROP POLICY IF EXISTS "Users can create extractions" ON extractions;
CREATE POLICY "Users can create extractions"
    ON extractions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas extrações
DROP POLICY IF EXISTS "Users can update own extractions" ON extractions;
CREATE POLICY "Users can update own extractions"
    ON extractions FOR UPDATE
    USING (auth.uid() = user_id);

-- Usuários podem deletar suas extrações
DROP POLICY IF EXISTS "Users can delete own extractions" ON extractions;
CREATE POLICY "Users can delete own extractions"
    ON extractions FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- EXTRACTION_RESULTS
-- =====================================================

-- Usuários podem ver seus próprios resultados
DROP POLICY IF EXISTS "Users can view own results" ON extraction_results;
CREATE POLICY "Users can view own results"
    ON extraction_results FOR SELECT
    USING (auth.uid() = user_id);

-- Apenas sistema pode inserir resultados (via service role)
-- Usuários não podem criar/editar/deletar resultados manualmente

-- =====================================================
-- TAGS
-- =====================================================

-- Usuários podem ver suas próprias tags
DROP POLICY IF EXISTS "Users can view own tags" ON tags;
CREATE POLICY "Users can view own tags"
    ON tags FOR SELECT
    USING (auth.uid() = user_id);

-- Usuários podem criar tags
DROP POLICY IF EXISTS "Users can create tags" ON tags;
CREATE POLICY "Users can create tags"
    ON tags FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas tags
DROP POLICY IF EXISTS "Users can update own tags" ON tags;
CREATE POLICY "Users can update own tags"
    ON tags FOR UPDATE
    USING (auth.uid() = user_id);

-- Usuários podem deletar suas tags
DROP POLICY IF EXISTS "Users can delete own tags" ON tags;
CREATE POLICY "Users can delete own tags"
    ON tags FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- EXTRACTION_TAGS
-- =====================================================

-- Usuários podem ver tags de suas extrações
DROP POLICY IF EXISTS "Users can view tags of own extractions" ON extraction_tags;
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
DROP POLICY IF EXISTS "Users can add tags to own extractions" ON extraction_tags;
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
DROP POLICY IF EXISTS "Users can remove tags from own extractions" ON extraction_tags;
CREATE POLICY "Users can remove tags from own extractions"
    ON extraction_tags FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM extractions
            WHERE id = extraction_tags.extraction_id
              AND user_id = auth.uid()
        )
    );

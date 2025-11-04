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
    v_status subscription_status;
BEGIN
    SELECT searches_used, searches_limit, status
    INTO v_searches_used, v_searches_limit, v_status
    FROM subscriptions
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Permitir se status for trialing ou active
    IF v_status NOT IN ('trialing', 'active') THEN
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
      AND status IN ('trialing', 'active');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Exportar extraction para JSON
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
            'review_rating', review_rating,
            'link', link,
            'cid', cid,
            'complete_address', complete_address,
            'plus_code', plus_code,
            'timezone', timezone,
            'open_hours', open_hours,
            'popular_times', popular_times,
            'thumbnail', thumbnail,
            'status', status,
            'description', description,
            'price_range', price_range
        )
    )
    INTO v_results
    FROM extraction_results
    WHERE extraction_id = p_extraction_id;

    RETURN COALESCE(v_results, '[]'::jsonb);
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

-- =====================================================
-- FUNCTION: Obter progresso de extraction em tempo real
-- =====================================================

CREATE OR REPLACE FUNCTION get_extraction_progress(p_extraction_id UUID)
RETURNS TABLE (
    id UUID,
    query TEXT,
    status extraction_status,
    progress INTEGER,
    total_results INTEGER,
    started_at TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.query,
        e.status,
        e.progress,
        e.total_results,
        e.started_at,
        -- Estimativa baseada no progresso atual
        CASE
            WHEN e.progress > 0 AND e.started_at IS NOT NULL
            THEN e.started_at + (
                (EXTRACT(EPOCH FROM (NOW() - e.started_at)) / e.progress) * 100
            ) * INTERVAL '1 second'
            ELSE NULL
        END AS estimated_completion
    FROM extractions e
    WHERE e.id = p_extraction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Obter resumo de projeto
-- =====================================================

CREATE OR REPLACE FUNCTION get_project_summary(p_project_id UUID)
RETURNS TABLE (
    project_id UUID,
    project_name TEXT,
    total_extractions BIGINT,
    total_leads BIGINT,
    completed_extractions BIGINT,
    failed_extractions BIGINT,
    last_extraction_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.extractions_count::BIGINT,
        p.total_leads::BIGINT,
        (SELECT COUNT(*) FROM extractions WHERE project_id = p.id AND status = 'completed' AND deleted_at IS NULL)::BIGINT,
        (SELECT COUNT(*) FROM extractions WHERE project_id = p.id AND status = 'failed' AND deleted_at IS NULL)::BIGINT,
        (SELECT MAX(created_at) FROM extractions WHERE project_id = p.id AND deleted_at IS NULL)
    FROM projects p
    WHERE p.id = p_project_id
      AND p.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMENTÁRIOS (Documentação das funções)
-- =====================================================

COMMENT ON FUNCTION can_create_extraction(UUID) IS 'Verifica se usuário pode criar uma nova extraction baseado no limite do plano';
COMMENT ON FUNCTION get_user_stats(UUID) IS 'Retorna estatísticas completas do usuário (extrações, leads, projetos, plano)';
COMMENT ON FUNCTION reset_monthly_searches() IS 'Reseta contadores de buscas mensais (executar via cron)';
COMMENT ON FUNCTION export_extraction_to_json(UUID) IS 'Exporta resultados de uma extraction para formato JSON';
COMMENT ON FUNCTION search_extractions(UUID, TEXT) IS 'Busca full-text nas queries de extractions do usuário';
COMMENT ON FUNCTION get_extraction_progress(UUID) IS 'Retorna progresso e estimativa de conclusão de uma extraction';
COMMENT ON FUNCTION get_project_summary(UUID) IS 'Retorna resumo completo de um projeto com estatísticas';

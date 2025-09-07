-- SCRIPT PARA VERIFICAR CONFIGURAÇÃO DO GOOGLE OAUTH NO SUPABASE
-- Execute este script no SQL Editor do Supabase

-- Verificar se o provider Google está habilitado
SELECT
    name,
    enabled,
    client_id,
    client_secret,
    redirect_uris
FROM auth.providers
WHERE name = 'google';

-- Verificar configurações de autenticação
SELECT
    site_url,
    additional_redirect_urls
FROM auth.settings;

-- Verificar se há usuários OAuth conectados
SELECT
    id,
    email,
    created_at,
    last_sign_in_at,
    raw_app_meta_data
FROM auth.users
WHERE raw_app_meta_data->>'provider' = 'google'
ORDER BY created_at DESC
LIMIT 5;

-- Verificar tentativas de login recentes (últimas 24h)
SELECT
    event_type,
    created_at,
    ip_address,
    user_agent
FROM auth.audit_log_entries
WHERE event_type IN ('login', 'signup', 'oauth')
    AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 10;

-- Verificar se há erros de OAuth
SELECT
    event_type,
    created_at,
    ip_address,
    raw_data
FROM auth.audit_log_entries
WHERE event_type = 'oauth_error'
    AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

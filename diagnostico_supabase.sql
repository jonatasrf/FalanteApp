-- Script de diagnóstico para identificar problemas no Supabase

-- 1. Verificar se estamos no schema correto
SELECT current_schema();

-- 2. Listar todas as tabelas disponíveis
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 3. Verificar se a tabela user_progress existe
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_progress'
) as user_progress_exists;

-- 4. Se existir, mostrar sua estrutura
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_progress' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Verificar se a coluna conversation_progress já existe
SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_progress'
    AND column_name = 'conversation_progress'
    AND table_schema = 'public'
) as conversation_progress_exists;

-- 6. Mostrar alguns registros de exemplo (se existirem)
SELECT COUNT(*) as total_records FROM user_progress;

-- 7. Verificar permissões da tabela
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'user_progress' AND table_schema = 'public';

-- 8. Teste básico de UPDATE (se houver registros)
-- SELECT user_id FROM user_progress LIMIT 1;

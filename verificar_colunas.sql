-- SQL PARA VERIFICAR SE TODAS AS COLUNAS NECESSÁRIAS ESTÃO CRIADAS

-- 1. Verificar se a tabela user_progress existe
SELECT
    table_name,
    table_schema
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'user_progress';

-- 2. Verificar todas as colunas da tabela user_progress
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_progress'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar especificamente se a coluna conversation_progress existe
SELECT
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_progress'
AND column_name = 'conversation_progress'
AND table_schema = 'public';

-- 4. Verificar se há dados na tabela (opcional)
SELECT
    COUNT(*) as total_registros,
    COUNT(CASE WHEN conversation_progress IS NOT NULL THEN 1 END) as registros_com_progresso
FROM user_progress;

-- 5. Mostrar um exemplo dos dados (se existir)
SELECT
    user_id,
    LEFT(conversation_progress::text, 100) as progresso_preview
FROM user_progress
WHERE conversation_progress IS NOT NULL
LIMIT 3;

-- SCRIPT PARA DIAGNOSTICAR E CORRIGIR PROBLEMAS DE SALVAMENTO DE PROGRESSO
-- Execute estes comandos no SQL Editor do Supabase

-- 1. Verificar se a tabela user_progress existe e sua estrutura
SELECT
    table_name,
    table_schema
FROM
    information_schema.tables
WHERE
    table_name = 'user_progress';

-- 2. Verificar colunas da tabela user_progress
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM
    information_schema.columns
WHERE
    table_name = 'user_progress'
ORDER BY
    ordinal_position;

-- 3. Verificar políticas RLS (Row Level Security)
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    tablename = 'user_progress';

-- 4. Verificar dados existentes para o usuário problemático
SELECT
    user_id,
    correct_sentences_count,
    current_streak,
    max_streak,
    conversation_progress,
    created_at,
    updated_at
FROM
    user_progress
WHERE
    user_id = '087a26b5-0bc4-4774-9e57-763ced865a72';

-- 5. Teste de update simples (se o registro existir)
UPDATE user_progress
SET
    correct_sentences_count = correct_sentences_count + 1,
    updated_at = NOW()
WHERE
    user_id = '087a26b5-0bc4-4774-9e57-763ced865a72';

-- 6. Verificar se há problemas de tipo de dados na coluna conversation_progress
-- Se conversation_progress for JSONB, isso deve funcionar:
UPDATE user_progress
SET
    conversation_progress = COALESCE(conversation_progress, '{}'::jsonb) || '{"test": {"dialogue_completed": true}}'::jsonb,
    updated_at = NOW()
WHERE
    user_id = '087a26b5-0bc4-4774-9e57-763ced865a72';

-- 7. Se a coluna conversation_progress for TEXT, converter para JSONB
-- Primeiro verificar o tipo atual:
SELECT
    column_name,
    data_type
FROM
    information_schema.columns
WHERE
    table_name = 'user_progress'
    AND column_name = 'conversation_progress';

-- 8. Se for TEXT, pode ser necessário converter. Mas primeiro, vamos tentar
-- uma abordagem mais simples: verificar se o problema é com RLS

-- 9. Desabilitar temporariamente RLS para teste (NÃO FAÇA ISSO EM PRODUÇÃO!)
-- ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;

-- 10. Testar update sem RLS
-- UPDATE user_progress SET correct_sentences_count = 1 WHERE user_id = '087a26b5-0bc4-4774-9e57-763ced865a72';

-- 11. Reabilitar RLS
-- ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- 12. Verificar se o problema é com a política de UPDATE
-- Políticas RLS típicas para user_progress:

-- Política para SELECT (usuários podem ver apenas seus próprios dados)
-- CREATE POLICY "Users can view own progress" ON user_progress
-- FOR SELECT USING (auth.uid() = user_id);

-- Política para INSERT (usuários podem inserir apenas seus próprios dados)
-- CREATE POLICY "Users can insert own progress" ON user_progress
-- FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE (usuários podem atualizar apenas seus próprios dados)
-- CREATE POLICY "Users can update own progress" ON user_progress
-- FOR UPDATE USING (auth.uid() = user_id);

-- 13. Verificar se auth.uid() está funcionando corretamente
-- SELECT auth.uid();

-- 14. Verificar se o usuário está realmente autenticado
-- SELECT auth.jwt();

-- 15. POSSÍVEL FIX: Recriar a política de UPDATE se estiver faltando
-- DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
-- CREATE POLICY "Users can update own progress" ON user_progress
-- FOR UPDATE USING (auth.uid() = user_id);

-- 16. Verificar se há índices necessários
-- CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- 17. Verificar se há triggers que podem estar causando problemas
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM
    information_schema.triggers
WHERE
    event_object_table = 'user_progress';

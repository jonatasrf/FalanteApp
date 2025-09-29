-- SCRIPT PARA ADICIONAR A COLUNA MAX_STREAK FALTANTE
-- Execute este comando no SQL Editor do Supabase

-- 1. Adicionar a coluna max_streak à tabela user_progress
ALTER TABLE user_progress
ADD COLUMN IF NOT EXISTS max_streak INTEGER DEFAULT 0;

-- 2. Verificar se a coluna foi adicionada
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM
    information_schema.columns
WHERE
    table_name = 'user_progress'
    AND column_name = 'max_streak';

-- 3. Atualizar registros existentes que não têm max_streak definido
-- (Definir max_streak como o valor atual de current_streak ou 0)
UPDATE user_progress
SET max_streak = GREATEST(COALESCE(current_streak, 0), 0)
WHERE max_streak IS NULL;

-- 4. Verificar se os dados foram atualizados corretamente
SELECT
    user_id,
    correct_sentences_count,
    current_streak,
    max_streak,
    created_at,
    updated_at
FROM
    user_progress
WHERE
    user_id = '087a26b5-0bc4-4774-9e57-763ced865a72';

-- 5. Teste de update para verificar se agora funciona
UPDATE user_progress
SET
    correct_sentences_count = correct_sentences_count + 1,
    current_streak = current_streak + 1,
    max_streak = GREATEST(max_streak, current_streak + 1),
    updated_at = NOW()
WHERE
    user_id = '087a26b5-0bc4-4774-9e57-763ced865a72';

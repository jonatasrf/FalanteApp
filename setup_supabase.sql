-- Script para configurar a tabela user_progress existente para armazenar progresso de conversas

-- Primeiro, verificar se a tabela user_progress existe
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'user_progress';

-- Verificar estrutura atual da tabela user_progress
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_progress'
ORDER BY ordinal_position;

-- Adicionar coluna JSON para armazenar progresso de conversas na tabela user_progress
-- Usando DO $$ para tratamento de erro
DO $$
BEGIN
    -- Verificar se a coluna já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_progress' AND column_name = 'conversation_progress'
    ) THEN
        -- Adicionar a coluna
        ALTER TABLE user_progress
        ADD COLUMN conversation_progress JSONB DEFAULT '{}';

        RAISE NOTICE 'Coluna conversation_progress adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna conversation_progress já existe.';
    END IF;
END $$;

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_progress'
ORDER BY ordinal_position;

-- Teste: Inserir um registro de teste (opcional)
-- UPDATE user_progress
-- SET conversation_progress = '{"test-conversation": {"current_phrase_index": 0, "user_input": "", "is_correct": false}}'
-- WHERE user_id = (SELECT user_id FROM user_progress LIMIT 1);

-- Verificar dados de exemplo
-- SELECT user_id, conversation_progress FROM user_progress LIMIT 3;

-- SOLUÇÃO RÁPIDA PARA O ERRO NO SUPABASE
-- Execute este script passo a passo no SQL Editor do Supabase

-- PASSO 1: Verificar se a tabela user_progress existe
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'user_progress';

-- Se não retornar nada, a tabela não existe. Você precisa criá-la primeiro:
-- CREATE TABLE user_progress (
--     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
--     correct_sentences_count INTEGER DEFAULT 0,
--     current_streak INTEGER DEFAULT 0,
--     session_completed_count_listen INTEGER DEFAULT 0,
--     last_level_up_count INTEGER DEFAULT 0,
--     last_diamond_count INTEGER DEFAULT 0,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- PASSO 2: Verificar estrutura atual
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_progress'
ORDER BY ordinal_position;

-- PASSO 3: Adicionar a coluna conversation_progress (execute apenas uma vez)
ALTER TABLE user_progress
ADD COLUMN IF NOT EXISTS conversation_progress JSONB DEFAULT '{}';

-- PASSO 4: Verificar se foi adicionada
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user_progress' AND column_name = 'conversation_progress';

-- PASSO 5: Teste com um update simples (opcional)
-- UPDATE user_progress
-- SET conversation_progress = '{"test": "ok"}'
-- WHERE user_id = (SELECT user_id FROM user_progress LIMIT 1);

-- PASSO 6: Verificar se o update funcionou
-- SELECT user_id, conversation_progress FROM user_progress LIMIT 1;

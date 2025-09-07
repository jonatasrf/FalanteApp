-- SCRIPT SIMPLES PARA RECRIAR A TABELA USER_PROGRESS (SEM BACKUP)
-- ⚠️  Use apenas se não houver dados importantes na tabela atual!

-- Deletar tabela existente
DROP TABLE IF EXISTS user_progress;

-- Criar nova tabela com todas as colunas necessárias
CREATE TABLE user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    correct_sentences_count INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    session_completed_count_listen INTEGER DEFAULT 0,
    last_level_up_count INTEGER DEFAULT 0,
    last_diamond_count INTEGER DEFAULT 0,
    conversation_progress JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_conversation_progress ON user_progress USING GIN(conversation_progress);

-- Verificar criação
SELECT
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_progress'
ORDER BY ordinal_position;

-- Confirmação
SELECT 'Tabela user_progress criada com sucesso!' as status;

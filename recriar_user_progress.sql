-- SCRIPT PARA RECRIAR A TABELA USER_PROGRESS COM TODAS AS COLUNAS NECESSÁRIAS

-- ⚠️  ATENÇÃO: Este script irá deletar a tabela existente!
-- Faça backup dos dados importantes antes de executar!

-- PASSO 1: Fazer backup dos dados existentes (se houver)
CREATE TABLE IF NOT EXISTS user_progress_backup AS
SELECT * FROM user_progress;

-- Verificar se o backup foi criado
SELECT COUNT(*) as registros_backup FROM user_progress_backup;

-- PASSO 2: Deletar a tabela existente (se existir)
DROP TABLE IF EXISTS user_progress;

-- PASSO 3: Recriar a tabela com todas as colunas necessárias
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

-- PASSO 4: Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_conversation_progress ON user_progress USING GIN(conversation_progress);

-- PASSO 5: Restaurar dados do backup (se existia tabela anterior)
INSERT INTO user_progress (
    id,
    user_id,
    correct_sentences_count,
    current_streak,
    session_completed_count_listen,
    last_level_up_count,
    last_diamond_count,
    conversation_progress,
    created_at,
    updated_at
)
SELECT
    id,
    user_id,
    correct_sentences_count,
    current_streak,
    session_completed_count_listen,
    last_level_up_count,
    last_diamond_count,
    COALESCE(conversation_progress, '{}'),
    created_at,
    updated_at
FROM user_progress_backup
WHERE user_id IS NOT NULL;

-- PASSO 6: Verificar se a tabela foi criada corretamente
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_progress'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- PASSO 7: Verificar se os dados foram restaurados
SELECT
    COUNT(*) as total_registros,
    COUNT(CASE WHEN conversation_progress IS NOT NULL AND conversation_progress != '{}' THEN 1 END) as registros_com_progresso
FROM user_progress;

-- PASSO 8: Limpar tabela de backup (opcional - descomente se quiser)
-- DROP TABLE IF EXISTS user_progress_backup;

-- Verificação final
SELECT 'Tabela user_progress recriada com sucesso!' as status;

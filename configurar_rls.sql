-- SCRIPT PARA CONFIGURAR POLÍTICAS RLS (Row Level Security) DA TABELA USER_PROGRESS

-- Habilitar RLS na tabela user_progress
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;

-- Criar política para SELECT (ler)
CREATE POLICY "Users can view own progress" ON user_progress
    FOR SELECT USING (auth.uid() = user_id);

-- Criar política para INSERT (inserir)
CREATE POLICY "Users can insert own progress" ON user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Criar política para UPDATE (atualizar)
CREATE POLICY "Users can update own progress" ON user_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Verificar se as políticas foram criadas
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'user_progress'
ORDER BY policyname;

-- Teste: Verificar se conseguimos fazer uma query básica
-- SELECT COUNT(*) FROM user_progress WHERE user_id = auth.uid();

-- Confirmação
SELECT 'Políticas RLS configuradas com sucesso!' as status;

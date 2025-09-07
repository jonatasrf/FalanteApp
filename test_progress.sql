-- Script para testar o sistema de progresso de conversas usando user_progress

-- Verificar estrutura da tabela user_progress
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_progress'
ORDER BY ordinal_position;

-- Verificar dados existentes (substitua 'your-user-id' pelo ID real do usuário)
-- SELECT user_id, conversation_progress FROM user_progress WHERE user_id = 'your-user-id';

-- Exemplo de como os dados ficam armazenados no JSONB:
-- {
--   "conversation-id-1": {
--     "current_phrase_index": 2,
--     "user_input": "Hello, how are you?",
--     "is_correct": true,
--     "dialogue_completed": false,
--     "updated_at": "2025-01-01T12:00:00.000Z"
--   }
-- }

-- Para consultar dados específicos de uma conversa:
-- SELECT
--   user_id,
--   conversation_progress->'conversation-id-1'->>'current_phrase_index' as current_phrase,
--   conversation_progress->'conversation-id-1'->>'user_input' as user_input,
--   conversation_progress->'conversation-id-1'->>'is_correct' as is_correct
-- FROM user_progress
-- WHERE user_id = 'your-user-id';

-- Limpar dados de teste (se necessário)
-- UPDATE user_progress SET conversation_progress = '{}' WHERE user_id = 'test-user-id';

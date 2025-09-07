# Configuração do Supabase para Sistema de Progresso

## 📋 Problema
O sistema de salvamento automático do progresso das conversas não está funcionando. Vamos usar a tabela `user_progress` existente para armazenar o progresso das conversas.

## 🔧 Solução Rápida
Se você está tendo erro ao executar o script, use o **`solucao_rapida.sql`** que tem diagnóstico passo a passo.

## 🗑️ **Recriar Tabela user_progress**
Se você quer deletar e recriar a tabela completamente:

### **Opção 1: Com Backup (Recomendado)**
- **Arquivo:** `recriar_user_progress.sql`
- **Função:** Faz backup, deleta e recria a tabela
- **Use quando:** Há dados importantes que não quer perder

### **Opção 2: Sem Backup (Rápido)**
- **Arquivo:** `recriar_simples.sql`
- **Função:** Deleta e recria a tabela sem backup
- **Use quando:** Não há dados importantes ou quer começar do zero

## 🔒 **Configurar Permissões RLS**
Se você está recebendo erro 403, configure as permissões:

### **Arquivo:** `configurar_rls.sql`
- **Função:** Configura políticas de segurança para a tabela
- **Use quando:** Erro 403 (Forbidden) ao acessar dados
- **IMPORTANTE:** Execute após recriar a tabela

## 🔧 Solução Completa
Execute o script SQL abaixo no seu painel do Supabase para adicionar uma coluna JSON na tabela `user_progress` existente.

## 📝 Script SQL Necessário

### 1. Adicionar Coluna JSON na Tabela `user_progress`

```sql
-- Execute este script no SQL Editor do Supabase
ALTER TABLE user_progress
ADD COLUMN IF NOT EXISTS conversation_progress JSONB DEFAULT '{}';
```

### 2. Verificar se a Coluna Foi Adicionada

```sql
-- Execute este script para verificar
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_progress'
ORDER BY ordinal_position;
```

## 🧪 Teste do Sistema

### 1. Teste Básico
Após executar o script acima, teste o sistema:
1. Abra uma conversa
2. Digite algo no campo de texto
3. Aguarde 1 segundo (tempo de debouncing)
4. Verifique no console do navegador se aparece: "Salvando progresso: {...}"
5. Saia da conversa e volte para ver se o progresso foi salvo

### 2. Verificar no Supabase
```sql
-- Substitua 'your-user-id' pelo ID real do usuário
SELECT user_id, conversation_progress
FROM user_progress
WHERE user_id = 'your-user-id';
```

## 📊 Estrutura da Tabela `user_progress`

Após a configuração, a tabela terá uma nova coluna:

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| ... | ... | ... | Existing columns |
| conversation_progress | JSONB | '{}' | Conversation progress data |

### 📋 Formato dos Dados JSON
```json
{
  "conversation-id-1": {
    "current_phrase_index": 2,
    "user_input": "Hello, how are you?",
    "is_correct": true,
    "dialogue_completed": false,
    "updated_at": "2025-01-01T12:00:00.000Z"
  },
  "conversation-id-2": {
    "current_phrase_index": 0,
    "user_input": "",
    "is_correct": false,
    "dialogue_completed": false,
    "updated_at": "2025-01-01T12:05:00.000Z"
  }
}
```

## 🚨 Troubleshooting

### Se ainda não estiver salvando:

1. **Execute o diagnóstico primeiro:**
   ```sql
   -- Execute o arquivo diagnostico_supabase.sql
   -- Ele irá identificar exatamente qual é o problema
   ```

2. **Possíveis problemas e soluções:**

   **Problema: Tabela `user_progress` não existe**
   ```sql
   -- Verifique se a tabela existe
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public' AND table_name = 'user_progress';
   ```

   **Problema: Coluna já existe**
   ```sql
   -- Verifique se a coluna já existe
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'user_progress' AND column_name = 'conversation_progress';
   ```

   **Problema: Permissões insuficientes**
   - Vá no Supabase Dashboard → Authentication → Policies
   - Verifique se há políticas RLS que impedem updates

3. **Confirme que o usuário está logado** (não é guest)
4. **Verifique os logs do console** do navegador
5. **Teste a conexão com o Supabase** executando uma query simples

### Logs Importantes:
- Procure por: `Salvando progresso: {...}`
- Procure por erros relacionados ao Supabase
- Verifique se `session.user` existe

### 🔧 Scripts Disponíveis:
- **`solucao_rapida.sql`** - ✅ **USE ESTE PRIMEIRO** - Solução passo a passo
- **`recriar_user_progress.sql`** - 🔄 Recriar tabela com backup
- **`recriar_simples.sql`** - ⚡ Recriar tabela sem backup
- **`configurar_rls.sql`** - 🔒 Configurar permissões RLS (403 Forbidden)
- **`verificar_colunas.sql`** - 🔍 Verificar se tudo está criado
- **`diagnostico_supabase.sql`** - 🩺 Diagnóstico completo dos problemas
- **`setup_supabase.sql`** - 🛠️ Script robusto com tratamento de erros
- **`test_progress.sql`** - 🧪 Scripts para testar o sistema

## ✅ Confirmação de Sucesso

Quando estiver funcionando corretamente, você verá:
1. ✅ Console log: "Salvando progresso: {...}"
2. ✅ Dados aparecem na coluna `conversation_progress` da tabela `user_progress`
3. ✅ Progresso é restaurado ao voltar à conversa
4. ✅ Sem erros no console relacionados ao salvamento

## 📞 Suporte

Se ainda tiver problemas:
1. Execute os scripts SQL exatamente como mostrados
2. Verifique se não há erros de sintaxe
3. Confirme que a tabela `user_progress` existe e tem a coluna `conversation_progress`
4. Teste com um usuário logado (não guest)

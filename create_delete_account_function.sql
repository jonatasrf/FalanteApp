-- =====================================================
-- TUTORIAL COMPLETO: CRIANDO EDGE FUNCTION PARA DELETAR CONTAS
-- =====================================================
-- Execute estes passos no Supabase Dashboard

-- PASSO 1: CONFIGURAR VARIÁVEIS DE AMBIENTE
-- ==========================================
-- Vá para: Project Settings → API → Project URL / API Keys
-- Pegue:
-- • Project URL (ex: https://abcdefghijklmnop.supabase.co)
-- • Anon Key (vamos usar na função)

-- Nota: O SERVICE ROLE KEY é criado automaticamente pelo Supabase
-- Não precisa fazer nada para obtê-lo, a Edge Function acessa automaticamente

-- PASSO 2: CRIAR EDGE FUNCTION
-- ============================
-- Vá para: Edge Functions (no menu lateral esquerdo)
-- Clique em "Create a new function"
-- Nome: "delete-account"

-- Cole o código abaixo no arquivo index.ts:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  console.log('Delete account function called')

    // Permitir preflight requests (OPTIONS) para CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Max-Age': '86400',
      }
    })
  }

  // Apenas aceitar método POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  try {
    // Verificar se o usuário está autenticado
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.log('No authorization header')
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: corsHeaders
      })
    }

    // Criar cliente supabase com o token do usuário
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
      }
    )

    // Verificar se o token é válido e obter o usuário
    const { data: { user }, error: getUserError } = await supabaseClient.auth.getUser()
    if (getUserError || !user) {
      console.log('Unauthorized:', getUserError)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders
      })
    }

    console.log('Deleting account for user:', user.id)

    // Criar cliente admin (com poderes para deletar usuários)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // 🔑 ESTA CHAVE É CRIADA AUTOMATICAMENTE PELO SUPABASE
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 1. Deletar dados do usuário da tabela user_progress
    console.log('Deleting user progress...')
    const { error: progressError } = await supabaseAdmin
      .from('user_progress')
      .delete()
      .eq('user_id', user.id)

    if (progressError) {
      console.error('Error deleting user progress:', progressError)
      return new Response(JSON.stringify({
        error: 'Failed to delete user data',
        details: progressError.message
      }), {
        status: 500,
        headers: corsHeaders
      })
    }

    // 2. Deletar conta do auth.users (isso remove a conta permanentemente)
    console.log('Deleting user account...')
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Error deleting user account:', deleteError)
      return new Response(JSON.stringify({
        error: 'Failed to delete account',
        details: deleteError.message
      }), {
        status: 500,
        headers: corsHeaders
      })
    }

    console.log('Account deleted successfully')

    return new Response(JSON.stringify({
      success: true,
      message: 'Account and all data permanently deleted'
    }), {
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }
})
```

-- PASSO 3: DEPLOY DA FUNÇÃO
-- ========================
-- Após colar o código, clique em "Deploy Function"
-- Espere aparecer: "Function deployed successfully"

-- PASSO 4: TESTAR
-- ==============
-- Execute este comando no SQL Editor para testar:
-- SELECT * FROM edge_functions WHERE name = 'delete-account';

-- PASSO 5: FRONTEND JÁ ESTÁ CONFIGURADO
-- ====================================
-- O código em src/components/SettingsPage.jsx já está pronto para usar a função!

-- RESUMO DOS BENEFÍCIOS:
-- ✅ Deleta dados do usuário (user_progress)
-- ✅ Deleta permanentemente a conta do auth.users
-- ✅ Seguro (só funciona com usuário autenticado)
-- ✅ Usa as chaves corretas automaticamente
-- ✅ Sem precisar configurar service key manualmente!

-- SQL PARA CRIAR FUNÇÃO DE DELEÇÃO DE CONTA NO SUPABASE
-- Execute estes comandos no SQL Editor do Supabase Dashboard

-- 1. Primeiro, crie uma Edge Function para deletar contas
-- Vá para Supabase Dashboard → Edge Functions
-- Crie uma função chamada "delete-account"
-- Cole este código no arquivo index.ts da função:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // Verificar se a requisição é POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Verificar autenticação
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'No authorization header' }), { status: 401, headers: corsHeaders })
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: { headers: { Authorization: authHeader } },
    }
  )

  // Obter usuário atual
  const { data: { user }, error: getUserError } = await supabaseClient.auth.getUser()
  if (getUserError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    // 1. Deletar dados do usuário da tabela user_progress
    const { error: progressError } = await supabaseAdmin
      .from('user_progress')
      .delete()
      .eq('user_id', user.id)

    if (progressError) {
      console.error('Error deleting user progress:', progressError)
      return new Response(JSON.stringify({ error: 'Failed to delete user data' }), { status: 500, headers: corsHeaders })
    }

    // 2. Deletar conta do usuário
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Error deleting user account:', deleteError)
      return new Response(JSON.stringify({ error: 'Failed to delete account' }), { status: 500, headers: corsHeaders })
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Account and all data permanently deleted'
    }), { status: 200, headers: corsHeaders })

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: corsHeaders })
  }
})
```

-- 2. No frontend, use a Edge Function para deletar conta
-- Atualize o código em src/components/SettingsPage.jsx para:

-- // Substitua a função confirmDeleteAccount por:
-- const confirmDeleteAccount = async () => {
--     setShowConfirmDialog(false);
--
--     try {
--         const { data, error } = await supabase.functions.invoke('delete-account')
--
--         if (error) {
--             showToast(`Error deleting account: ${error.message}`, 'error');
--             return;
--         }
--
--         // Sign out após deletar
--         await supabase.auth.signOut();
--
--         // Redirecionar para HOME
--         window.location.href = '/';
--
--         showToast('✅ Account and all data permanently deleted!', 'success');
--
--     } catch (error) {
--         console.error('Error during account deletion:', error);
--         showToast('❌ Error deleting account. Please try again or contact support.', 'error');
--     }
-- };

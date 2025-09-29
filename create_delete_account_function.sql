-- SQL PARA CRIAR FUNÇÃO DE DELEÇÃO DE CONTA NO SUPABASE
-- Execute este comando no SQL Editor do Supabase Dashboard

-- 1. Criar função para deletar conta permanentemente
CREATE OR REPLACE FUNCTION delete_user_account(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    -- Verificar se o usuário existe
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = user_id) INTO user_exists;

    IF NOT user_exists THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    -- Deletar dados do usuário da tabela user_progress
    DELETE FROM user_progress WHERE user_id = user_id;

    -- Deletar a conta do usuário (requer service key ou admin access)
    -- Nota: Esta operação pode não funcionar do frontend
    -- DELETE FROM auth.users WHERE id = user_id;

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error deleting user account: %', SQLERRM;
END;
$$;

-- 2. Conceder permissões para usuários autenticados executarem a função
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;

-- 3. Testar a função (substitua pelo ID real do usuário)
-- SELECT delete_user_account('user-id-here');

-- 4. Verificar se a função foi criada
SELECT
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc
WHERE proname = 'delete_user_account';

-- 5. IMPORTANTE: Para deletar contas permanentemente, você precisa:
--    a) Usar a service key do Supabase (não a anon key)
--    b) Ou configurar uma Edge Function no Supabase
--    c) Ou deletar manualmente pelo Supabase Dashboard

-- 6. ALTERNATIVA RECOMENDADA: Criar uma Edge Function
-- Crie um arquivo na pasta supabase/functions/delete-account/index.ts:

-- import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
-- import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

-- serve(async (req) => {
--   const { userId } = await req.json()

--   const supabaseAdmin = createClient(
--     Deno.env.get('SUPABASE_URL') ?? '',
--     Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
--   )

--   // Deletar dados do usuário
--   await supabaseAdmin.from('user_progress').delete().eq('user_id', userId)

--   // Deletar conta
--   const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

--   if (error) {
--     return new Response(JSON.stringify({ error: error.message }), { status: 400 })
--   }

--   return new Response(JSON.stringify({ success: true }), { status: 200 })
-- })

-- 7. Para usar a Edge Function no frontend:
-- const { data, error } = await supabase.functions.invoke('delete-account', {
--   body: { userId: session.user.id }
-- });

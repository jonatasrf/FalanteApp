// SCRIPT DE DEBUG PARA PROBLEMA DE SALVAMENTO DE PROGRESSO
// Execute este código no console do navegador (F12) quando estiver logado

console.log('🔍 SUPABASE PROGRESS DEBUG');
console.log('===========================');

// 1. Verificar se estamos logados
async function checkAuth() {
    try {
        const { data: { user }, error } = await window.supabase.auth.getUser();
        if (error) {
            console.log('❌ Erro ao verificar autenticação:', error);
            return null;
        }
        console.log('✅ Usuário logado:', user?.id);
        return user;
    } catch (e) {
        console.log('❌ Erro ao verificar auth:', e);
        return null;
    }
}

// 2. Verificar estrutura da tabela user_progress
async function checkTableStructure(userId) {
    console.log('🔍 Verificando estrutura da tabela...');

    try {
        // Tentar fazer um select para ver os dados atuais
        const { data, error } = await window.supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.log('❌ Erro ao consultar tabela:', error);
            return null;
        }

        console.log('✅ Dados atuais do usuário:', data);
        return data;
    } catch (e) {
        console.log('❌ Erro ao consultar:', e);
        return null;
    }
}

// 3. Testar update simples
async function testSimpleUpdate(userId, currentData) {
    console.log('🧪 Testando update simples...');

    try {
        const testData = {
            correct_sentences_count: (currentData?.correct_sentences_count || 0) + 1,
            updated_at: new Date().toISOString()
        };

        console.log('📤 Enviando dados:', testData);

        const { data, error } = await window.supabase
            .from('user_progress')
            .update(testData)
            .eq('user_id', userId)
            .select();

        if (error) {
            console.log('❌ Erro no update:', error);
            console.log('📋 Detalhes do erro:', {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint
            });
            return false;
        }

        console.log('✅ Update bem-sucedido:', data);
        return true;
    } catch (e) {
        console.log('❌ Erro inesperado:', e);
        return false;
    }
}

// 4. Testar update de conversation_progress
async function testConversationUpdate(userId, currentData) {
    console.log('🧪 Testando update de conversation_progress...');

    try {
        const testConversationData = {
            ... (currentData?.conversation_progress || {}),
            'test-conversation': {
                dialogue_completed: true,
                updated_at: new Date().toISOString()
            }
        };

        const updateData = {
            conversation_progress: testConversationData,
            updated_at: new Date().toISOString()
        };

        console.log('📤 Enviando dados de conversa:', updateData);

        const { data, error } = await window.supabase
            .from('user_progress')
            .update(updateData)
            .eq('user_id', userId)
            .select();

        if (error) {
            console.log('❌ Erro no update de conversa:', error);
            console.log('📋 Detalhes do erro:', {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint
            });
            return false;
        }

        console.log('✅ Update de conversa bem-sucedido:', data);
        return true;
    } catch (e) {
        console.log('❌ Erro inesperado:', e);
        return false;
    }
}

// 5. Função principal de debug
window.debugProgressSaving = async function() {
    console.log('🚀 Iniciando debug de salvamento de progresso...');

    const user = await checkAuth();
    if (!user) return;

    const currentData = await checkTableStructure(user.id);
    if (!currentData) return;

    console.log('');
    console.log('📋 TESTES:');
    console.log('1. Teste de update simples...');
    const simpleResult = await testSimpleUpdate(user.id, currentData);

    console.log('');
    console.log('2. Teste de update de conversa...');
    const conversationResult = await testConversationUpdate(user.id, currentData);

    console.log('');
    console.log('📊 RESULTADOS:');
    console.log('Update simples:', simpleResult ? '✅ OK' : '❌ FALHA');
    console.log('Update conversa:', conversationResult ? '✅ OK' : '❌ FALHA');

    if (!simpleResult || !conversationResult) {
        console.log('');
        console.log('🔧 POSSÍVEIS SOLUÇÕES:');
        console.log('1. Verificar se a tabela user_progress existe');
        console.log('2. Verificar permissões RLS (Row Level Security)');
        console.log('3. Verificar se as colunas existem na tabela');
        console.log('4. Verificar tipos de dados das colunas');
        console.log('5. Verificar se o usuário tem permissão para UPDATE');
    }
};

// 6. Instruções
console.log('');
console.log('📋 COMO USAR:');
console.log('1. Faça login no site');
console.log('2. Abra o console (F12)');
console.log('3. Execute: debugProgressSaving()');
console.log('4. Verifique os resultados acima');
console.log('');
console.log('🔍 Este script irá testar diferentes tipos de updates');
console.log('para identificar exatamente onde está o problema.');

console.log('===========================');
console.log('DEBUG SCRIPT LOADED - Execute debugProgressSaving() to start!');

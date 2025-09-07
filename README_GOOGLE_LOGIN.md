# Configuração do Login com Google (Gmail)

## 📋 Pré-requisitos

1. **Conta Google Cloud Console**
2. **Projeto Supabase configurado**
3. **Domínio configurado** (para produção)

## 🔧 Passo 1: Configurar Google Cloud Console

### 1.1 Acesse o Google Cloud Console
- Vá para: https://console.cloud.google.com/
- Crie um novo projeto ou selecione um existente

### 1.2 Habilite a Google+ API
1. No menu lateral, vá para **"APIs & Services"** → **"Library"**
2. Procure por **"Google+ API"**
3. Clique em **"Enable"**

### 1.3 Configure as Credenciais OAuth
1. Vá para **"APIs & Services"** → **"Credentials"**
2. Clique em **"+ CREATE CREDENTIALS"** → **"OAuth 2.0 Client IDs"**
3. Configure:
   - **Application type:** `Web application`
   - **Name:** `Seu App Name`
   - **Authorized JavaScript origins:**
     - Para desenvolvimento: `http://localhost:5173` (ou sua porta)
     - Para produção: `https://seudominio.com`
   - **Authorized redirect URIs:**
     - Para desenvolvimento: `http://localhost:5173/auth/callback`
     - Para produção: `https://seudominio.com/auth/callback`

### 1.4 Anote as Credenciais
- **Client ID:** `seu-client-id.googleusercontent.com`
- **Client Secret:** `seu-client-secret`

## 🔧 Passo 2: Configurar Supabase

### 2.1 Acesse o Supabase Dashboard
1. Vá para seu projeto no Supabase
2. No menu lateral, vá para **"Authentication"** → **"Providers"**

### 2.2 Configure o Google Provider
1. Encontre **"Google"** na lista de providers
2. Clique para habilitar
3. Preencha:
   - **Client ID:** Cole o Client ID do Google
   - **Client Secret:** Cole o Client Secret do Google
   - **Redirect URLs:** Deve estar automaticamente configurado

### 2.3 Configurações Adicionais
- **Enabled:** ✅ Ativado
- **Auto-confirm:** ✅ Ativado (recomendado)

## 🔧 Passo 3: Configurar o Código

### 3.1 Verifique o supabaseClient.js
```javascript
// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### 3.2 Verifique as Variáveis de Ambiente
```bash
# .env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

## 🔧 Passo 4: Configurar Redirect (Opcional)

### 4.1 Se precisar de página de callback customizada:
```javascript
// src/App.jsx ou onde gerencia rotas
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          navigate('/dashboard'); // ou sua rota principal
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, [navigate]);

  return (
    // Seu JSX
  );
}
```

## 🧪 Teste do Login com Google

### ✅ **PASSO 1: Verificar URL Atual**
1. Execute `npm run dev`
2. Abra o navegador e acesse seu app
3. **ABRA O CONSOLE DO NAVEGADOR** (F12 → Console)
4. Clique em **"Continue with Google"**
5. **COPIE A URL** que aparece no console:
   ```
   🌐 Current Origin: http://localhost:XXXX
   🔗 Redirect URL will be: http://localhost:XXXX/auth/callback
   ```
6. **Anote a porta** (ex: 5173, 3000, 8080)

### ✅ **PASSO 2: Configurar Google Cloud Console**
1. Vá para: https://console.cloud.google.com/
2. **APIs & Services** → **Credentials**
3. Selecione seu **OAuth 2.0 Client ID**
4. Clique em **"Edit"**

#### **Authorized JavaScript origins:**
- Adicione exatamente: `http://localhost:XXXX`
- **Substitua XXXX pela porta que você anotou**

#### **Authorized redirect URIs:**
- Adicione exatamente: `http://localhost:XXXX/auth/callback`
- **Substitua XXXX pela porta que você anotou**

5. **SALVE** as alterações

### ✅ **PASSO 3: Verificar Supabase**
1. Vá para seu projeto no Supabase
2. **Authentication** → **Providers** → **Google**
3. Verifique se as URLs estão **EXATAMENTE iguais**:
   - Site URL: `http://localhost:XXXX`
   - Redirect URLs: `http://localhost:XXXX/auth/callback`

### ✅ **PASSO 4: Teste Final**
1. **Reinicie o servidor**: `npm run dev`
2. **Limpe o cache do navegador**: Ctrl+F5
3. **Teste novamente**
4. Deve funcionar agora! ✅

### Possíveis Problemas:

#### ❌ Erro: "Invalid OAuth access token"
- Verifique se o Client ID e Secret estão corretos
- Confirme se as URLs de redirect estão configuradas

#### ❌ Erro: "redirect_uri_mismatch" (CORREÇÃO DETALHADA)
Este é o erro mais comum! Siga estes passos:

##### **Passo 1: Verificar URL Atual**
1. Abra o console do navegador (F12)
2. Clique em "Continue with Google"
3. Procure no console: `Redirect URL: http://localhost:XXXX`
4. Anote a porta (ex: 5173, 3000, etc.)

##### **Passo 2: Corrigir Google Cloud Console**
1. Vá para https://console.cloud.google.com/
2. **APIs & Services** → **Credentials**
3. Selecione seu **OAuth 2.0 Client ID**
4. Clique em **"Edit"**
5. **Authorized JavaScript origins:**
   - Adicione: `http://localhost:XXXX` (substitua XXXX pela porta)
6. **Authorized redirect URIs:**
   - Adicione: `http://localhost:XXXX/auth/callback` (substitua XXXX pela porta)
7. **Salve as alterações**

##### **Passo 3: Verificar Supabase**
1. Vá para seu projeto no Supabase
2. **Authentication** → **Providers** → **Google**
3. Verifique se as URLs estão corretas
4. O Supabase deve ter automaticamente:
   - Site URL: `http://localhost:XXXX`
   - Redirect URLs: `http://localhost:XXXX/auth/callback`

##### **Passo 4: Teste Novamente**
1. Reinicie o servidor de desenvolvimento
2. Teste o login novamente
3. Deve funcionar agora!

#### ❌ Erro: "Access blocked: This app's request is invalid"
- Verifique se a Google+ API está habilitada
- Confirme se o OAuth consent screen está configurado

## 🔒 Configurações de Segurança

### 1. Restringir Domínios
No Google Cloud Console:
- **APIs & Services** → **Credentials**
- Selecione seu OAuth 2.0 Client ID
- Adicione apenas os domínios autorizados

### 2. Configurar Scopes (Opcional)
```javascript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    scopes: 'email profile',
    redirectTo: window.location.origin
  }
});
```

## 📱 Configuração para Produção

### 1. URLs de Produção
```bash
# Google Cloud Console - Authorized origins
https://seudominio.com

# Google Cloud Console - Redirect URIs
https://seudominio.com/auth/callback

# Supabase - Site URL
https://seudominio.com
```

### 2. HTTPS Obrigatório
- Google OAuth requer HTTPS em produção
- Configure SSL no seu domínio

## 🎯 Próximos Passos

Após configurar o login com Google:

1. ✅ **Teste completo** do fluxo de autenticação
2. ✅ **Configure RLS** nas tabelas do Supabase
3. ✅ **Implemente logout** funcional
4. ✅ **Adicione proteção de rotas** se necessário

## 📞 Suporte

### 🚨 **ERRO: redirect_uri_mismatch - SOLUÇÃO RÁPIDA**

#### **Passo 1: Execute o Debug**
1. Abra seu app no navegador
2. Pressione **F12** para abrir o console
3. **COPIE E COLE** o conteúdo do arquivo `debug_google_login.js` no console
4. Pressione **Enter**
5. Execute: `testGoogleLogin()`
6. **COPIE a URL** que aparece: `http://localhost:XXXX/auth/callback`

#### **Passo 2: Configure Google Cloud Console**
1. Vá para: https://console.cloud.google.com/
2. **APIs & Services** → **Credentials**
3. Selecione seu **OAuth 2.0 Client ID**
4. Clique em **"Edit"**
5. **Authorized JavaScript origins:** `http://localhost:XXXX`
6. **Authorized redirect URIs:** `http://localhost:XXXX/auth/callback`
7. **SALVE**

#### **Passo 3: Teste**
1. Reinicie: `npm run dev`
2. Limpe cache: **Ctrl+F5**
3. Teste o login novamente

### 🔧 **Outros Problemas:**

1. **Execute o script SQL de diagnóstico:**
   ```sql
   -- Execute verificar_google_oauth.sql no Supabase
   ```

2. **Verifique configurações:**
   - Supabase Dashboard → Authentication → Providers → Google
   - Site URL deve ser: `http://localhost:XXXX`

3. **URLs comuns:**
   - `http://localhost:5173` (Vite)
   - `http://localhost:3000` (React)
   - `http://localhost:8080` (Vue)

4. **Se ainda não funcionar:**
   - Teste com uma conta Google diferente
   - Verifique se a Google+ API está habilitada
   - Confirme se o OAuth consent screen está configurado

**O login com Google está pronto para uso!** 🚀

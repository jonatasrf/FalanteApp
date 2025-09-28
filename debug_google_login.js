// SCRIPT DE DEBUG PARA LOGIN COM GOOGLE
// Execute este código no console do navegador (F12) na página de login

console.log('🔍 GOOGLE LOGIN DEBUG');
console.log('========================');

// 1. Verificar URL atual
const currentOrigin = window.location.origin;
const baseUrl = import.meta.env.BASE_URL || '/';
console.log('🌐 Current Origin:', currentOrigin);
console.log('🔗 Base URL:', baseUrl);
console.log('🔗 Expected Redirect URL:', `${currentOrigin}${baseUrl}`);

// 2. Verificar se estamos na página correta
console.log('📍 Current URL:', window.location.href);

// 3. Verificar se o botão existe
const googleButton = document.querySelector('button[aria-label*="Google"], button:has(svg)');
if (googleButton) {
    console.log('✅ Google button found:', googleButton);
} else {
    console.log('❌ Google button NOT found');
}

// 4. Função de teste (copie e execute no console)
window.testGoogleLogin = function() {
    console.log('🧪 Testing Google Login...');

    // Simular o que o código faz
    const testOrigin = window.location.origin;
    const testBaseUrl = import.meta.env.BASE_URL || '/';
    const testRedirectUrl = `${testOrigin}${testBaseUrl}`;

    console.log('📤 Will redirect to:', testRedirectUrl);

    // Verificar se a URL parece correta
    if (testOrigin.includes('localhost')) {
        console.log('✅ Localhost detected - this should work for development');
    } else {
        console.log('⚠️ Not localhost - make sure this domain is configured in Google Cloud Console');
    }

    return {
        origin: testOrigin,
        baseUrl: testBaseUrl,
        redirectUrl: testRedirectUrl,
        isLocalhost: testOrigin.includes('localhost')
    };
};

// 5. Instruções
console.log('');
console.log('📋 NEXT STEPS:');
console.log('1. Execute: testGoogleLogin()');
console.log('2. Copy the "redirectUrl" value');
console.log('3. Go to Google Cloud Console');
console.log('4. Add this URL to "Authorized redirect URIs"');
console.log('5. Save and try again');
console.log('');
console.log('🎯 Example URLs to add in Google Cloud Console:');
console.log('- Authorized JavaScript origins: http://localhost:5173');
console.log('- Authorized redirect URIs: http://localhost:5173/FalanteApp/');
console.log('');
console.log('For production, replace localhost:5173 with your actual domain');
console.log('');
console.log('🔧 If still not working, check:');
console.log('- Supabase Dashboard → Authentication → Providers → Google');
console.log('- Make sure Site URL matches your current origin');

console.log('========================');
console.log('DEBUG COMPLETE - Check the output above!');

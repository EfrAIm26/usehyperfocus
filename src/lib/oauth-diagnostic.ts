// OAuth Diagnostic Tool
export const runOAuthDiagnostic = async () => {
  console.log('🔍 OAuth Diagnostic Tool');
  console.log('========================');
  
  // Check environment variables
  console.log('1. Environment Variables:');
  console.log('   VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('   VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  
  // Check current URL
  console.log('2. Current URL:');
  console.log('   Location:', window.location.href);
  console.log('   Origin:', window.location.origin);
  console.log('   Protocol:', window.location.protocol);
  console.log('   Host:', window.location.host);
  
  // Check for error parameters
  console.log('3. URL Parameters:');
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  
  console.log('   Search params:', Object.fromEntries(urlParams));
  console.log('   Hash params:', Object.fromEntries(hashParams));
  
  // Check for specific errors
  const error = urlParams.get('error') || hashParams.get('error');
  const errorCode = urlParams.get('error_code') || hashParams.get('error_code');
  const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
  
  if (error) {
    console.log('4. OAuth Error Detected:');
    console.log('   Error:', error);
    console.log('   Error Code:', errorCode);
    console.log('   Error Description:', errorDescription);
    
    // Provide specific solutions
    if (error === 'server_error') {
      console.log('5. Suggested Solutions:');
      console.log('   - Check Supabase Redirect URLs configuration');
      console.log('   - Verify Google Cloud Console OAuth settings');
      console.log('   - Ensure database tables exist and RLS policies are correct');
    }
  }
  
  // Test Supabase connection
  console.log('6. Supabase Connection Test:');
  try {
    const { supabase } = await import('./supabase');
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('   ❌ Supabase Auth Error:', error.message);
    } else {
      console.log('   ✅ Supabase Auth Connected');
      console.log('   Current Session:', data.session ? 'Active' : 'None');
    }
  } catch (err) {
    console.log('   ❌ Supabase Connection Failed:', err);
  }
  
  console.log('========================');
  console.log('Diagnostic Complete');
};

// Auto-run diagnostic on page load if there are error parameters
if (typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  
  if (urlParams.get('error') || hashParams.get('error')) {
    setTimeout(() => {
      runOAuthDiagnostic();
    }, 1000);
  }
}

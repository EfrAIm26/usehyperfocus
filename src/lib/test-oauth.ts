// OAuth Test Tool
export const testOAuthConfiguration = () => {
  console.log('🔍 OAuth Configuration Test');
  console.log('============================');
  
  // Check current environment
  console.log('1. Current Environment:');
  console.log('   URL:', window.location.href);
  console.log('   Origin:', window.location.origin);
  console.log('   Protocol:', window.location.protocol);
  console.log('   Host:', window.location.host);
  
  // Check Supabase configuration
  console.log('2. Supabase Configuration:');
  console.log('   VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('   Expected Supabase URL: https://wbxgiacprflxhwjeovkt.supabase.co');
  
  // Check if we're on the right domain
  const isProduction = window.location.hostname === 'usehyperfocus.com';
  const isVercel = window.location.hostname.includes('vercel.app');
  const isLocalhost = window.location.hostname === 'localhost';
  
  console.log('3. Domain Check:');
  console.log('   Is Production (usehyperfocus.com):', isProduction);
  console.log('   Is Vercel:', isVercel);
  console.log('   Is Localhost:', isLocalhost);
  
  // Expected redirect URLs based on domain
  console.log('4. Expected Redirect URLs:');
  if (isProduction) {
    console.log('   Should redirect to: https://usehyperfocus.com/auth/v1/callback');
  } else if (isVercel) {
    console.log('   Should redirect to: https://usehyperfocus.vercel.app/auth/v1/callback');
  } else if (isLocalhost) {
    console.log('   Should redirect to: http://localhost:5173/auth/v1/callback');
  }
  
  // Check for error parameters
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  
  console.log('5. Error Analysis:');
  const error = urlParams.get('error') || hashParams.get('error');
  const errorCode = urlParams.get('error_code') || hashParams.get('error_code');
  const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
  
  if (error) {
    console.log('   ❌ Error Found:');
    console.log('   Error:', error);
    console.log('   Code:', errorCode);
    console.log('   Description:', errorDescription);
    
    if (errorCode === 'bad_oauth_state') {
      console.log('   💡 Solution: This usually means redirect URI mismatch');
      console.log('   - Check Google Cloud Console redirect URIs');
      console.log('   - Ensure Supabase Site URL is correct');
      console.log('   - Wait 5-10 minutes for Google changes to propagate');
    }
  } else {
    console.log('   ✅ No OAuth errors detected');
  }
  
  console.log('============================');
};

// Auto-run if there are errors
if (typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  
  if (urlParams.get('error') || hashParams.get('error')) {
    setTimeout(() => {
      testOAuthConfiguration();
    }, 1000);
  }
}

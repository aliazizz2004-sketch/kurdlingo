// Fix Supabase Auth Site URL - run this once!
// Reads SUPABASE_ACCESS_TOKEN from environment
const PROJECT_REF = 'xoiexytawfnvttwmuaxg';

async function fixAuthConfig() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  
  if (!token) {
    console.error('\n❌ Error: SUPABASE_ACCESS_TOKEN not set!');
    console.error('\n📋 Steps to fix this manually in Supabase dashboard:');
    console.error('1. Go to: https://supabase.com/dashboard/project/xoiexytawfnvttwmuaxg/auth/url-configuration');
    console.error('2. Change "Site URL" to: https://dolingo.vercel.app');
    console.error('3. Add to "Redirect URLs":');
    console.error('   - https://dolingo.vercel.app/');
    console.error('   - http://localhost:5173/');
    console.error('4. Click Save\n');
    process.exit(1);
  }

  console.log('🔄 Updating Supabase Auth config...\n');

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        site_url: 'https://dolingo.vercel.app',
        additional_redirect_urls: 'https://dolingo.vercel.app,https://dolingo.vercel.app/,http://localhost:5173,http://localhost:5173/',
      }),
    }
  );

  const json = await res.json();

  if (!res.ok) {
    console.error('❌ Failed:', res.status, JSON.stringify(json, null, 2));
    process.exit(1);
  }

  console.log('✅ Done! Auth config updated:');
  console.log('  Site URL:', json.site_url);
  console.log('  Redirect URLs:', json.additional_redirect_urls);
}

fixAuthConfig().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

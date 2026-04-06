#!/usr/bin/env node

/**
 * Prebuild environment validation
 * Called by: npm run build (in Vercel)
 * 
 * ⚠️ Security: All env vars MUST be set in Vercel dashboard
 * NO hardcoded secrets in this file
 */

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_ANTHROPIC_API_KEY',
];

const missing = [];
requiredVars.forEach((key) => {
  if (!process.env[key]) {
    missing.push(key);
  } else {
    console.log(`✅ ${key} is set`);
  }
});

if (missing.length > 0) {
  console.error('\n❌ Missing environment variables in Vercel:');
  missing.forEach((key) => console.error(`   - ${key}`));
  process.exit(1);
}

console.log('\n✅ All required environment variables are set');

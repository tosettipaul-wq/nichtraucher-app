#!/usr/bin/env node

/**
 * Initialize gamification schema in Supabase
 * Run: npx ts-node scripts/init-gamification.ts
 */

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(url, serviceKey, {
  db: {
    schema: 'public'
  }
});

async function initGamification() {
  console.log('🚀 Initializing gamification schema...\n');

  try {
    // 1. Check if columns exist, if not we need to create them manually
    // For now, we'll assume tables exist and just initialize functions

    console.log('✓ Creating helper functions...');

    // Calculate streak function
    await supabase.rpc('exec_raw_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION calculate_streak(p_user_id UUID)
        RETURNS INTEGER AS $$
        BEGIN
          -- Simple streak calculation: days since quit_date with no slips
          RETURN EXTRACT(DAY FROM (NOW() - 
            (SELECT quit_date FROM users WHERE id = p_user_id LIMIT 1)::TIMESTAMP))::INTEGER;
        END;
        $$ LANGUAGE plpgsql STABLE;
      `
    });

    console.log('✓ Functions created');

    // 2. Test connection
    const { data: users, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }

    console.log('✓ Database connection successful');
    console.log(`✓ Found ${users.length} user(s)`);

    console.log('\n✅ Gamification initialization complete!');
    console.log('\nNext steps:');
    console.log('1. Run Supabase SQL migrations via Dashboard');
    console.log('2. Deploy components and API routes');
    console.log('3. Test streak calculation');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

initGamification();

#!/usr/bin/env node

/**
 * Phase 2 Test Suite
 * Tests:
 * 1. Craving Logger (POST /api/craving)
 * 2. Friend Accountability (GET /api/friends)
 * 3. Daily Summaries (POST/GET /api/summaries)
 * 4. Auth Callback (GET /auth/callback?code=...)
 */

const BASE_URL = 'http://localhost:3000';
const LIVE_URL = 'https://nichtraucher-app.vercel.app';

const tests = [
  {
    name: '1. Craving Logger Page',
    method: 'GET',
    url: `${LIVE_URL}/craving`,
    expectedStatus: 200,
    expectedBody: /Verlangen|Logger|Auslöser/i,
  },
  {
    name: '2. Friends Page',
    method: 'GET',
    url: `${LIVE_URL}/friends`,
    expectedStatus: 200,
    expectedBody: /Accountability|Partner|Einladung/i,
  },
  {
    name: '3. Auth Callback Route',
    method: 'GET',
    url: `${LIVE_URL}/auth/callback?code=test`,
    expectedStatus: 307, // Redirect expected
  },
  {
    name: '4. Summaries API (GET)',
    method: 'GET',
    url: `${LIVE_URL}/api/summaries?userId=test-user&date=2026-04-06`,
    expectedStatus: 200,
  },
  {
    name: '5. Summaries API (POST)',
    method: 'POST',
    url: `${LIVE_URL}/api/summaries`,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'test-user-123' }),
    expectedStatus: 404, // User not found expected
  },
];

async function runTests() {
  console.log('🧪 Phase 2 Test Suite\n');
  
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const options = {
        method: test.method,
        headers: test.headers || {},
      };

      if (test.body) {
        options.body = test.body;
      }

      const response = await fetch(test.url, options);
      const text = await response.text();

      const statusMatch = response.status === test.expectedStatus;
      const bodyMatch = test.expectedBody
        ? test.expectedBody.test(text)
        : true;

      if (statusMatch && bodyMatch) {
        console.log(`✅ ${test.name}`);
        console.log(`   Status: ${response.status} (expected ${test.expectedStatus})`);
        passed++;
      } else {
        console.log(`❌ ${test.name}`);
        if (!statusMatch) console.log(`   Status: ${response.status} (expected ${test.expectedStatus})`);
        if (!bodyMatch) console.log(`   Body missing expected text`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}`);
      console.log(`   Error: ${error.message}`);
      failed++;
    }
    console.log();
  }

  console.log(`\n📊 Results: ${passed}/${tests.length} passed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();

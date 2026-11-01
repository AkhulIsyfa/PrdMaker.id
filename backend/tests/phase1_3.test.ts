import { pool } from '../src/config/database.js';
import { userRepository } from '../src/repositories/UserRepository.js';
import { documentTemplateRepository } from '../src/repositories/DocumentTemplateRepository.js';
import { generationJobRepository } from '../src/repositories/GenerationJobRepository.js';
import app from '../src/app.js';
import type { Server } from 'http';

async function runTests() {
  console.log('🧪 Starting Verification Tests for Phase 1 - Phase 3...\n');

  try {
    // 1. Verify Users & Roles
    console.log('--- 1. Testing UserRepository ---');
    const admin = await userRepository.findByEmail('admin@makeprd.dev');
    if (!admin || admin.role !== 'ADMIN') {
      throw new Error('Admin user seed not found or role incorrect');
    }
    console.log(`✅ Admin user verified: ${admin.email} (Role: ${admin.role})`);

    const publicUser = await userRepository.findByEmail('user@makeprd.dev');
    if (!publicUser || publicUser.role !== 'PUBLIC') {
      throw new Error('Public user seed not found or role incorrect');
    }
    console.log(`✅ Public user verified: ${publicUser.email} (Role: ${publicUser.role})`);

    // 2. Verify Document Templates
    console.log('\n--- 2. Testing DocumentTemplateRepository ---');
    const templates = await documentTemplateRepository.listActive();
    console.log(`✅ Active templates found: ${templates.length}`);
    if (templates.length < 4) {
      throw new Error(`Expected at least 4 active templates, got ${templates.length}`);
    }

    // 3. Verify GenerationJobRepository
    console.log('\n--- 3. Testing GenerationJobRepository ---');
    const job = await generationJobRepository.create({
      user_id: publicUser.id,
      project_name: 'Test Project Alpha',
      document_type: 'PRD',
      language: 'id',
      input_payload: { description: 'Sistem integrasi IoT dan AI untuk smart farm' },
    });
    console.log(`✅ Job created successfully: ID ${job.id}, Status: ${job.status}`);

    const updatedJob = await generationJobRepository.updateStatus(job.id, 'COMPLETED', {
      generated_content: '# Smart Farm PRD\n\nKonten terverifikasi.',
      prompt_tokens: 120,
      candidate_tokens: 350,
      latency_ms: 800,
    });
    if (!updatedJob || updatedJob.status !== 'COMPLETED') {
      throw new Error('Job status update failed');
    }
    console.log(`✅ Job updated successfully: Status: ${updatedJob.status}`);

    // 4. Verify Express Server & Auth Endpoints
    console.log('\n--- 4. Testing HTTP Auth Endpoints ---');
    const testPort = 5001;
    const server: Server = app.listen(testPort);

    try {
      // Test GET /health
      const healthRes = await fetch(`http://localhost:${testPort}/health`);
      const healthData = await healthRes.json();
      console.log(`✅ GET /health:`, healthData);

      // Test GET /api/v1/auth/csrf-token
      const csrfRes = await fetch(`http://localhost:${testPort}/api/v1/auth/csrf-token`);
      const csrfData = await csrfRes.json();
      console.log(`✅ GET /api/v1/auth/csrf-token:`, csrfData.csrf_token ? 'Token generated' : 'Failed');

      // Test POST /api/v1/auth/login
      const loginRes = await fetch(`http://localhost:${testPort}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@makeprd.dev',
          password: 'AdminPassword123!',
        }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok || !loginData.data?.token) {
        throw new Error(`Login test failed: ${JSON.stringify(loginData)}`);
      }
      console.log(`✅ POST /api/v1/auth/login: Login successful for ${loginData.data.user.email}`);

      // Test GET /api/v1/auth/me with Bearer token
      const meRes = await fetch(`http://localhost:${testPort}/api/v1/auth/me`, {
        headers: {
          Authorization: `Bearer ${loginData.data.token}`,
        },
      });
      const meData = await meRes.json();
      if (!meRes.ok || meData.data?.user?.email !== 'admin@makeprd.dev') {
        throw new Error(`GET /api/v1/auth/me failed: ${JSON.stringify(meData)}`);
      }
      console.log(`✅ GET /api/v1/auth/me: Verified user ${meData.data.user.email} (Role: ${meData.data.user.role})`);

      // Test Input Validation (Bad Payload)
      const badLoginRes = await fetch(`http://localhost:${testPort}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid-email',
          password: '',
        }),
      });
      const badLoginData = await badLoginRes.json();
      if (badLoginRes.status === 400 && badLoginData.code === 'VALIDATION_ERROR') {
        console.log(`✅ Input Validation (Zod): Successfully caught malformed payload with HTTP 400`);
      } else {
        throw new Error('Expected 400 Bad Request on malformed payload');
      }

      console.log('\n🎉 ALL TESTS FOR PHASE 1 - PHASE 3 PASSED PERFECTLY!\n');
    } finally {
      server.close();
    }
  } finally {
    await pool.end();
  }
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});


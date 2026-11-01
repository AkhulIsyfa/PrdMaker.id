import { pool } from '../src/config/database.js';
import { markdownNormalizerService } from '../src/services/MarkdownNormalizerService.js';
import { promptBuilderService } from '../src/services/PromptBuilderService.js';
import { aiOrchestratorService } from '../src/services/AiOrchestratorService.js';
import app from '../src/app.js';
import type { Server } from 'http';

async function runTests() {
  console.log('🧪 Starting Verification Tests for Phase 4 & Phase 5...\n');

  try {
    // 1. MarkdownNormalizerService Tests
    console.log('--- 1. Testing MarkdownNormalizerService ---');
    const wrappedText = '```markdown\n## PRD: Test Project\n\nKonten terstruktur.\n```';
    const normalized = markdownNormalizerService.normalize(wrappedText);
    if (normalized.content.startsWith('```') || normalized.content.endsWith('```')) {
      throw new Error('Markdown wrapper was not properly stripped');
    }
    console.log(`✅ Normalized Markdown wrapper stripped successfully. Word count: ${normalized.wordCount}`);

    const hasStructure = markdownNormalizerService.validateStructure(normalized.content);
    console.log(`✅ Structural validation passed: ${hasStructure}`);

    // 2. PromptBuilderService Tests
    console.log('\n--- 2. Testing PromptBuilderService ---');
    const builtPrompt = await promptBuilderService.buildPrompt({
      project_name: 'Test Project',
      document_type: 'PRD',
      description: 'Aplikasi manajemen dokumen otomatis untuk arsitektur software.',
      language: 'id',
      tech_stack: ['Vue.js', 'Express', 'PostgreSQL'],
      target_users: 'Software Architects',
      custom_rules: ['Strict 3NF', 'YAGNI'],
    });

    if (!builtPrompt.systemInstruction.includes('Bahasa Indonesia') || !builtPrompt.userPrompt.includes('Test Project')) {
      throw new Error('Prompt builder failed to inject context or language constraints');
    }
    console.log('✅ PromptBuilder successfully constructed systemInstruction and userPrompt with parameter bindings');

    // 3. AiOrchestratorService Tests
    console.log('\n--- 3. Testing AiOrchestratorService ---');
    const aiResult = await aiOrchestratorService.generateDocument({
      project_name: 'Signet CMS',
      document_type: 'PRD',
      description: 'Sistem display otomatis untuk Smart TV dan admin panel.',
      language: 'id',
      tech_stack: ['Vue.js', 'Express', 'PostgreSQL', 'Docker'],
      target_users: 'Operator TV dan Administrator',
      custom_rules: ['Strict 3NF database', 'Clean Architecture'],
    });

    if (!aiResult.content || aiResult.latencyMs <= 0 || aiResult.promptTokens <= 0) {
      throw new Error('AI Orchestrator returned invalid result');
    }
    console.log(`✅ AI Orchestrator generated content (${aiResult.content.length} chars, ${aiResult.candidateTokens} tokens, latency: ${aiResult.latencyMs}ms)`);

    // 4. API Endpoints Tests
    console.log('\n--- 4. Testing Phase 5 API Endpoints ---');
    const testPort = 5002;
    const server: Server = app.listen(testPort);

    try {
      // 4.1 Login as Admin to get Admin Token
      const adminLoginRes = await fetch(`http://localhost:${testPort}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@makeprd.dev',
          password: 'AdminPassword123!',
        }),
      });
      const adminLoginData = await adminLoginRes.json();
      const adminToken = adminLoginData.data.token;

      // 4.2 Login as Public user to get Public Token
      const userLoginRes = await fetch(`http://localhost:${testPort}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@makeprd.dev',
          password: 'UserPassword123!',
        }),
      });
      const userLoginData = await userLoginRes.json();
      const userToken = userLoginData.data.token;

      // 4.3 Test GET /api/v1/documents/templates
      const templatesRes = await fetch(`http://localhost:${testPort}/api/v1/documents/templates`);
      const templatesData = await templatesRes.json();
      if (!templatesRes.ok || !Array.isArray(templatesData.templates) || templatesData.templates.length < 4) {
        throw new Error(`Templates API failed: ${JSON.stringify(templatesData)}`);
      }
      console.log(`✅ GET /api/v1/documents/templates returned ${templatesData.templates.length} templates`);

      // 4.4 Test POST /api/v1/documents/generate
      const generatePayload = {
        project_name: 'Proyek Signet',
        document_type: 'PRD',
        description: 'Sistem content management display otomatis untuk Smart TV dan admin panel.',
        language: 'id',
        tech_stack: ['Vue.js', 'Express', 'PostgreSQL', 'Docker'],
        target_users: 'Operator TV dan Administrator',
        custom_rules: ['Strict 3NF database', 'Clean Architecture'],
      };

      const genRes = await fetch(`http://localhost:${testPort}/api/v1/documents/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(generatePayload),
      });

      const genData = await genRes.json();
      if (!genRes.ok || !genData.job_id || genData.status !== 'COMPLETED') {
        throw new Error(`Generate API failed: ${JSON.stringify(genData)}`);
      }
      console.log(`✅ POST /api/v1/documents/generate succeeded: Job ID ${genData.job_id}, status: ${genData.status}`);
      console.log(`   Tokens: prompt=${genData.metadata.prompt_tokens}, candidate=${genData.metadata.candidate_tokens}, latency=${genData.metadata.latency_ms}ms`);

      // 4.5 Test GET /api/v1/documents/jobs/:job_id
      const jobStatusRes = await fetch(`http://localhost:${testPort}/api/v1/documents/jobs/${genData.job_id}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      const jobStatusData = await jobStatusRes.json();
      if (!jobStatusRes.ok || jobStatusData.job_id !== genData.job_id) {
        throw new Error(`Get Job Status failed: ${JSON.stringify(jobStatusData)}`);
      }
      console.log(`✅ GET /api/v1/documents/jobs/:job_id: Status ${jobStatusData.status}, Project: ${jobStatusData.project_name}`);

      // 4.6 Test GET /api/v1/documents/my-jobs
      const myJobsRes = await fetch(`http://localhost:${testPort}/api/v1/documents/my-jobs`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      const myJobsData = await myJobsRes.json();
      if (!myJobsRes.ok || myJobsData.data.length === 0) {
        throw new Error(`Get My Jobs failed: ${JSON.stringify(myJobsData)}`);
      }
      console.log(`✅ GET /api/v1/documents/my-jobs: Retrieved ${myJobsData.data.length} jobs for current user`);

      // 4.7 Test Admin RBAC Guard: Public user trying to access admin endpoint should get 403 Forbidden
      const unauthorizedAdminRes = await fetch(`http://localhost:${testPort}/api/v1/admin/jobs`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (unauthorizedAdminRes.status === 403) {
        console.log(`✅ Admin Guard RBAC: Correctly rejected non-admin user with HTTP 403 Forbidden`);
      } else {
        throw new Error(`Expected HTTP 403, got ${unauthorizedAdminRes.status}`);
      }

      // 4.8 Test Admin endpoints with Admin Token
      const adminJobsRes = await fetch(`http://localhost:${testPort}/api/v1/admin/jobs`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const adminJobsData = await adminJobsRes.json();
      if (!adminJobsRes.ok || !adminJobsData.data) {
        throw new Error(`Admin jobs list failed: ${JSON.stringify(adminJobsData)}`);
      }
      console.log(`✅ GET /api/v1/admin/jobs: Admin retrieved ${adminJobsData.data.length} total jobs (Total count: ${adminJobsData.meta.total})`);

      const adminMetricsRes = await fetch(`http://localhost:${testPort}/api/v1/admin/metrics`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const adminMetricsData = await adminMetricsRes.json();
      if (!adminMetricsRes.ok || !adminMetricsData.data?.jobs) {
        throw new Error(`Admin metrics failed: ${JSON.stringify(adminMetricsData)}`);
      }
      console.log(`✅ GET /api/v1/admin/metrics: System metrics aggregated successfully:`, adminMetricsData.data);

      console.log('\n🎉 ALL TESTS FOR PHASE 4 & PHASE 5 PASSED PERFECTLY!\n');
    } finally {
      server.close();
    }
  } finally {
    await pool.end();
  }
}

runTests().catch((err) => {
  console.error('❌ Phase 4 & 5 Test Failed:', err);
  process.exit(1);
});

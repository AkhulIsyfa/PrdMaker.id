import { aiClient, isAiConfigured, DEFAULT_AI_MODEL, AI_MODEL_CONFIG } from '../config/ai.js';
import { promptBuilderService } from './PromptBuilderService.js';
import { markdownNormalizerService } from './MarkdownNormalizerService.js';
import type { CreateDocumentJobDTO } from '../models/document.dto.js';

export interface GenerationResult {
  content: string;
  promptTokens: number;
  candidateTokens: number;
  latencyMs: number;
}

export class AiOrchestratorService {
  private maxRetries = 3;
  private baseDelayMs = 1000;
  private maxDelayMs = 8000;

  /**
   * Helper to sleep with promise
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Calculate exponential backoff with jitter
   */
  private calculateBackoff(attempt: number): number {
    const exponential = this.baseDelayMs * Math.pow(2, attempt);
    const jitter = Math.random() * 500;
    return Math.min(exponential + jitter, this.maxDelayMs);
  }

  /**
   * Execute document generation pipeline
   */
  async generateDocument(dto: CreateDocumentJobDTO): Promise<GenerationResult> {
    const startTime = Date.now();
    const { systemInstruction, userPrompt } = await promptBuilderService.buildPrompt(dto);

    // If Gemini API is not configured or in development without key, use intelligent mock generator
    if (!isAiConfigured || !aiClient) {
      console.warn('⚠️ GEMINI_API_KEY is not configured. Using deterministic mock engine for development.');
      return this.generateMockDocument(dto, startTime);
    }

    let attempt = 0;
    let lastError: any = null;

    while (attempt < this.maxRetries) {
      try {
        const response = await aiClient.models.generateContent({
          model: DEFAULT_AI_MODEL,
          contents: [
            {
              role: 'user',
              parts: [{ text: userPrompt }],
            },
          ],
          config: {
            systemInstruction,
            temperature: AI_MODEL_CONFIG.temperature,
            topP: AI_MODEL_CONFIG.topP,
            maxOutputTokens: AI_MODEL_CONFIG.maxOutputTokens,
          },
        });

        const rawText = response.text || '';
        const latencyMs = Date.now() - startTime;
        const normalized = markdownNormalizerService.normalize(rawText);

        const promptTokens = response.usageMetadata?.promptTokenCount || Math.ceil(userPrompt.length / 4);
        const candidateTokens = response.usageMetadata?.candidatesTokenCount || normalized.estimatedTokens;

        return {
          content: normalized.content,
          promptTokens,
          candidateTokens,
          latencyMs,
        };
      } catch (err: any) {
        lastError = err;
        attempt++;

        const status = err.status || err.statusCode || (err.message && err.message.includes('429') ? 429 : 500);
        const isRetryable = status === 429 || status === 500 || status === 503;

        if (isRetryable && attempt < this.maxRetries) {
          const delay = this.calculateBackoff(attempt);
          console.warn(`[AI Engine] Call failed with status ${status}. Retrying attempt ${attempt}/${this.maxRetries} after ${Math.round(delay)}ms...`);
          await this.sleep(delay);
        } else {
          break;
        }
      }
    }

    console.error('AI Generation failed after max retries:', lastError);
    const error: any = new Error(`AI Generation Service Error: ${lastError?.message || 'Upstream provider failure'}`);
    error.statusCode = 502;
    error.code = 'AI_GENERATION_FAILED';
    throw error;
  }

  /**
   * Deterministic mock generator for offline/test environments
   */
  private generateMockDocument(dto: CreateDocumentJobDTO, startTime: number): GenerationResult {
    const isId = dto.language === 'id';
    const techStack = Array.isArray(dto.tech_stack) ? dto.tech_stack.join(', ') : 'Vue 3, Node.js, PostgreSQL';

    let markdown = '';
    if (dto.document_type === 'PRD') {
      markdown = `## Product Requirements Document (PRD): ${dto.project_name}

### 1. Ikhtisar Sistem
- **Konsep Proyek**: ${dto.description}
- **Tujuan Utama**: Membangun spesifikasi fungsional dan teknis berkualitas tinggi untuk ${dto.project_name}.
- **Target Pengguna**: ${dto.target_users || 'Developer dan End-Users'}

### 2. Kebutuhan Fungsional (Functional Requirements)
1. **Manajemen Pengguna & Autentikasi**: Registrasi dan otentikasi berbasis peran (Admin & Publik).
2. **Mesin Pembuat Dokumen**: Kemampuan mengubah deskripsi input menjadi dokumen Markdown terstruktur.
3. **Penyimpanan Riwayat & Ekspor**: Pengguna dapat melihat daftar pekerjaan masa lalu dan mengunduh berkas .md.

### 3. Alur Kerja & Spesifikasi Pengguna
1. Pengguna memasukkan detail proyek (nama, jenis dokumen, bahasa, tumpukan teknologi).
2. Sistem memvalidasi payload dan membuat job dengan status PENDING.
3. Mesin AI memproses data dengan penegakan templat dan persona arsitek.
4. Pengguna melihat preview dokumen secara real-time dan mengekspor hasilnya.

### 4. Batasan Teknis & Arsitektur
- **Front-end**: Vue.js 3, Vite, Pinia, Tailwind CSS.
- **Back-end**: Node.js, Express.js, TypeScript.
- **Database**: PostgreSQL dengan skema 3NF.
- **Aturan Tambahan**: ${Array.isArray(dto.custom_rules) && dto.custom_rules.length ? dto.custom_rules.join('; ') : 'Clean CSR architecture'}.

### 5. Kebutuhan Non-Fungsional & Keamanan
- Penanganan request aman dengan Helmet dan Rate Limiter.
- Pencegahan XSS pada rendering Markdown menggunakan DOMPurify.
- Responsivitas API di bawah 3 detik untuk query metadata.`;
    } else {
      markdown = `## Spesifikasi Teknis: ${dto.project_name} (${dto.document_type})

### 1. Deskripsi & Ruang Lingkup
${dto.description}

### 2. Tumpukan Teknologi
- Tumpukan Utama: ${techStack}
- Pendekatan Arsitektur: Controller-Service-Repository (CSR)

### 3. Desain Komponen & Data
- Terisolasi penuh, modular, dan mematuhi prinsip single-responsibility.
- Parameterized database operations untuk integritas dan performa optimal.`;
    }

    const latencyMs = Math.max(Date.now() - startTime, 150);
    const normalized = markdownNormalizerService.normalize(markdown);

    return {
      content: normalized.content,
      promptTokens: Math.ceil(dto.description.length / 4) + 120,
      candidateTokens: normalized.estimatedTokens,
      latencyMs,
    };
  }
}

export const aiOrchestratorService = new AiOrchestratorService();


import { documentTemplateRepository } from '../repositories/DocumentTemplateRepository.js';
import type { CreateDocumentJobDTO } from '../models/document.dto.js';

export interface BuiltPrompt {
  systemInstruction: string;
  userPrompt: string;
}

export class PromptBuilderService {
  async buildPrompt(dto: CreateDocumentJobDTO): Promise<BuiltPrompt> {
    const template = await documentTemplateRepository.findByDocumentType(dto.document_type);

    const langInstruction = dto.language === 'en'
      ? 'The entire document must be written in fluent, professional technical English.'
      : 'Seluruh isi dokumen wajib ditulis dalam Bahasa Indonesia yang baku, profesional, dan berbobot teknis tinggi.';

    const systemInstruction = `
${template?.system_instruction || 'You are a Senior Software Architect and Principal Technical Product Manager.'}

CRITICAL OPERATIONAL CONSTRAINTS:
1. Language requirement: ${langInstruction}
2. Output format: Produce ONLY valid, structured, high-density Markdown.
3. No conversational preamble, greetings, or conclusions (e.g., do NOT start with "Here is your PRD", start directly with "# Title").
4. Completeness: Ensure all specifications, endpoints, architectural layers, and schemas are fully detailed without placeholders, ellipses (...), or TODO comments.
5. Strictly adhere to production-grade engineering best practices (YAGNI, 3NF database schema, Controller-Service-Repository separation, OWASP security).
`.trim();

    const techStackStr = Array.isArray(dto.tech_stack) && dto.tech_stack.length > 0
      ? dto.tech_stack.join(', ')
      : 'Not explicitly restricted (propose modern industry standard stack)';

    const customRulesStr = Array.isArray(dto.custom_rules) && dto.custom_rules.length > 0
      ? dto.custom_rules.map((rule, idx) => `${idx + 1}. ${rule}`).join('\n')
      : 'Standard clean architecture and security best practices.';

    let userPrompt = `
Generate a comprehensive, developer-ready ${dto.document_type} specification based on the following project context:

- Project Name: ${dto.project_name}
- Target Document Type: ${dto.document_type}
- Target Language: ${dto.language === 'en' ? 'English (en)' : 'Bahasa Indonesia (id)'}
- Target Users / Audience: ${dto.target_users}
- Tech Stack Constraints: ${techStackStr}
- Custom Architectural Rules:
${customRulesStr}

- Project Scope & Description:
${dto.description}
`.trim();

    if (template?.schema_template) {
      userPrompt += `\n\nReference Structural Blueprint:\n${template.schema_template}`;
    }

    return {
      systemInstruction,
      userPrompt,
    };
  }
}

export const promptBuilderService = new PromptBuilderService();


import { query } from '../config/database.js';
import type { DocumentTemplateEntity } from '../models/document.dto.js';

export class DocumentTemplateRepository {
  async findByDocumentType(documentType: string): Promise<DocumentTemplateEntity | null> {
    const sql = `
      SELECT id, template_key, document_type, system_instruction, schema_template, 
             supported_languages, is_active, created_at, updated_at
      FROM document_templates
      WHERE document_type = $1 AND is_active = true
      LIMIT 1;
    `;
    const res = await query<DocumentTemplateEntity>(sql, [documentType]);
    return res.rows[0] || null;
  }

  async listActive(): Promise<Array<{
    id: string;
    template_key: string;
    document_type: string;
    supported_languages: string[];
    is_active: boolean;
  }>> {
    const sql = `
      SELECT id, template_key, document_type, supported_languages, is_active
      FROM document_templates
      WHERE is_active = true
      ORDER BY created_at ASC;
    `;
    const res = await query(sql);
    return res.rows;
  }
}

export const documentTemplateRepository = new DocumentTemplateRepository();


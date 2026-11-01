export interface NormalizationResult {
  content: string;
  wordCount: number;
  estimatedTokens: number;
}

export class MarkdownNormalizerService {
  /**
   * Normalizes AI generated text into clean, raw Markdown.
   * Removes code fence wrappers, preambles, and preserves syntax integrity.
   */
  normalize(rawText: string): NormalizationResult {
    if (!rawText) {
      return { content: '', wordCount: 0, estimatedTokens: 0 };
    }

    let cleaned = rawText.trim();

    // 1. Remove outer markdown code fences if wrapped entirely in ```markdown ... ``` or ``` ... ```
    const codeBlockRegex = /^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/i;
    const match = cleaned.match(codeBlockRegex);
    if (match && match[1]) {
      cleaned = match[1].trim();
    }

    // 2. Remove common conversational preambles if any leaked through
    const preambleRegexes = [
      /^(?:Sure|Certainly|Here is|Below is|Here's) (?:the|your)?\s*(?:requested)?\s*(?:document|specification|PRD|architecture|API specification).*?:?\s*\n+/i,
      /^(?:Tentu|Berikut|Ini adalah) (?:dokumen|spesifikasi|PRD|arsitektur).*?:?\s*\n+/i,
    ];

    for (const regex of preambleRegexes) {
      cleaned = cleaned.replace(regex, '');
    }

    // 3. Remove conversational closing sentences at the end
    const closingRegexes = [
      /\n+(?:I hope this helps|Let me know if you need|Feel free to ask).*$/i,
      /\n+(?:Semoga membantu|Beri tahu saya jika ada).*$/i,
    ];

    for (const regex of closingRegexes) {
      cleaned = cleaned.replace(regex, '');
    }

    cleaned = cleaned.trim();

    // Calculate metrics
    const words = cleaned ? cleaned.split(/\s+/).filter(Boolean).length : 0;
    // Approximation: 1 token ~ 4 characters
    const estimatedTokens = Math.ceil(cleaned.length / 4);

    return {
      content: cleaned,
      wordCount: words,
      estimatedTokens,
    };
  }

  /**
   * Validates if the content adheres to basic Markdown structure (has at least a heading)
   */
  validateStructure(content: string): boolean {
    if (!content || content.length < 50) return false;
    return /^#+\s+.+/m.test(content);
  }
}

export const markdownNormalizerService = new MarkdownNormalizerService();


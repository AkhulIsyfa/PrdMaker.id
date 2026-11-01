import { GoogleGenAI } from '@google/genai';
import { env } from './env.js';

export const isAiConfigured = Boolean(
  env.GEMINI_API_KEY &&
  env.GEMINI_API_KEY.trim() !== '' &&
  env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE'
);

export const aiClient = isAiConfigured
  ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })
  : null;

export const DEFAULT_AI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export const AI_MODEL_CONFIG = {
  temperature: 0.2,
  topP: 0.95,
  maxOutputTokens: 8192,
};


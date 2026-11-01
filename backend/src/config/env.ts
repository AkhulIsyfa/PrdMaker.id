import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // PostgreSQL Connection
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string().default('makeprd'),
  DB_PASSWORD: z.string().default('makeprd_secret'),
  DB_NAME: z.string().default('makeprd_db'),
  DB_POOL_MIN: z.coerce.number().default(2),
  DB_POOL_MAX: z.coerce.number().default(10),

  // Security & Authentication
  JWT_SECRET: z.string().min(16).default('makeprd_jwt_super_secret_key_minimum_32_characters_for_security'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CSRF_SECRET: z.string().min(16).default('makeprd_csrf_secret_salt_token_generator_key_32_chars'),

  // Google AI Studio (Gemini)
  GEMINI_API_KEY: z.string().optional().default(''),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Environment validation failed:', JSON.stringify(parsedEnv.error.format(), null, 2));
  process.exit(1);
}

export const env = parsedEnv.data;


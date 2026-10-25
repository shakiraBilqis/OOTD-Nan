import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

export const config = {
  env: optionalEnv('NODE_ENV', 'development'),
  port: parseInt(optionalEnv('PORT', '3000'), 10),
  frontendUrl: optionalEnv('FRONTEND_URL', 'http://localhost:5173'),

  database: {
    url: requireEnv('DATABASE_URL'),
  },

  session: {
    secret: requireEnv('SESSION_SECRET'),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },

  nebius: {
    apiKey: optionalEnv('NEBIUS_API_KEY'),
    baseUrl: optionalEnv('NEBIUS_BASE_URL', 'https://api.studio.nebius.com/v1/'),
    modelId: optionalEnv('NEBIUS_MODEL_ID', 'nvidia/llama-3.1-nemotron-70b-instruct'),
    isConfigured: !!optionalEnv('NEBIUS_API_KEY'),
  },

  storage: {
    mode: optionalEnv('IMAGE_STORAGE_MODE', 'local') as 'local',
    uploadDir: optionalEnv('UPLOAD_DIR', 'uploads'),
    maxSizeMb: parseInt(optionalEnv('MAX_UPLOAD_SIZE_MB', '10'), 10),
  },

  vton: {
    provider: optionalEnv('VTON_PROVIDER'),
    apiKey: optionalEnv('VTON_API_KEY'),
    modelId: optionalEnv('VTON_MODEL_ID'),
    isConfigured: !!(optionalEnv('VTON_PROVIDER') && optionalEnv('VTON_API_KEY')),
  },

  email: {
    host: optionalEnv('SMTP_HOST', 'smtp.gmail.com'),
    port: parseInt(optionalEnv('SMTP_PORT', '465'), 10),
    secure: optionalEnv('SMTP_SECURE', 'true') === 'true',
    user: optionalEnv('SMTP_USER', ''),
    pass: optionalEnv('SMTP_PASS', ''),
    from: optionalEnv('EMAIL_FROM', 'CLOSETTE <noreply@closette.app>'),
    isConfigured: !!(optionalEnv('SMTP_USER') && optionalEnv('SMTP_PASS')),
  },

  rateLimit: {
    windowMs: parseInt(optionalEnv('RATE_LIMIT_WINDOW_MS', '900000'), 10),
    maxRequests: parseInt(optionalEnv('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
    authMax: parseInt(optionalEnv('AUTH_RATE_LIMIT_MAX', '10'), 10),
  },

  isProd: optionalEnv('NODE_ENV', 'development') === 'production',
  isDev: optionalEnv('NODE_ENV', 'development') === 'development',
};

import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export const config = {
  port: Number(process.env.PORT) || 4000,
  isProduction,
  databaseUrl: process.env.DATABASE_URL || 'postgres://shortscale:shortscale@localhost:5432/shortscale',
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  publicShortOrigin: (process.env.PUBLIC_SHORT_ORIGIN || process.env.APP_URL || 'http://localhost:3000').replace(
    /\/$/,
    ''
  ),
  demoLoginEnabled: process.env.DEMO_LOGIN_ENABLED !== 'false',
  cookieName: 'ss_token',
  counterStart: 1_000_000_000,
  cacheTtlSeconds: 60 * 60 * 24 * 7,
  emailUser: process.env.EMAIL_USER || '',
  emailPassword: String(process.env.EMAIL_PASSWORD || '').replace(/\s+/g, ''),
  emailFrom: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'ShortScale <noreply@shortscale.dev>',
  emailDevEcho: process.env.EMAIL_DEV_ECHO === 'true' || !isProduction,
};

export function assertProductionSecrets() {
  if (isProduction && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-only-change-me')) {
    throw new Error('JWT_SECRET must be set to a strong value in production.');
  }
}

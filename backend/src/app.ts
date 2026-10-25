import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { globalRateLimit } from './middleware/rateLimit';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Routers
import authRouter from './modules/auth/auth.router';
import profilesRouter from './modules/profiles/profiles.router';
import wardrobeRouter from './modules/wardrobe/wardrobe.router';
import stylistRouter from './modules/stylist/stylist.router';
import outfitsRouter from './modules/outfits/outfits.router';
import tryOnRouter from './modules/try-on/tryon.router';
import lookbookRouter from './modules/lookbook/lookbook.router';
import plannerRouter from './modules/planner/planner.router';
import privacyRouter from './modules/privacy/privacy.router';

const app = express();

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow image serving
    contentSecurityPolicy: config.isProd
      ? undefined
      : false, // Relax in dev
  })
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Request Parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// ─── Logging ──────────────────────────────────────────────────────────────────
// Custom format to avoid logging sensitive data
app.use(
  morgan(':method :url :status :response-time ms', {
    skip: (_req, res) => config.isProd && res.statusCode < 400,
  })
);

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use('/api/', globalRateLimit);

// ─── Static File Serving (Private — requires ownership check) ─────────────────
// NOTE: In production, serve uploads via a separate authenticated endpoint
// to enforce ownership. For dev, we serve uploads directory with basic path.
// DO NOT expose /uploads directly in production.
if (config.isDev) {
  app.use(
    '/uploads',
    express.static(path.resolve(config.storage.uploadDir), {
      dotfiles: 'deny',
      index: false,
    })
  );
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/v1/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      env: config.env,
      features: {
        ai: config.nebius.isConfigured ? 'configured' : 'not_configured',
        virtualTryon: config.vton.isConfigured ? 'configured' : 'not_configured',
        storage: config.storage.mode,
      },
    },
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/profile', profilesRouter);
app.use('/api/v1/wardrobe', wardrobeRouter);
app.use('/api/v1/stylist', stylistRouter);
app.use('/api/v1/outfits', outfitsRouter);
app.use('/api/v1/try-on', tryOnRouter);
app.use('/api/v1/lookbook', lookbookRouter);
app.use('/api/v1/planner', plannerRouter);
app.use('/api/v1/privacy', privacyRouter);

// ─── 404 + Error Handlers ─────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

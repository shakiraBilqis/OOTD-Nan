import app from './app';
import { config } from './config';
import prisma from './config/database';

async function startServer(): Promise<void> {
  // Test database connection before starting
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('\n📋 Database Connection Troubleshooting:');
    console.error('  1. Make sure Laragon is running');
    console.error('  2. Start MySQL in Laragon');
    console.error('  3. Create database "closette_db" in phpMyAdmin');
    console.error('  4. Check DATABASE_URL in backend/.env');
    console.error('  5. Run: npm run db:migrate\n');
    process.exit(1);
  }

  const server = app.listen(config.port, () => {
    console.log(`\n🚀 OOTD-Nan Backend running at http://localhost:${config.port}`);
    console.log(`📡 Health check: http://localhost:${config.port}/api/v1/health`);
    console.log(`🌍 Accepting requests from: ${config.frontendUrl}`);
    console.log(`🤖 AI (Nemotron): ${config.nebius.isConfigured ? '✅ Configured' : '⚠️  Not configured (add NEBIUS_API_KEY)'}`);
    console.log(`👗 Virtual Try-On: ${config.vton.isConfigured ? '✅ Configured' : '⚠️  Not configured (add VTON_PROVIDER + VTON_API_KEY)'}`);
    console.log(`📧 Email (SMTP): ${config.email.isConfigured ? `✅ Configured (${config.email.user})` : '⚠️  Not configured (add SMTP_USER + SMTP_PASS in .env)'}`);
    console.log(`💾 Storage: ${config.storage.mode} (${config.storage.uploadDir})`);
    console.log(`🌐 Environment: ${config.env}\n`);
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      console.log('✅ Database disconnected, server closed');
      process.exit(0);
    });
    // Force close after 10s
    setTimeout(() => process.exit(1), 10000);
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  process.on('unhandledRejection', (reason) => {
    console.error('[UnhandledRejection]', reason);
  });
}

startServer();

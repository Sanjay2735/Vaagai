import app from './app.js';
import { testConnection, pool } from './config/db.js';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log('====================================================');
  console.log(`🥻 Vaagai Luxury Sarees Backend running on port ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
  console.log('====================================================');

  // Verify database connection asynchronously
  const dbStatus = await testConnection();
  if (dbStatus.ok) {
    console.log(`✅ [Database]: ${dbStatus.message}`);
  } else {
    console.warn(`⚠️  [Database Warning]: ${dbStatus.message}`);
    console.warn('   To configure your PostgreSQL database, update server/.env with your DATABASE_URL');
    console.warn('   Once connected, run: npm run db:setup');
  }
});

// Graceful shutdown handling
function gracefulShutdown(signal) {
  console.log(`\nReceived ${signal}. Gracefully shutting down Vaagai API server...`);
  server.close(async () => {
    try {
      await pool.end();
      console.log('PostgreSQL pool connection closed.');
    } catch (err) {
      console.error('Error closing pool:', err.message);
    }
    process.exit(0);
  });
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export default server;

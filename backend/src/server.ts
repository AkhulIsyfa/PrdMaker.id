import app from './app.js';
import { env } from './config/env.js';
import { pool } from './config/database.js';

const server = app.listen(env.PORT, () => {
  console.log(`🚀 MakePRD Backend running in ${env.NODE_ENV} mode on port ${env.PORT}`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await pool.end();
      console.log('Database connection pool drained.');
      process.exit(0);
    } catch (err) {
      console.error('Error during pool shutdown', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));


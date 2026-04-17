require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./config/db');
const { startLiveSimulation, stopLiveSimulation } = require('./services/liveSimulator');

const PORT = Number(process.env.PORT || 4000);
const MONGODB_URI = process.env.MONGODB_URI;
const LIVE_SIMULATION_INTERVAL_MS = Number(process.env.LIVE_SIMULATION_INTERVAL_MS || 7000);
const DB_RETRY_MS = Number(process.env.DB_RETRY_MS || 15000);

async function bootstrap() {
  const runtimeState = {
    dbConnected: false,
    simulationRunning: false,
    lastDbError: null,
  };
  app.locals.runtimeState = runtimeState;

  const server = app.listen(PORT, () => {
    console.log(`HaryanaGo backend running on http://localhost:${PORT}`);
  });

  let dbRetryTimer = null;

  const scheduleDbRetry = () => {
    if (dbRetryTimer) return;
    dbRetryTimer = setTimeout(() => {
      dbRetryTimer = null;
      initDependencies();
    }, DB_RETRY_MS);
  };

  const initDependencies = async () => {
    try {
      await connectDB(MONGODB_URI);
      runtimeState.dbConnected = true;
      runtimeState.lastDbError = null;

      if (!runtimeState.simulationRunning) {
        await startLiveSimulation(LIVE_SIMULATION_INTERVAL_MS);
        runtimeState.simulationRunning = true;
      }

      console.log('Dependencies initialized: MongoDB connected, live simulation started.');
    } catch (err) {
      runtimeState.dbConnected = false;
      runtimeState.lastDbError = err.message;
      console.error(`Dependency init failed: ${err.message}. Retrying in ${DB_RETRY_MS / 1000}s...`);
      scheduleDbRetry();
    }
  };

  initDependencies();

  const shutdown = async () => {
    console.log('Shutting down HaryanaGo backend...');
    if (dbRetryTimer) clearTimeout(dbRetryTimer);
    if (runtimeState.simulationRunning) stopLiveSimulation();
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((err) => {
  console.error('Failed to start backend:', err.message);
  process.exit(1);
});

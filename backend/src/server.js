require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./config/db');
const { startLiveSimulation, stopLiveSimulation } = require('./services/liveSimulator');

const PORT = Number(process.env.PORT || 4000);
const MONGODB_URI = process.env.MONGODB_URI;
const LIVE_SIMULATION_INTERVAL_MS = Number(process.env.LIVE_SIMULATION_INTERVAL_MS || 7000);

async function bootstrap() {
  await connectDB(MONGODB_URI);
  await startLiveSimulation(LIVE_SIMULATION_INTERVAL_MS);

  const server = app.listen(PORT, () => {
    console.log(`HaryanaGo backend running on http://localhost:${PORT}`);
  });

  const shutdown = async () => {
    console.log('Shutting down HaryanaGo backend...');
    stopLiveSimulation();
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((err) => {
  console.error('Failed to start backend:', err.message);
  process.exit(1);
});

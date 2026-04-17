const express = require('express');
const cors = require('cors');
const api = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  const runtimeState = req.app.locals.runtimeState || {};

  res.json({
    success: true,
    service: 'haryanago-backend',
    status: 'ok',
    db: runtimeState.dbConnected ? 'connected' : 'disconnected',
    simulation: runtimeState.simulationRunning ? 'running' : 'stopped',
    last_db_error: runtimeState.lastDbError || null,
  });
});

app.use('/', api);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

module.exports = app;

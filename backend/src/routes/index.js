const express = require('express');
const routesRouter = require('./routes');
const stopsRouter = require('./stops');
const busesRouter = require('./buses');
const journeysRouter = require('./journeys');

const api = express.Router();

api.use('/routes', routesRouter);
api.use('/stops', stopsRouter);
api.use('/bus', busesRouter);
api.use('/journeys', journeysRouter);

module.exports = api;

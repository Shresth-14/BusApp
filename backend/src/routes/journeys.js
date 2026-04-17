const express = require('express');
const Journey = require('../models/Journey');
const Route = require('../models/Route');
const BusStop = require('../models/BusStop');

const router = express.Router();

router.get('/history', async (req, res, next) => {
  try {
    const { route_id, bus_id, limit = 20 } = req.query;
    const query = {};

    if (route_id) query.route_id = route_id;
    if (bus_id) query.bus_id = bus_id;

    const parsedLimit = Math.max(1, Math.min(100, Number(limit) || 20));

    const journeys = await Journey.find(query)
      .sort({ started_at: -1 })
      .limit(parsedLimit)
      .lean();

    const routeIds = [...new Set(journeys.map((j) => j.route_id))];
    const stopIds = [...new Set(journeys.flatMap((j) => [j.source_stop_id, j.destination_stop_id]))];

    const [routes, stops] = await Promise.all([
      Route.find({ route_id: { $in: routeIds } }).select('route_id route_name').lean(),
      BusStop.find({ stop_id: { $in: stopIds } }).select('stop_id name city').lean(),
    ]);

    const routeById = new Map(routes.map((r) => [r.route_id, r]));
    const stopById = new Map(stops.map((s) => [s.stop_id, s]));

    const data = journeys.map((journey) => ({
      journey_id: journey.journey_id,
      route_id: journey.route_id,
      route_name: routeById.get(journey.route_id)?.route_name || journey.route_id,
      bus_id: journey.bus_id,
      source_stop_id: journey.source_stop_id,
      source_stop: stopById.get(journey.source_stop_id) || null,
      destination_stop_id: journey.destination_stop_id,
      destination_stop: stopById.get(journey.destination_stop_id) || null,
      started_at: journey.started_at,
      ended_at: journey.ended_at,
      duration_minutes: journey.duration_minutes,
      fare_inr: journey.fare_inr,
      status: journey.status,
      payment_mode: journey.payment_mode,
    }));

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

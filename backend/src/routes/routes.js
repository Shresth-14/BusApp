const express = require('express');
const Route = require('../models/Route');
const BusStop = require('../models/BusStop');
const { suggestRoutes } = require('../services/routeSearch');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const routes = await Route.find({})
      .select('route_id route_name distance_km estimated_time_minutes stops updatedAt')
      .sort({ route_id: 1 })
      .lean();

    res.json({
      success: true,
      count: routes.length,
      data: routes,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const { source, destination } = req.query;

    if (!source || !destination) {
      return res.status(400).json({
        success: false,
        message: 'source and destination are required query params',
      });
    }

    const [routes, stops] = await Promise.all([Route.find({}).lean(), BusStop.find({}).lean()]);

    const result = suggestRoutes({ routes, stops, source, destination });

    const stopMetaById = new Map(stops.map((s) => [s.stop_id, s]));

    const enrichedSuggestions = result.suggestions.map((s) => ({
      ...s,
      interchange_stop:
        s.interchange_stop_id && stopMetaById.get(s.interchange_stop_id)
          ? {
              stop_id: s.interchange_stop_id,
              name: stopMetaById.get(s.interchange_stop_id).name,
              city: stopMetaById.get(s.interchange_stop_id).city,
            }
          : null,
    }));

    res.json({
      success: true,
      source,
      destination,
      source_matches: result.source_matches.map((s) => ({
        stop_id: s.stop_id,
        name: s.name,
        city: s.city,
      })),
      destination_matches: result.destination_matches.map((s) => ({
        stop_id: s.stop_id,
        name: s.name,
        city: s.city,
      })),
      suggestions: enrichedSuggestions,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:route_id', async (req, res, next) => {
  try {
    const route = await Route.findOne({ route_id: req.params.route_id }).lean();

    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    const stops = await BusStop.find({ stop_id: { $in: route.stops } }).lean();
    const stopById = new Map(stops.map((s) => [s.stop_id, s]));

    const orderedStops = route.stops
      .map((stopId, index) => {
        const stop = stopById.get(stopId);
        if (!stop) return null;
        const stepTime = route.stops.length > 1 ? route.estimated_time_minutes / (route.stops.length - 1) : 0;

        return {
          sequence: index + 1,
          stop_id: stop.stop_id,
          name: stop.name,
          city: stop.city,
          coordinates: {
            lat: stop.latitude,
            lng: stop.longitude,
          },
          platforms: stop.platforms,
          estimated_arrival_from_start_minutes: Math.round(index * stepTime),
        };
      })
      .filter(Boolean);

    res.json({
      success: true,
      data: {
        route_id: route.route_id,
        route_name: route.route_name,
        distance_km: route.distance_km,
        estimated_time_minutes: route.estimated_time_minutes,
        polyline: {
          encoded: route.polyline,
          points: route.polyline_points,
          format: 'google-map-encoded-and-latlng-array',
        },
        stops: orderedStops,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

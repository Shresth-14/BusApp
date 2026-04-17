const express = require('express');
const Trip = require('../models/Trip');
const Route = require('../models/Route');
const BusStop = require('../models/BusStop');

const router = express.Router();

router.get('/live/:bus_id', async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ bus_id: req.params.bus_id }).lean();
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Bus not found' });
    }

    const [route, nextStop] = await Promise.all([
      Route.findOne({ route_id: trip.route_id }).select('route_id route_name').lean(),
      BusStop.findOne({ stop_id: trip.next_stop_id }).select('stop_id name city').lean(),
    ]);

    res.json({
      success: true,
      data: {
        bus_id: trip.bus_id,
        route_id: trip.route_id,
        route_name: route ? route.route_name : null,
        current_location: trip.current_location,
        next_stop_id: trip.next_stop_id,
        next_stop: nextStop,
        eta_to_next_stop: trip.eta_to_next_stop,
        occupancy: trip.occupancy,
        status: trip.status,
        delay_minutes: trip.delay_minutes,
        last_updated: trip.last_updated,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

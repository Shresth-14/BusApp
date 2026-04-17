require('dotenv').config();
const mongoose = require('mongoose');

const { connectDB } = require('../config/db');
const BusStop = require('../models/BusStop');
const Route = require('../models/Route');
const Trip = require('../models/Trip');
const Journey = require('../models/Journey');
const {
  stopDefinitions,
  tripDefinitions,
  journeyDefinitions,
  buildRoutesWithGeometry,
} = require('./haryanaSeedData');

async function seedDatabase({ reset = true, connect = true } = {}) {
  if (connect && mongoose.connection.readyState !== 1) {
    await connectDB(process.env.MONGODB_URI);
  }

  if (reset) {
    await Promise.all([BusStop.deleteMany({}), Route.deleteMany({}), Trip.deleteMany({}), Journey.deleteMany({})]);
  }

  const stops = stopDefinitions.map((stop) => ({
    ...stop,
    location: {
      type: 'Point',
      coordinates: [stop.longitude, stop.latitude],
    },
  }));

  const routes = buildRoutesWithGeometry();

  await BusStop.insertMany(stops);
  await Route.insertMany(routes);

  const routeMap = new Map(routes.map((route) => [route.route_id, route]));

  const trips = tripDefinitions.map((trip) => {
    const route = routeMap.get(trip.route_id);
    const firstPoint = route.polyline_points[0];
    const nextStopId = route.stops[Math.min(1, route.stops.length - 1)];

    return {
      ...trip,
      current_location: { lat: firstPoint.lat, lng: firstPoint.lng },
      next_stop_id: nextStopId,
      eta_to_next_stop: 8,
      delay_minutes: trip.status === 'delayed' ? 4 : 0,
      last_updated: new Date(),
    };
  });

  await Trip.insertMany(trips);
  await Journey.insertMany(journeyDefinitions);

  console.log('Seed complete');
  console.log(`Stops: ${stops.length}`);
  console.log(`Routes: ${routes.length}`);
  console.log(`Trips: ${trips.length}`);
  console.log(`Journeys: ${journeyDefinitions.length}`);

  return {
    stops: stops.length,
    routes: routes.length,
    trips: trips.length,
    journeys: journeyDefinitions.length,
  };
}

async function ensureSeedData() {
  if (mongoose.connection.readyState !== 1) {
    await connectDB(process.env.MONGODB_URI);
  }

  const [stopsCount, routesCount, tripsCount, journeysCount] = await Promise.all([
    BusStop.countDocuments(),
    Route.countDocuments(),
    Trip.countDocuments(),
    Journey.countDocuments(),
  ]);

  if (stopsCount === 0 && routesCount === 0 && tripsCount === 0 && journeysCount === 0) {
    return seedDatabase({ reset: false, connect: false });
  }

  return {
    stops: stopsCount,
    routes: routesCount,
    trips: tripsCount,
    journeys: journeysCount,
  };
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed failed:', err.message);
      process.exit(1);
    });
}

module.exports = { seedDatabase, ensureSeedData };

const Route = require('../models/Route');
const Trip = require('../models/Trip');

let timer = null;
const routeTrackers = new Map();

function randomOccupancy(current) {
  const values = ['low', 'medium', 'high'];
  const baseIndex = values.indexOf(current);
  const shift = Math.random() < 0.25 ? (Math.random() < 0.5 ? -1 : 1) : 0;
  const nextIndex = Math.max(0, Math.min(values.length - 1, baseIndex + shift));
  return values[nextIndex];
}

async function initTrackers() {
  const [trips, routes] = await Promise.all([
    Trip.find({}).lean(),
    Route.find({}).lean(),
  ]);
  const routeById = new Map(routes.map((r) => [r.route_id, r]));

  trips.forEach((trip) => {
    const route = routeById.get(trip.route_id);
    if (!route || !route.polyline_points || !route.polyline_points.length) return;

    const pointIndex = Math.min(1, route.polyline_points.length - 1);
    routeTrackers.set(trip.bus_id, {
      pointIndex,
      direction: 1,
      route,
    });
  });
}

function calcNextStop(route, currentPoint) {
  const all = route.polyline_points;
  if (!all.length) return { nextStopId: route.stops[0], etaMinutes: 0, arrived: true };

  const stopIndexes = route.stops.map((_, idx) => {
    const mappedPoint = Math.floor((idx / Math.max(1, route.stops.length - 1)) * (all.length - 1));
    return mappedPoint;
  });

  const nextStopIdx = stopIndexes.findIndex((idx) => idx >= currentPoint);

  if (nextStopIdx === -1) {
    return {
      nextStopId: route.stops[route.stops.length - 1],
      etaMinutes: 0,
      arrived: true,
    };
  }

  const deltaPoints = Math.max(0, stopIndexes[nextStopIdx] - currentPoint);
  const etaMinutes = Math.max(1, Math.round(deltaPoints * 1.8));

  return {
    nextStopId: route.stops[nextStopIdx],
    etaMinutes,
    arrived: false,
  };
}

async function tick() {
  const trips = await Trip.find({});
  if (!trips.length) return;

  const updatePromises = trips.map(async (trip) => {
    const tracker = routeTrackers.get(trip.bus_id);
    if (!tracker) return;

    const points = tracker.route.polyline_points;
    if (!points.length) return;

    let pointIndex = tracker.pointIndex + tracker.direction;
    let direction = tracker.direction;

    if (pointIndex >= points.length) {
      pointIndex = points.length - 1;
      direction = -1;
    }

    if (pointIndex <= 0) {
      pointIndex = 0;
      direction = 1;
    }

    tracker.pointIndex = pointIndex;
    tracker.direction = direction;

    const point = points[pointIndex];
    const next = calcNextStop(tracker.route, pointIndex);

    const delay = trip.status === 'delayed' ? 4 : Math.random() < 0.08 ? 3 : 0;
    const updatedStatus = next.arrived ? 'arrived' : delay > 0 ? 'delayed' : 'running';

    trip.current_location = { lat: point.lat, lng: point.lng };
    trip.next_stop_id = next.nextStopId;
    trip.eta_to_next_stop = next.etaMinutes + delay;
    trip.delay_minutes = delay;
    trip.status = updatedStatus;
    trip.occupancy = randomOccupancy(trip.occupancy);
    trip.last_updated = new Date();

    await trip.save();
  });

  await Promise.all(updatePromises);
}

async function startLiveSimulation(intervalMs) {
  if (timer) return;

  await initTrackers();
  timer = setInterval(() => {
    tick().catch((err) => {
      console.error('[live-simulator] tick failed:', err.message);
    });
  }, intervalMs);
}

function stopLiveSimulation() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

module.exports = {
  startLiveSimulation,
  stopLiveSimulation,
};

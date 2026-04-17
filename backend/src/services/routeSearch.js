function buildStopLookup(stops) {
  const byId = new Map();
  const byCity = new Map();

  stops.forEach((stop) => {
    byId.set(stop.stop_id, stop);
    const cityKey = String(stop.city || '').toLowerCase();
    if (!byCity.has(cityKey)) byCity.set(cityKey, []);
    byCity.get(cityKey).push(stop);
  });

  return { byId, byCity };
}

function findStopsByCity(stops, cityQuery) {
  const q = String(cityQuery || '').trim().toLowerCase();
  if (!q) return [];

  return stops.filter((stop) => {
    const city = String(stop.city || '').toLowerCase();
    const name = String(stop.name || '').toLowerCase();
    return city.includes(q) || name.includes(q);
  });
}

function routeContainsDirection(route, sourceStopIds, destinationStopIds) {
  let bestSourceIdx = -1;
  let bestDestinationIdx = -1;

  route.stops.forEach((stopId, idx) => {
    if (bestSourceIdx === -1 && sourceStopIds.has(stopId)) bestSourceIdx = idx;
    if (destinationStopIds.has(stopId)) bestDestinationIdx = idx;
  });

  return bestSourceIdx !== -1 && bestDestinationIdx !== -1 && bestSourceIdx < bestDestinationIdx;
}

function scoreRoute(route) {
  return route.estimated_time_minutes;
}

function findDirectRoutes(routes, sourceStops, destinationStops) {
  const sourceSet = new Set(sourceStops.map((s) => s.stop_id));
  const destinationSet = new Set(destinationStops.map((s) => s.stop_id));

  return routes
    .filter((route) => routeContainsDirection(route, sourceSet, destinationSet))
    .map((route) => ({
      type: 'direct',
      route_ids: [route.route_id],
      route_name: route.route_name,
      estimated_time_minutes: route.estimated_time_minutes,
      distance_km: route.distance_km,
      transfers: 0,
      score: scoreRoute(route),
    }));
}

function findConnectingRoutes(routes, sourceStops, destinationStops) {
  const sourceSet = new Set(sourceStops.map((s) => s.stop_id));
  const destinationSet = new Set(destinationStops.map((s) => s.stop_id));
  const suggestions = [];

  routes.forEach((r1) => {
    routes.forEach((r2) => {
      if (r1.route_id === r2.route_id) return;
      if (!routeContainsDirection(r1, sourceSet, new Set(r1.stops))) return;
      if (!routeContainsDirection(r2, new Set(r2.stops), destinationSet)) return;

      const interchanges = r1.stops.filter((stopId) => r2.stops.includes(stopId));
      if (!interchanges.length) return;

      const interchangeId = interchanges[0];
      const i1 = r1.stops.indexOf(interchangeId);
      const i2 = r2.stops.indexOf(interchangeId);
      const sourceIdx = r1.stops.findIndex((id) => sourceSet.has(id));
      const destinationIdx = r2.stops.findIndex((id) => destinationSet.has(id));

      if (sourceIdx === -1 || destinationIdx === -1) return;
      if (sourceIdx >= i1 || i2 >= destinationIdx) return;

      const totalTime = r1.estimated_time_minutes + r2.estimated_time_minutes + 15;
      const totalDistance = r1.distance_km + r2.distance_km;

      suggestions.push({
        type: 'connecting',
        route_ids: [r1.route_id, r2.route_id],
        route_name: `${r1.route_name} + ${r2.route_name}`,
        estimated_time_minutes: totalTime,
        distance_km: totalDistance,
        transfers: 1,
        interchange_stop_id: interchangeId,
        score: totalTime,
      });
    });
  });

  const unique = new Map();
  suggestions.forEach((s) => {
    const key = s.route_ids.join('|') + '|' + s.interchange_stop_id;
    if (!unique.has(key) || unique.get(key).score > s.score) {
      unique.set(key, s);
    }
  });

  return Array.from(unique.values());
}

function suggestRoutes({ routes, stops, source, destination }) {
  const sourceStops = findStopsByCity(stops, source);
  const destinationStops = findStopsByCity(stops, destination);

  if (!sourceStops.length || !destinationStops.length) {
    return {
      source_matches: sourceStops,
      destination_matches: destinationStops,
      suggestions: [],
    };
  }

  const direct = findDirectRoutes(routes, sourceStops, destinationStops);
  const connecting = findConnectingRoutes(routes, sourceStops, destinationStops);

  const sorted = [...direct, ...connecting].sort((a, b) => a.score - b.score);

  return {
    source_matches: sourceStops,
    destination_matches: destinationStops,
    suggestions: sorted,
  };
}

module.exports = {
  buildStopLookup,
  suggestRoutes,
};

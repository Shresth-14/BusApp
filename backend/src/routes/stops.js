const express = require('express');
const BusStop = require('../models/BusStop');

const router = express.Router();

router.get('/nearby', async (req, res, next) => {
  try {
    const { lat, lng, radius_m = 5000 } = req.query;

    const latitude = Number(lat);
    const longitude = Number(lng);
    const radius = Number(radius_m);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'lat and lng are required numeric query params',
      });
    }

    const stops = await BusStop.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: radius,
        },
      },
    })
      .limit(30)
      .lean();

    const data = stops.map((stop) => ({
      stop_id: stop.stop_id,
      name: stop.name,
      city: stop.city,
      latitude: stop.latitude,
      longitude: stop.longitude,
      platforms: stop.platforms,
    }));

    res.json({
      success: true,
      count: data.length,
      query: { lat: latitude, lng: longitude, radius_m: radius },
      data,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    const query = String(q).trim().toLowerCase();

    if (!query || query.length < 1) {
      return res.json({
        success: true,
        query: '',
        suggestions: [],
      });
    }

    // Search by city or stop name
    const stops = await BusStop.find({
      $or: [
        { city: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
      ],
    })
      .select('stop_id name city')
      .limit(50)
      .lean();

    // Extract unique suggestions: prefer cities first, then individual stops
    const cities = [...new Set(stops.map((s) => s.city))];
    const stopsData = stops.map((s) => ({
      text: s.name,
      city: s.city,
      stop_id: s.stop_id,
      type: 'stop',
    }));

    // Remove duplicate stop names within same city
    const uniqueStops = [];
    const seen = new Set();
    stopsData.forEach((s) => {
      const key = `${s.city}|${s.text}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueStops.push(s);
      }
    });

    const suggestions = cities.map((city) => ({ text: city, type: 'city' })).concat(uniqueStops);

    res.json({
      success: true,
      query,
      count: suggestions.length,
      suggestions: suggestions.slice(0, 15), // Limit to 15 suggestions
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

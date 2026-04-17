const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    route_id: { type: String, required: true, unique: true, index: true },
    route_name: { type: String, required: true },
    stops: { type: [String], required: true, default: [] },
    distance_km: { type: Number, required: true },
    estimated_time_minutes: { type: Number, required: true },
    polyline: { type: String, required: true },
    polyline_points: {
      type: [
        {
          lat: { type: Number, required: true },
          lng: { type: Number, required: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Route', routeSchema);

const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    bus_id: { type: String, required: true, unique: true, index: true },
    route_id: { type: String, required: true, index: true },
    current_location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    next_stop_id: { type: String, required: true },
    eta_to_next_stop: { type: Number, required: true },
    occupancy: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['running', 'delayed', 'arrived'],
      default: 'running',
      index: true,
    },
    delay_minutes: { type: Number, default: 0 },
    last_updated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);

const mongoose = require('mongoose');

const journeySchema = new mongoose.Schema(
  {
    journey_id: { type: String, required: true, unique: true, index: true },
    route_id: { type: String, required: true, index: true },
    bus_id: { type: String, required: true, index: true },
    source_stop_id: { type: String, required: true },
    destination_stop_id: { type: String, required: true },
    started_at: { type: Date, required: true },
    ended_at: { type: Date, required: true },
    duration_minutes: { type: Number, required: true },
    fare_inr: { type: Number, required: true },
    status: {
      type: String,
      enum: ['completed', 'cancelled', 'in-progress'],
      default: 'completed',
    },
    payment_mode: {
      type: String,
      enum: ['cash', 'upi', 'card', 'wallet'],
      default: 'upi',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Journey', journeySchema);

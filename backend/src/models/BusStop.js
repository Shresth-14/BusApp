const mongoose = require('mongoose');

const busStopSchema = new mongoose.Schema(
  {
    stop_id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    city: { type: String, required: true, index: true },
    platforms: { type: [String], default: [] },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (value) => Array.isArray(value) && value.length === 2,
          message: 'location.coordinates must be [lng, lat]',
        },
      },
    },
  },
  { timestamps: true }
);

busStopSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('BusStop', busStopSchema);

# HaryanaGo Backend

Node.js + Express + MongoDB backend for Haryana Roadways route discovery and live bus tracking.

## Features

- Haryana-focused static route + stop data
- Real-time bus trip simulation every 5-10 seconds
- Geo-nearby stop search using MongoDB 2dsphere index
- Map-ready route geometry (encoded polyline + lat/lng points)
- Direct + connecting route suggestions

## Tech

- Node.js + Express
- MongoDB + Mongoose
- Polyline support: `@mapbox/polyline`

## Setup

1. Copy `.env.example` to `.env` and set values.
2. Install dependencies.
3. Seed database.
4. Start backend.

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

Backend runs on `http://localhost:4000` by default.

## API Endpoints

### 1) GET /routes

Returns all routes with basic info.

### 2) GET /routes/:route_id

Returns full route details:

- stop sequence with coordinates and timings
- polyline (encoded + points)
- route summary

### 3) GET /stops/nearby?lat=xx&lng=yy&radius_m=5000

Returns nearby stops using geospatial query.

### 4) GET /routes/search?source=Sonipat&destination=Delhi

Returns best route suggestions:

- direct routes
- connecting routes with interchange

### 5) GET /bus/live/:bus_id

Returns live bus position + ETA + status.

## Example Responses

### GET /routes

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "route_id": "HRY-RTE-001",
      "route_name": "Sonipat -> ISBT Delhi",
      "distance_km": 47,
      "estimated_time_minutes": 95,
      "stops": ["HRY-STP-SNP-BS", "DLH-STP-ISBT-KG"]
    }
  ]
}
```

### GET /routes/HRY-RTE-003

```json
{
  "success": true,
  "data": {
    "route_id": "HRY-RTE-003",
    "route_name": "Rohtak -> Gurugram -> Delhi",
    "distance_km": 86,
    "estimated_time_minutes": 150,
    "polyline": {
      "encoded": "...",
      "points": [
        { "lat": 28.8955, "lng": 76.6066 },
        { "lat": 28.4595, "lng": 77.0266 },
        { "lat": 28.6676, "lng": 77.2273 }
      ],
      "format": "google-map-encoded-and-latlng-array"
    },
    "stops": [
      {
        "sequence": 1,
        "stop_id": "HRY-STP-RTK-BS",
        "name": "Rohtak Bus Stand",
        "city": "Rohtak",
        "coordinates": { "lat": 28.8955, "lng": 76.6066 },
        "platforms": ["A", "B", "C", "D"],
        "estimated_arrival_from_start_minutes": 0
      }
    ]
  }
}
```

### GET /stops/nearby?lat=28.99&lng=77.01

```json
{
  "success": true,
  "count": 2,
  "query": { "lat": 28.99, "lng": 77.01, "radius_m": 5000 },
  "data": [
    {
      "stop_id": "HRY-STP-SNP-BS",
      "name": "Sonipat Bus Stand",
      "city": "Sonipat",
      "latitude": 28.9931,
      "longitude": 77.0151,
      "platforms": ["A", "B", "C", "D"]
    }
  ]
}
```

### GET /routes/search?source=Hisar&destination=Delhi

```json
{
  "success": true,
  "source": "Hisar",
  "destination": "Delhi",
  "source_matches": [
    { "stop_id": "HRY-STP-HSR-BS", "name": "Hisar Bus Stand", "city": "Hisar" }
  ],
  "destination_matches": [
    { "stop_id": "DLH-STP-ISBT-KG", "name": "ISBT Kashmere Gate", "city": "Delhi" }
  ],
  "suggestions": [
    {
      "type": "direct",
      "route_ids": ["HRY-RTE-004"],
      "route_name": "Hisar -> Rohtak -> Delhi",
      "estimated_time_minutes": 285,
      "distance_km": 175,
      "transfers": 0,
      "score": 285,
      "interchange_stop": null
    }
  ]
}
```

### GET /bus/live/HRY-BUS-101

```json
{
  "success": true,
  "data": {
    "bus_id": "HRY-BUS-101",
    "route_id": "HRY-RTE-001",
    "route_name": "Sonipat -> ISBT Delhi",
    "current_location": { "lat": 28.9931, "lng": 77.0151 },
    "next_stop_id": "DLH-STP-ISBT-KG",
    "next_stop": {
      "stop_id": "DLH-STP-ISBT-KG",
      "name": "ISBT Kashmere Gate",
      "city": "Delhi"
    },
    "eta_to_next_stop": 7,
    "occupancy": "medium",
    "status": "running",
    "delay_minutes": 0,
    "last_updated": "2026-04-17T10:00:00.000Z"
  }
}
```

## Notes for Frontend Integration

- Use `polyline.encoded` for Google Maps `decodePath` or Mapbox polyline decode utility.
- Use `polyline.points` directly when plotting in Leaflet/Mapbox GL.
- Poll `GET /bus/live/:bus_id` every 5-10 seconds for live marker updates.

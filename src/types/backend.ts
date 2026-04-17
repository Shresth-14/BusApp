export type BackendRouteSummary = {
  route_id: string;
  route_name: string;
  stops: string[];
  distance_km: number;
  estimated_time_minutes: number;
};

export type BackendRouteStop = {
  sequence: number;
  stop_id: string;
  name: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  platforms: string[];
  estimated_arrival_from_start_minutes: number;
};

export type BackendRouteDetails = {
  route_id: string;
  route_name: string;
  distance_km: number;
  estimated_time_minutes: number;
  polyline: {
    encoded: string;
    points: Array<{ lat: number; lng: number }>;
    format: string;
  };
  stops: BackendRouteStop[];
};

export type BackendSearchSuggestion = {
  type: 'direct' | 'connecting';
  route_ids: string[];
  route_name: string;
  estimated_time_minutes: number;
  distance_km: number;
  transfers: number;
  score: number;
  interchange_stop?: {
    stop_id: string;
    name: string;
    city: string;
  } | null;
};

export type BackendSearchResponse = {
  source: string;
  destination: string;
  suggestions: BackendSearchSuggestion[];
};

export type BackendLiveBus = {
  bus_id: string;
  route_id: string;
  route_name: string | null;
  current_location: {
    lat: number;
    lng: number;
  };
  next_stop_id: string;
  next_stop?: {
    stop_id: string;
    name: string;
    city: string;
  } | null;
  eta_to_next_stop: number;
  occupancy: 'low' | 'medium' | 'high';
  status: 'running' | 'delayed' | 'arrived';
  delay_minutes: number;
  last_updated: string;
};

export type BackendJourney = {
  journey_id: string;
  route_id: string;
  route_name: string;
  bus_id: string;
  source_stop_id: string;
  source_stop: {
    stop_id: string;
    name: string;
    city: string;
  } | null;
  destination_stop_id: string;
  destination_stop: {
    stop_id: string;
    name: string;
    city: string;
  } | null;
  started_at: string;
  ended_at: string;
  duration_minutes: number;
  fare_inr: number;
  status: 'completed' | 'cancelled' | 'in-progress';
  payment_mode: string;
};

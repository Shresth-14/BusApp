import { apiGet } from './client';
import {
  BackendLiveBus,
  BackendJourney,
  BackendRouteDetails,
  BackendRouteSummary,
  BackendSearchResponse,
} from '../types/backend';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

type RoutesEnvelope = {
  success: boolean;
  count: number;
  data: BackendRouteSummary[];
};

type SearchEnvelope = {
  success: boolean;
  source: string;
  destination: string;
  suggestions: BackendSearchResponse['suggestions'];
};

export async function getAllRoutes() {
  const response = await apiGet<RoutesEnvelope>('/routes');
  return response.data;
}

export async function getRouteDetails(routeId: string) {
  const response = await apiGet<ApiEnvelope<BackendRouteDetails>>(`/routes/${encodeURIComponent(routeId)}`);
  return response.data;
}

export async function searchRoutes(source: string, destination: string) {
  const response = await apiGet<SearchEnvelope>(
    `/routes/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`
  );

  return {
    source: response.source,
    destination: response.destination,
    suggestions: response.suggestions,
  };
}

export async function getLiveBus(busId: string) {
  const response = await apiGet<ApiEnvelope<BackendLiveBus>>(`/bus/live/${encodeURIComponent(busId)}`);
  return response.data;
}

type JourneysEnvelope = {
  success: boolean;
  count: number;
  data: BackendJourney[];
};

export async function getJourneyHistory(limit = 20) {
  const response = await apiGet<JourneysEnvelope>(`/journeys/history?limit=${limit}`);
  return response.data;
}

export type StopSuggestion = {
  text: string;
  type: 'city' | 'stop';
  city?: string;
  stop_id?: string;
};

type StopsSearchEnvelope = {
  success: boolean;
  query: string;
  count: number;
  suggestions: StopSuggestion[];
};

export async function searchStops(query: string) {
  const response = await apiGet<StopsSearchEnvelope>(`/stops/search?q=${encodeURIComponent(query)}`);
  return response.suggestions;
}

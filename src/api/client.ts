import { Platform } from 'react-native';

function normalizeBaseUrl(raw?: string): string {
  const value = (raw || '').trim();
  if (value) return value.replace(/\/$/, '');

  if (Platform.OS === 'android') return 'http://10.0.2.2:4000';
  return 'http://localhost:4000';
}

export const API_BASE_URL = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL);

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status} ${path}: ${text}`);
  }

  return res.json() as Promise<T>;
}

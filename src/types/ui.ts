export type BottomTabKey = 'live' | 'routes' | 'tickets' | 'profile';

export type CrowdLevel = 'low' | 'moderate' | 'high';

export type StopItem = {
  id: string;
  name: string;
  etaText: string;
  isCurrent?: boolean;
};

export type AlertItem = {
  id: string;
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error';
};

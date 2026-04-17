import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { appTheme } from '../../theme';

export type AppIconName =
  | 'bell'
  | 'back'
  | 'share'
  | 'refresh'
  | 'home'
  | 'live'
  | 'routes'
  | 'tickets'
  | 'alerts'
  | 'success'
  | 'map-marker'
  | 'bus';

type AppIconProps = {
  name: AppIconName;
  size?: number;
  color?: string;
};

const iconMap: Record<AppIconName, keyof typeof MaterialCommunityIcons.glyphMap> = {
  bell: 'bell-outline',
  back: 'arrow-left',
  share: 'share-variant-outline',
  refresh: 'refresh',
  home: 'home-outline',
  live: 'crosshairs-gps',
  routes: 'bus-clock',
  tickets: 'ticket-percent-outline',
  alerts: 'alert-circle-outline',
  success: 'check-circle-outline',
  'map-marker': 'map-marker-radius',
  bus: 'bus',
};

export function AppIcon({ name, size = 18, color = appTheme.colors.textCharcoal }: AppIconProps) {
  return <MaterialCommunityIcons name={iconMap[name]} size={size} color={color} />;
}

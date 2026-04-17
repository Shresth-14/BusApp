import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { appTheme } from '../../theme';
import { LeafletMapCard } from './LeafletMapCard';

type LiveMapPreviewProps = {
  routeLabel: string;
  primaryStop: string;
  secondaryStop: string;
};

export function LiveMapPreview({ routeLabel, primaryStop, secondaryStop }: LiveMapPreviewProps) {
  return (
    <View style={styles.mapCard}>
      <LeafletMapCard
        center={{ lat: 28.99, lng: 77.02 }}
        zoom={13}
        markers={[
          { lat: 28.999, lng: 77.032, label: 'Bus 401A', isPrimary: true },
          { lat: 28.992, lng: 77.015, label: secondaryStop },
          { lat: 28.985, lng: 77.025, label: primaryStop },
        ]}
        routePath={[
          { lat: 28.985, lng: 77.025 },
          { lat: 28.991, lng: 77.028 },
          { lat: 28.996, lng: 77.03 },
          { lat: 28.999, lng: 77.032 },
          { lat: 29.004, lng: 77.027 },
          { lat: 29.008, lng: 77.022 },
          { lat: 29.01, lng: 77.015 },
          { lat: 29.012, lng: 77.009 },
        ]}
      />

      <View style={styles.routePill}>
        <Text style={styles.routePillText}>{routeLabel}</Text>
      </View>

      <View style={[styles.stopTag, styles.stopA]} pointerEvents="none">
        <Text style={styles.stopText}>{primaryStop}</Text>
      </View>
      <View style={[styles.stopTag, styles.stopB]} pointerEvents="none">
        <Text style={styles.stopText}>{secondaryStop}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapCard: {
    height: 240,
    borderRadius: appTheme.radii.md,
    overflow: 'hidden',
    backgroundColor: appTheme.colors.mapNightA,
    ...appTheme.elevation.card,
  },
  routePill: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 2,
    borderRadius: appTheme.radii.pill,
    backgroundColor: 'rgba(17, 23, 56, 0.9)',
    paddingHorizontal: appTheme.spacing.sm,
    paddingVertical: 6,
  },
  routePillText: {
    ...appTheme.typography.caption,
    color: '#F4F6FA',
    fontWeight: '600',
  },
  stopTag: {
    position: 'absolute',
    zIndex: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(247, 251, 250, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  stopA: {
    right: 16,
    top: 138,
  },
  stopB: {
    left: 20,
    top: 64,
  },
  stopText: {
    ...appTheme.typography.caption,
    color: appTheme.colors.primaryNavy,
    fontWeight: '600',
  },
});

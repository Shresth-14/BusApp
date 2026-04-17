import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { appTheme } from '../../theme';

type EtaHeroProps = {
  eta: string;
  route: string;
  label?: string;
};

export function EtaHero({ eta, route, label = 'Next Bus ETA' }: EtaHeroProps) {
  return (
    <View style={styles.hero}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.eta}>{eta}</Text>
      <Text style={styles.route}>{route}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: appTheme.radii.md,
    padding: appTheme.spacing.md,
    backgroundColor: appTheme.colors.primaryNavy,
    ...appTheme.elevation.card,
  },
  label: {
    ...appTheme.typography.body,
    color: '#F5F8FD',
  },
  eta: {
    ...appTheme.typography.heroEta,
    color: '#F5F8FD',
    marginVertical: 4,
  },
  route: {
    ...appTheme.typography.caption,
    color: 'rgba(245, 248, 253, 0.9)',
  },
});

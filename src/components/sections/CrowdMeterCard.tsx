import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { appTheme } from '../../theme';
import { Badge, Card } from '../primitives';

type CrowdMeterCardProps = {
  title: string;
  occupancyPercent: number;
  subtitle?: string;
};

export function CrowdMeterCard({ title, occupancyPercent, subtitle }: CrowdMeterCardProps) {
  const tone = occupancyPercent >= 75 ? 'red' : occupancyPercent >= 45 ? 'orange' : 'green';

  return (
    <Card>
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Current Occupancy</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        <Badge label={`${occupancyPercent}% full`} tone={tone} />
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, occupancyPercent))}%` }]} />
      </View>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  label: {
    ...appTheme.typography.body,
    color: appTheme.colors.textMuted,
  },
  title: {
    ...appTheme.typography.subtitle,
    color: appTheme.colors.textCharcoal,
    marginTop: 3,
  },
  progressTrack: {
    height: 10,
    borderRadius: appTheme.radii.pill,
    marginTop: appTheme.spacing.sm,
    backgroundColor: 'rgba(13, 43, 85, 0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: appTheme.radii.pill,
    backgroundColor: appTheme.colors.alertOrange,
  },
  subtitle: {
    ...appTheme.typography.caption,
    color: appTheme.colors.textMuted,
    marginTop: appTheme.spacing.sm,
  },
});

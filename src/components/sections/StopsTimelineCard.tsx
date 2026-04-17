import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StopItem } from '../../types/ui';
import { appTheme } from '../../theme';
import { Card } from '../primitives';

type StopsTimelineCardProps = {
  title: string;
  stops: StopItem[];
};

export function StopsTimelineCard({ title, stops }: StopsTimelineCardProps) {
  return (
    <Card>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.timeline}>
        {stops.map((stop, index) => {
          const isLast = index === stops.length - 1;

          return (
            <View style={styles.item} key={stop.id}>
              <View style={styles.markerColumn}>
                <View style={[styles.dot, stop.isCurrent && styles.dotActive]} />
                {!isLast ? <View style={styles.line} /> : null}
              </View>

              <View style={styles.textBlock}>
                <Text style={styles.stopName}>{stop.name}</Text>
                <Text style={styles.eta}>{stop.etaText}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    ...appTheme.typography.subtitle,
    color: appTheme.colors.textCharcoal,
  },
  timeline: {
    marginTop: appTheme.spacing.md,
    gap: appTheme.spacing.md,
  },
  item: {
    flexDirection: 'row',
    gap: appTheme.spacing.sm,
  },
  markerColumn: {
    width: 16,
    alignItems: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(13, 43, 85, 0.35)',
    backgroundColor: '#FFFFFF',
  },
  dotActive: {
    borderColor: appTheme.colors.accentTeal,
    backgroundColor: 'rgba(29, 158, 117, 0.25)',
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 2,
    backgroundColor: 'rgba(13, 43, 85, 0.16)',
  },
  textBlock: {
    flex: 1,
  },
  stopName: {
    ...appTheme.typography.body,
    color: appTheme.colors.textCharcoal,
    fontWeight: '600',
  },
  eta: {
    ...appTheme.typography.caption,
    color: appTheme.colors.textMuted,
    marginTop: 2,
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { appTheme } from '../../theme';
import { Badge, Card } from '../primitives';

type RecommendationCardProps = {
  title: string;
  route: string;
  durationLabel: string;
  description: string;
  tone?: 'green' | 'orange' | 'red';
};

export function RecommendationCard({
  title,
  route,
  durationLabel,
  description,
  tone = 'green',
}: RecommendationCardProps) {
  return (
    <Card>
      <View style={styles.row}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.route}>{route}</Text>
        </View>
        <Badge label={durationLabel} tone={tone} />
      </View>
      <Text style={styles.description}>{description}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: appTheme.spacing.sm,
  },
  title: {
    ...appTheme.typography.body,
    color: appTheme.colors.textMuted,
  },
  route: {
    ...appTheme.typography.subtitle,
    color: appTheme.colors.textCharcoal,
    marginTop: 2,
  },
  description: {
    ...appTheme.typography.body,
    color: appTheme.colors.textMuted,
    marginTop: appTheme.spacing.sm,
  },
});

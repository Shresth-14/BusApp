import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { appTheme } from '../../theme';
import { Card } from '../primitives';

type FrequencyRow = {
  id: string;
  label: string;
  value: string;
};

type FrequencyCardProps = {
  title: string;
  rows: FrequencyRow[];
};

export function FrequencyCard({ title, rows }: FrequencyCardProps) {
  return (
    <Card>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.rows}>
        {rows.map((row) => (
          <View key={row.id} style={styles.row}>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={styles.value}>{row.value}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    ...appTheme.typography.subtitle,
    color: appTheme.colors.textCharcoal,
  },
  rows: {
    marginTop: appTheme.spacing.sm,
    gap: appTheme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: appTheme.spacing.sm,
    paddingTop: appTheme.spacing.sm,
  },
  label: {
    ...appTheme.typography.body,
    color: appTheme.colors.textMuted,
    flex: 1,
  },
  value: {
    ...appTheme.typography.body,
    color: appTheme.colors.textCharcoal,
    fontWeight: '600',
  },
});

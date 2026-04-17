import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AlertItem } from '../../types/ui';
import { appTheme } from '../../theme';
import { Card } from '../primitives';

type AlertsListCardProps = {
  title: string;
  items: AlertItem[];
};

export function AlertsListCard({ title, items }: AlertsListCardProps) {
  return (
    <Card>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.list}>
        {items.map((item) => (
          <View key={item.id} style={styles.row}>
            <View style={[styles.dot, severityStyles[item.severity]]} />
            <View style={styles.textBlock}>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.timestamp}>{item.timestamp}</Text>
            </View>
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
  list: {
    marginTop: appTheme.spacing.sm,
    gap: appTheme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: appTheme.spacing.sm,
    alignItems: 'flex-start',
    paddingTop: appTheme.spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  textBlock: {
    flex: 1,
  },
  message: {
    ...appTheme.typography.body,
    color: appTheme.colors.textCharcoal,
    fontWeight: '600',
  },
  timestamp: {
    ...appTheme.typography.caption,
    color: appTheme.colors.textMuted,
    marginTop: 2,
  },
});

const severityStyles = StyleSheet.create({
  info: { backgroundColor: appTheme.colors.accentTeal },
  warning: { backgroundColor: appTheme.colors.alertOrange },
  error: { backgroundColor: appTheme.colors.errorRed },
});

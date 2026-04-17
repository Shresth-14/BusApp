import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { appTheme } from '../../theme';

type BadgeTone = 'green' | 'orange' | 'red';

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
};

export function Badge({ label, tone = 'green' }: BadgeProps) {
  return (
    <View style={[styles.base, toneStyles[tone].container]}>
      <Text style={[styles.text, toneStyles[tone].text]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: appTheme.radii.pill,
    paddingHorizontal: appTheme.spacing.sm,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  text: {
    ...appTheme.typography.caption,
    fontWeight: '600',
  },
});

const toneStyles = {
  green: StyleSheet.create({
    container: { backgroundColor: 'rgba(29, 158, 117, 0.14)' },
    text: { color: appTheme.colors.accentTeal },
  }),
  orange: StyleSheet.create({
    container: { backgroundColor: 'rgba(216, 90, 48, 0.16)' },
    text: { color: '#974020' },
  }),
  red: StyleSheet.create({
    container: { backgroundColor: 'rgba(179, 38, 30, 0.16)' },
    text: { color: appTheme.colors.errorRed },
  }),
};

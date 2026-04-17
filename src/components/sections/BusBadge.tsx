import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type BusBadgeProps = {
  label: string;
  index: number;
};

const BADGE_COLORS = ['#E8F7F8', '#EAF2FF', '#EDF8EF', '#FFF4E9'];
const BADGE_TEXT_COLORS = ['#0A7D80', '#2459A8', '#1E7A45', '#9A5A0A'];

export function BusBadge({ label, index }: BusBadgeProps) {
  const colorIndex = index % BADGE_COLORS.length;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: BADGE_COLORS[colorIndex],
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: BADGE_TEXT_COLORS[colorIndex],
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

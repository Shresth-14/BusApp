import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { appTheme } from '../../theme';
import { BusBadge } from './BusBadge';

type StopCardProps = {
  name: string;
  distanceText: string;
  buses: string[];
  active?: boolean;
  onPress?: () => void;
};

export function StopCard({ name, distanceText, buses, active = false, onPress }: StopCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        active && styles.cardActive,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>{name}</Text>
          <Text style={styles.distance}>{distanceText}</Text>
        </View>
        <View style={styles.markerWrap}>
          <MaterialCommunityIcons name="bus-stop" size={18} color="#0F8B8D" />
        </View>
      </View>

      <View style={styles.badgesRow}>
        {buses.length ? (
          buses.map((bus, index) => <BusBadge key={`${name}-${bus}-${index}`} label={bus} index={index} />)
        ) : (
          <Text style={styles.noBusText}>No assigned buses</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E7EE',
    padding: 14,
    marginBottom: 10,
    shadowColor: '#0E203B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardActive: {
    borderColor: '#4AB8BB',
    backgroundColor: '#F3FCFC',
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
    shadowOpacity: 0.12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: '#12223A',
    fontSize: 17,
    fontWeight: '800',
  },
  distance: {
    marginTop: 3,
    color: appTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  markerWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF8F8',
    borderWidth: 1,
    borderColor: '#D2ECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgesRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  noBusText: {
    color: appTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});

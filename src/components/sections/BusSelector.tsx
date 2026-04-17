import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { appTheme } from '../../theme';

export type BusItem = {
  busNumber: string;
  routeName: string;
  from: string;
  to: string;
};

type BusSelectorProps = {
  buses: BusItem[];
  selectedBusNumber: string | null;
  onSelectBus: (bus: BusItem) => void;
  isLoading?: boolean;
};

export function BusSelector({ buses, selectedBusNumber, onSelectBus, isLoading }: BusSelectorProps) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading buses...</Text>
      </View>
    );
  }

  if (!buses.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No buses available</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={buses}
      keyExtractor={(item) => item.busNumber}
      renderItem={({ item }) => {
        const isSelected = item.busNumber === selectedBusNumber;
        return (
          <Pressable
            style={[styles.busItem, isSelected && styles.busItemSelected]}
            onPress={() => onSelectBus(item)}
          >
            <View style={[styles.busBadge, isSelected && styles.busBadgeSelected]}>
              <Text style={[styles.busBadgeText, isSelected && styles.busBadgeTextSelected]}>
                {item.busNumber}
              </Text>
            </View>
            <View style={styles.busInfo}>
              <Text style={[styles.routeName, isSelected && styles.routeNameSelected]} numberOfLines={1}>
                {item.routeName}
              </Text>
              <Text style={[styles.routeDirection, isSelected && styles.routeDirectionSelected]} numberOfLines={1}>
                {item.from} → {item.to}
              </Text>
            </View>
          </Pressable>
        );
      }}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: appTheme.colors.backgroundSoft,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 60,
  },
  list: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  busItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  busItemSelected: {
    backgroundColor: appTheme.colors.accentTeal,
    borderColor: appTheme.colors.accentTeal,
  },
  busBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: appTheme.colors.backgroundSoft,
    borderRadius: 6,
    minWidth: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  busBadgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  busBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: appTheme.colors.primaryNavy,
  },
  busBadgeTextSelected: {
    color: '#fff',
  },
  busInfo: {
    flex: 1,
    minWidth: 120,
  },
  routeName: {
    fontSize: 13,
    fontWeight: '600',
    color: appTheme.colors.primaryNavy,
    marginBottom: 2,
  },
  routeNameSelected: {
    color: '#fff',
  },
  routeDirection: {
    fontSize: 11,
    color: appTheme.colors.textMuted,
  },
  routeDirectionSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loadingText: {
    fontSize: 13,
    color: appTheme.colors.textMuted,
  },
  emptyText: {
    fontSize: 13,
    color: appTheme.colors.textMuted,
  },
});

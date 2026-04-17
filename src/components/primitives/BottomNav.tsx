import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomTabKey } from '../../types/ui';
import { appTheme } from '../../theme';
import { AppIcon, AppIconName } from './AppIcon';
import { useDeviceClass } from '../../utils/device';

type BottomNavProps = {
  activeTab: BottomTabKey;
  onTabPress?: (tab: BottomTabKey) => void;
};

const tabs: Array<{ key: BottomTabKey; label: string }> = [
  { key: 'routes', label: 'Stop' },
  { key: 'tickets', label: 'Saved' },
  { key: 'profile', label: 'Journey' },
];

const tabIcons: Record<BottomTabKey, AppIconName> = {
  routes: 'routes',
  tickets: 'tickets',
  profile: 'alerts',
};

export function BottomNav({ activeTab, onTabPress }: BottomNavProps) {
  const { isCompact } = useDeviceClass();

  return (
    <View style={[styles.navWrap, isCompact && styles.navWrapCompact]}>
    <View style={[styles.nav, isCompact && styles.navCompact]}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onTabPress?.(tab.key)}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.item,
              isCompact && styles.itemCompact,
              isActive && styles.itemActive,
              pressed && styles.itemPressed,
            ]}
          >
            <AppIcon
              name={tabIcons[tab.key]}
              size={18}
              color={isActive ? '#0F8B8D' : '#7A8795'}
            />
            <Text style={[styles.label, isCompact && styles.labelCompact, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navWrap: {
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
  },
  navWrapCompact: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  nav: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#DCE6EF',
    borderRadius: 18,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#10213A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  navCompact: {
    paddingHorizontal: 6,
    paddingBottom: 8,
  },
  item: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 3,
  },
  itemCompact: {
    paddingVertical: 6,
    gap: 2,
  },
  itemActive: {
    backgroundColor: '#EAF8F8',
    borderWidth: 1,
    borderColor: '#CFEAEB',
    shadowColor: '#0F8B8D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  itemPressed: {
    opacity: 0.85,
  },
  label: {
    ...appTheme.typography.caption,
    fontWeight: '600',
    color: '#7A8795',
  },
  labelCompact: {
    fontSize: 11,
    lineHeight: 14,
  },
  labelActive: {
    color: '#0F8B8D',
  },
});

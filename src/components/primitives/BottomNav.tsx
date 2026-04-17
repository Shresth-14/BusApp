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
              color={isActive ? appTheme.colors.primaryNavy : appTheme.colors.textMuted}
            />
            <Text style={[styles.label, isCompact && styles.labelCompact, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: appTheme.colors.borderSubtle,
    paddingHorizontal: appTheme.spacing.sm,
    paddingTop: appTheme.spacing.sm,
    paddingBottom: appTheme.spacing.md,
    backgroundColor: appTheme.colors.surface,
    shadowColor: '#0D2B55',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  navCompact: {
    paddingHorizontal: 4,
    paddingBottom: 10,
  },
  item: {
    flex: 1,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: appTheme.spacing.sm,
    gap: 3,
  },
  itemCompact: {
    paddingVertical: 6,
    gap: 2,
  },
  itemActive: {
    backgroundColor: 'rgba(165, 214, 167, 0.34)',
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  itemPressed: {
    opacity: 0.85,
  },
  label: {
    ...appTheme.typography.caption,
    fontWeight: '600',
    color: appTheme.colors.textMuted,
  },
  labelCompact: {
    fontSize: 11,
    lineHeight: 14,
  },
  labelActive: {
    color: appTheme.colors.primaryNavy,
  },
});

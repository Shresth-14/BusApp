import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomTabKey } from '../types/ui';
import { appTheme } from '../theme';
import { AppIcon, BottomNav, Card, ScreenShell } from '../components/primitives';
import { useAppFeedback } from '../feedback/useAppFeedback';
import { useDeviceClass } from '../utils/device';
import { getAllRoutes } from '../api/haryanaApi';
import { BackendRouteSummary } from '../types/backend';

type RecentTripsScreenProps = {
  onTabPress?: (tab: BottomTabKey) => void;
  onRouteSelect?: (routeId: string) => void;
};

export function RecentTripsScreen({ onTabPress, onRouteSelect }: RecentTripsScreenProps) {
  const { notify } = useAppFeedback();
  const { isCompact } = useDeviceClass();
  const [routes, setRoutes] = useState<BackendRouteSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadRoutes = async () => {
      try {
        const data = await getAllRoutes();
        if (!mounted) return;
        setRoutes(data);
      } catch (error) {
        if (!mounted) return;
        const message = error instanceof Error ? error.message : 'Unable to load saved routes.';
        notify(message, {
          analyticsEvent: 'saved_routes_error',
        });
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadRoutes();

    return () => {
      mounted = false;
    };
  }, [notify]);

  const favoriteRoutes = useMemo(() => {
    return routes.slice(0, 4).map((route) => {
      const [fromPart, toPart] = route.route_name.split('->').map((part) => part.trim());
      return {
        ...route,
        from: fromPart || route.route_name,
        to: toPart || 'Destination',
        fareEstimate: Math.max(20, Math.round(route.distance_km * 4.5)),
      };
    });
  }, [routes]);

  const commuteStats = [
    { label: 'Favorite routes', value: favoriteRoutes.length || '--' },
    { label: 'Saved commute', value: 'Daily' },
    { label: 'Avg fare', value: favoriteRoutes.length ? `₹${Math.round(favoriteRoutes.reduce((sum, item) => sum + item.fareEstimate, 0) / favoriteRoutes.length)}` : '--' },
  ];

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={[styles.content, isCompact && styles.contentCompact]}>
        <View style={styles.headerSurface}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTextBlock}>
              <Text style={styles.headerKicker}>SAVED COMMUTES</Text>
              <Text style={[styles.headerTitle, isCompact && styles.headerTitleCompact]}>Saved Routes</Text>
              <Text style={styles.headerSubtitle}>Quick access to the routes you use most often</Text>
            </View>
            <Pressable style={styles.headerHomeBtn} onPress={() => onTabPress?.('routes')}>
              <AppIcon name="routes" size={18} color={appTheme.colors.primaryNavy} />
            </Pressable>
          </View>

          <View style={styles.headerStatsRow}>
            {commuteStats.map((stat) => (
              <View key={stat.label} style={styles.statPill}>
                <Text style={styles.statPillLabel}>{stat.label}</Text>
                <Text style={styles.statPillValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <Card style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle}>One tap to your usual route</Text>
              <Text style={styles.heroSubtitle}>Keep your common corridors ready before you search again.</Text>
            </View>
            <View style={styles.heroIconWrap}>
              <AppIcon name="tickets" size={20} color={appTheme.colors.primaryNavy} />
            </View>
          </View>
          <View style={styles.heroButtonsRow}>
            <Pressable style={styles.heroActionBtn} onPress={() => onTabPress?.('routes')}>
              <Text style={styles.heroActionBtnText}>Browse Routes</Text>
            </Pressable>
            <Pressable style={styles.heroActionBtnSoft} onPress={() => notify('Saved commute reminders enabled.', { analyticsEvent: 'saved_routes_reminders' })}>
              <Text style={styles.heroActionBtnSoftText}>Enable reminders</Text>
            </Pressable>
          </View>
        </Card>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>My saved routes</Text>
          <Text style={styles.sectionMeta}>{isLoading ? 'Loading...' : `${routes.length} available`}</Text>
        </View>

        <View style={styles.routeGrid}>
          {favoriteRoutes.map((route) => (
            <Pressable
              key={route.route_id}
              style={styles.routeCard}
              onPress={() => {
                onRouteSelect?.(route.route_id);
                onTabPress?.('routes');
              }}
            >
              <View style={styles.routeCardTop}>
                <Text style={styles.routeName} numberOfLines={1}>{route.route_name}</Text>
                <Text style={styles.routeTime}>{route.estimated_time_minutes} min</Text>
              </View>
              <Text style={styles.routeId}>{route.route_id}</Text>
              <Text style={styles.routePath} numberOfLines={1}>{route.from} → {route.to}</Text>
              <View style={styles.routeFooter}>
                <Text style={styles.routeFare}>Est. ₹{route.fareEstimate}</Text>
                <Text style={styles.routeLink}>Open</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Card style={styles.tipCard}>
          <Text style={styles.tipTitle}>Travel tip</Text>
          <Text style={styles.tipText}>
            Add the routes you use most often here. This page is now your quick-access commute hub, not a duplicate journey log.
          </Text>
        </Card>
      </ScrollView>

      <BottomNav activeTab="tickets" onTabPress={onTabPress} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: appTheme.spacing.lg,
  },
  contentCompact: {
    paddingBottom: appTheme.spacing.md,
  },
  headerSurface: {
    marginHorizontal: appTheme.spacing.md,
    marginTop: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4E6DC',
    backgroundColor: '#F2FAF5',
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...appTheme.elevation.card,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  headerTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  headerKicker: {
    color: '#2E7D57',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.9,
  },
  headerTitle: {
    marginTop: 2,
    color: appTheme.colors.primaryNavy,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '700',
  },
  headerTitleCompact: {
    fontSize: 19,
    lineHeight: 23,
  },
  headerSubtitle: {
    marginTop: 2,
    color: appTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  headerHomeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCE1D6',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerStatsRow: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statPill: {
    flexGrow: 1,
    borderRadius: 14,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#D9E8E0',
    minWidth: 96,
  },
  statPillLabel: {
    color: appTheme.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  statPillValue: {
    marginTop: 4,
    color: appTheme.colors.primaryNavy,
    fontSize: 15,
    fontWeight: '800',
  },
  heroCard: {
    marginHorizontal: appTheme.spacing.md,
    marginTop: 12,
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    color: appTheme.colors.primaryNavy,
    fontSize: 17,
    fontWeight: '800',
  },
  heroSubtitle: {
    marginTop: 4,
    color: appTheme.colors.textMuted,
    fontSize: 13,
  },
  heroIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF8F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroButtonsRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  heroActionBtn: {
    flex: 1,
    minWidth: 140,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appTheme.colors.primaryNavy,
  },
  heroActionBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  heroActionBtnSoft: {
    flex: 1,
    minWidth: 140,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF8F2',
    borderWidth: 1,
    borderColor: '#D8E9DE',
  },
  heroActionBtnSoftText: {
    color: appTheme.colors.primaryNavy,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHead: {
    marginHorizontal: appTheme.spacing.md,
    marginTop: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: appTheme.colors.primaryNavy,
    fontSize: 16,
    fontWeight: '800',
  },
  sectionMeta: {
    color: appTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  routeGrid: {
    marginHorizontal: appTheme.spacing.md,
    gap: 10,
  },
  routeCard: {
    borderRadius: 18,
    backgroundColor: '#fff',
    padding: 14,
    borderWidth: 1,
    borderColor: '#DCE7E1',
  },
  routeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  routeName: {
    flex: 1,
    color: appTheme.colors.primaryNavy,
    fontSize: 15,
    fontWeight: '800',
  },
  routeTime: {
    color: '#2E7D57',
    fontSize: 12,
    fontWeight: '800',
  },
  routeId: {
    marginTop: 4,
    color: appTheme.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  routePath: {
    marginTop: 6,
    color: appTheme.colors.textCharcoal,
    fontSize: 13,
    fontWeight: '600',
  },
  routeFooter: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeFare: {
    color: appTheme.colors.primaryNavy,
    fontSize: 13,
    fontWeight: '700',
  },
  routeLink: {
    color: '#2E7D57',
    fontSize: 12,
    fontWeight: '800',
  },
  tipCard: {
    marginHorizontal: appTheme.spacing.md,
    marginTop: 12,
    marginBottom: 10,
    padding: 14,
  },
  tipTitle: {
    color: appTheme.colors.primaryNavy,
    fontSize: 15,
    fontWeight: '800',
  },
  tipText: {
    marginTop: 4,
    color: appTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});

import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabKey } from '../types/ui';
import { appTheme } from '../theme';
import { AppIcon, AppButton, BottomNav, ScreenShell } from '../components/primitives';
import { useAppFeedback } from '../feedback/useAppFeedback';
import { getAllRoutes } from '../api/haryanaApi';
import { BackendRouteSummary } from '../types/backend';
import { useDeviceClass } from '../utils/device';

type RouteDetailsScreenProps = {
  onTabPress?: (tab: BottomTabKey) => void;
  routeId?: string;
  onRouteSelect?: (routeId: string) => void;
  onShowMap?: (routeId: string) => void;
};

type RouteCardItem = {
  route_id: string;
  route_name: string;
  from: string;
  to: string;
  etaMinutes: number;
};

export function RouteDetailsScreen({
  onTabPress,
  routeId = 'HRY-RTE-001',
  onRouteSelect,
  onShowMap,
}: RouteDetailsScreenProps) {
  const { notify } = useAppFeedback();
  const { isCompact } = useDeviceClass();
  const [allRoutes, setAllRoutes] = useState<BackendRouteSummary[]>([]);
  const [routeQuery, setRouteQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRouteId, setSelectedRouteId] = useState(routeId);

  useEffect(() => {
    setSelectedRouteId(routeId);
  }, [routeId]);

  useEffect(() => {
    let mounted = true;

    const loadAllRoutes = async () => {
      try {
        const routes = await getAllRoutes();
        if (!mounted) return;
        setAllRoutes(routes);
      } catch (error) {
        if (!mounted) return;
        const message = error instanceof Error ? error.message : 'Unable to load route options.';
        notify(message, {
          analyticsEvent: 'route_options_error',
        });
      }
    };

    loadAllRoutes();

    return () => {
      mounted = false;
    };
  }, [notify]);

  const filteredRoutes = useMemo(() => {
    const query = routeQuery.trim().toLowerCase();
    if (!query) return allRoutes;

    return allRoutes.filter((item) => {
      const id = item.route_id.toLowerCase();
      const name = item.route_name.toLowerCase();
      return id.includes(query) || name.includes(query);
    });
  }, [allRoutes, routeQuery]);

  const routeCards = useMemo<RouteCardItem[]>(() => {
    return filteredRoutes.map((item) => {
      const [fromPart, toPart] = item.route_name.split('->').map((part) => part.trim());

      return {
        route_id: item.route_id,
        route_name: item.route_name,
        from: fromPart || item.route_name,
        to: toPart || 'Destination',
        etaMinutes: item.estimated_time_minutes,
      };
    });
  }, [filteredRoutes]);

  const selectedRouteSummary = useMemo(() => {
    const summary = allRoutes.find((item) => item.route_id === selectedRouteId) || allRoutes[0];

    if (!summary) {
      return null;
    }

    const [fromPart, toPart] = summary.route_name.split('->').map((part) => part.trim());
    const fareEstimate = Math.max(20, Math.round(summary.distance_km * 4.5));

    return {
      ...summary,
      from: fromPart || summary.route_name,
      to: toPart || 'Destination',
      fareEstimate,
    };
  }, [allRoutes, selectedRouteId]);

  return (
    <ScreenShell>
      <View style={styles.panelWrap}>
        <ScrollView contentContainerStyle={[styles.panelContent, isCompact && styles.panelContentCompact]}>
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroTextWrap}>
                <Text style={styles.heroKicker}>HARYANAGO ROUTES</Text>
                <Text style={styles.heroTitle}>Choose a route, then show the map</Text>
                <Text style={styles.heroSubtitle}>Browse live routes in a cleaner, map-first flow.</Text>
              </View>
              <View style={styles.heroIconWrap}>
                <AppIcon name="routes" size={20} color={appTheme.colors.primaryNavy} />
              </View>
            </View>

            <View style={styles.heroStatsRow}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatLabel}>Routes</Text>
                <Text style={styles.heroStatValue}>{allRoutes.length || '--'}</Text>
              </View>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatLabel}>Focus</Text>
                <Text style={styles.heroStatValue}>Map first</Text>
              </View>
            </View>
          </View>

          <View style={styles.topActions}>
            <Pressable style={styles.backBtn} onPress={() => onTabPress?.('tickets')}>
              <AppIcon name="back" size={20} color={appTheme.colors.primaryNavy} />
              <Text style={styles.backText}>Back</Text>
            </Pressable>

            <Pressable
              style={styles.circleBtn}
              onPress={() =>
                notify('Route saved to favorites.', {
                  analyticsEvent: 'route_favorited',
                })
              }
            >
              <MaterialCommunityIcons name="heart-outline" size={18} color={appTheme.colors.primaryNavy} />
            </Pressable>
          </View>

          <View style={styles.routeSwitchCard}>
            <View style={styles.routeSwitchHead}>
              <Text style={styles.routeSwitchTitle}>All Routes / सभी रूट</Text>
              <Text style={styles.routeSwitchHint}>Tap a route to view live tracking</Text>
            </View>

            <View style={styles.routeSearchWrap}>
              <MaterialCommunityIcons name="magnify" size={16} color={appTheme.colors.textMuted} />
              <TextInput
                value={routeQuery}
                onChangeText={setRouteQuery}
                placeholder="Search by route name, id, or city"
                placeholderTextColor={appTheme.colors.textMuted}
                style={styles.routeSearchInput}
              />
            </View>

            <ScrollView nestedScrollEnabled style={styles.routeListScroll}>
              {routeCards.map((item) => {
                const active = item.route_id === routeId;

                return (
                  <Pressable
                    key={`list-${item.route_id}`}
                    style={[styles.routeCard, active && styles.routeCardActive]}
                    onPress={() => {
                      setSelectedRouteId(item.route_id);
                      onRouteSelect?.(item.route_id);
                    }}
                  >
                    <View style={styles.routeListHeader}>
                      <Text style={styles.routeListName} numberOfLines={1}>{item.route_name}</Text>
                      <Text style={styles.routeListMeta}>{item.etaMinutes} min</Text>
                    </View>
                    <Text style={styles.routeListCode}>{item.route_id}</Text>
                    <Text style={styles.routeListJourney} numberOfLines={1}>
                      {item.from} → {item.to}
                    </Text>
                  </Pressable>
                );
              })}

              {!routeCards.length && (
                <View style={styles.routeListEmpty}>
                  <Text style={styles.routeListEmptyText}>No routes match your search.</Text>
                </View>
              )}
            </ScrollView>
          </View>

          {selectedRouteSummary && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryTitleWrap}>
                  <Text style={styles.summaryTitle}>{selectedRouteSummary.route_name}</Text>
                  <Text style={styles.summarySubtitle}>{selectedRouteSummary.route_id}</Text>
                </View>
                <Text style={styles.summaryPrice}>₹{selectedRouteSummary.fareEstimate}</Text>
              </View>

              <View style={styles.summaryGrid}>
                <View style={styles.summaryMetric}>
                  <Text style={styles.summaryMetricLabel}>Time</Text>
                  <Text style={styles.summaryMetricValue}>{selectedRouteSummary.estimated_time_minutes} min</Text>
                </View>
                <View style={styles.summaryMetric}>
                  <Text style={styles.summaryMetricLabel}>Distance</Text>
                  <Text style={styles.summaryMetricValue}>{selectedRouteSummary.distance_km} km</Text>
                </View>
                <View style={styles.summaryMetric}>
                  <Text style={styles.summaryMetricLabel}>Fare</Text>
                  <Text style={styles.summaryMetricValue}>Est. ₹{selectedRouteSummary.fareEstimate}</Text>
                </View>
              </View>

              <Text style={styles.summaryRouteLine} numberOfLines={1}>
                {selectedRouteSummary.from} → {selectedRouteSummary.to}
              </Text>

              <View style={styles.summaryActions}>
                <AppButton
                  title="Show Map"
                  onPress={() => onShowMap?.(selectedRouteSummary.route_id)}
                  style={styles.showMapBtn}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      <BottomNav activeTab="routes" onTabPress={onTabPress} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  mapWrap: {
    overflow: 'hidden',
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  mapWrapCompact: {
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  topActions: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backBtn: {
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(247, 251, 250, 0.94)',
    borderWidth: 1,
    borderColor: appTheme.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    gap: 4,
  },
  backText: {
    color: appTheme.colors.primaryNavy,
    fontSize: 12,
    fontWeight: '500',
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(247, 251, 250, 0.94)',
    borderWidth: 1,
    borderColor: appTheme.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelWrap: {
    flex: 1,
    marginTop: -8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: appTheme.colors.surface,
    borderTopWidth: 1,
    borderColor: appTheme.colors.borderSubtle,
  },
  panelContent: {
    paddingHorizontal: appTheme.spacing.lg,
    paddingTop: appTheme.spacing.lg,
    paddingBottom: appTheme.spacing.xl,
  },
  panelContentCompact: {
    paddingHorizontal: appTheme.spacing.md,
    paddingTop: appTheme.spacing.md,
  },
  heroCard: {
    borderWidth: 1,
    borderColor: '#CFE3D8',
    backgroundColor: '#EEF8F2',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    ...appTheme.elevation.card,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  heroTextWrap: {
    flex: 1,
  },
  heroKicker: {
    color: appTheme.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: {
    marginTop: 3,
    color: appTheme.colors.primaryNavy,
    fontSize: 19,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: appTheme.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  heroStat: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#DCE8E1',
  },
  heroStatLabel: {
    color: appTheme.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  heroStatValue: {
    marginTop: 3,
    color: appTheme.colors.primaryNavy,
    fontSize: 13,
    fontWeight: '800',
  },
  routeSwitchCard: {
    borderWidth: 1,
    borderColor: '#DDE9E4',
    backgroundColor: '#F7FBF8',
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
  },
  routeSwitchHead: {
    gap: 2,
    marginBottom: 8,
  },
  routeSwitchTitle: {
    color: appTheme.colors.primaryNavy,
    fontSize: 14,
    fontWeight: '700',
  },
  routeSwitchHint: {
    color: appTheme.colors.textMuted,
    fontSize: 12,
  },
  routeCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CFE0D8',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  routeCardActive: {
    borderColor: '#2C7D5B',
    backgroundColor: '#E6F4EE',
  },
  routeListWrap: {
    marginTop: 9,
    borderTopWidth: 1,
    borderTopColor: '#E0ECE6',
    paddingTop: 8,
  },
  routeSearchWrap: {
    minHeight: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D7E6DF',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeSearchInput: {
    flex: 1,
    color: appTheme.colors.textCharcoal,
    fontSize: 13,
  },
  routeListScroll: {
    maxHeight: 260,
  },
  routeListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  routeListCode: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  routeListMeta: {
    color: appTheme.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  routeListName: {
    color: appTheme.colors.primaryNavy,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  routeListJourney: {
    marginTop: 3,
    color: appTheme.colors.textCharcoal,
    fontSize: 12,
    fontWeight: '500',
  },
  routeListEmpty: {
    borderWidth: 1,
    borderColor: '#DFEAE5',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  routeListEmptyText: {
    color: appTheme.colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
  summaryCard: {
    marginTop: appTheme.spacing.md,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7E6DF',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  summaryTitleWrap: {
    flex: 1,
  },
  summaryTitle: {
    color: appTheme.colors.primaryNavy,
    fontSize: 17,
    fontWeight: '700',
  },
  summarySubtitle: {
    marginTop: 2,
    color: appTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  summaryPrice: {
    color: '#2E7D32',
    fontSize: 20,
    fontWeight: '800',
  },
  summaryGrid: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  summaryMetric: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#F7FBF8',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E3EEE7',
  },
  summaryMetricLabel: {
    color: appTheme.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  summaryMetricValue: {
    marginTop: 4,
    color: appTheme.colors.primaryNavy,
    fontSize: 13,
    fontWeight: '700',
  },
  summaryRouteLine: {
    marginTop: 12,
    color: appTheme.colors.textCharcoal,
    fontSize: 13,
    fontWeight: '600',
  },
  summaryActions: {
    marginTop: 12,
  },
  showMapBtn: {
    width: '100%',
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stationName: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '600',
    color: appTheme.colors.primaryNavy,
  },
  stationNameCompact: {
    fontSize: 21,
    lineHeight: 26,
    maxWidth: 248,
  },
  favoriteBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F8EDF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    marginTop: appTheme.spacing.md,
    fontSize: 13,
    color: appTheme.colors.textMuted,
  },
  platformRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  platformChip: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EFF4F3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2EBE8',
  },
  platformChipActive: {
    backgroundColor: '#DBF1EE',
    borderColor: '#BEE4DE',
  },
  platformText: {
    fontSize: 12,
    fontWeight: '600',
    color: appTheme.colors.textMuted,
  },
  platformTextActive: {
    color: '#2B8778',
  },
  arrivalsList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5ECEA',
  },
  arrivalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 68,
    borderBottomWidth: 1,
    borderBottomColor: '#E5ECEA',
  },
  arrivalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  busIcon: {
    marginRight: 7,
  },
  lineBadge: {
    minWidth: 22,
    height: 20,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    paddingHorizontal: 4,
  },
  lineBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  arrivalTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  arrivalName: {
    color: appTheme.colors.primaryNavy,
    fontSize: 16,
    fontWeight: '600',
  },
  arrivalNameCompact: {
    fontSize: 14,
  },
  arrivalMeta: {
    marginTop: 2,
    color: appTheme.colors.textMuted,
    fontSize: 12,
  },
  eta: {
    marginLeft: 10,
    color: appTheme.colors.primaryNavy,
    fontSize: 20,
    fontWeight: '600',
  },
  etaSoon: {
    marginLeft: 10,
    color: '#24A772',
    fontSize: 20,
    fontWeight: '700',
  },
  etaCompact: {
    fontSize: 16,
  },
});

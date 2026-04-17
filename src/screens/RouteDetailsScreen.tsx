import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomTabKey } from '../types/ui';
import { appTheme } from '../theme';
import { AppButton, BottomNav, ScreenShell } from '../components/primitives';
import { StopCard, StopsHeader, StopsSearchBar } from '../components/sections';
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

type StopCardItem = {
  route_id: string;
  placePair: string;
  route_name: string;
  distanceText: string;
  busNumbers: string[];
};

export function RouteDetailsScreen({
  onTabPress,
  routeId,
  onRouteSelect,
  onShowMap,
}: RouteDetailsScreenProps) {
  const { notify } = useAppFeedback();
  const { isCompact } = useDeviceClass();

  const [allRoutes, setAllRoutes] = useState<BackendRouteSummary[]>([]);
  const [routeQuery, setRouteQuery] = useState('');
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(routeId ?? null);

  useEffect(() => {
    setSelectedRouteId(routeId ?? null);
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

  const stopCards = useMemo<StopCardItem[]>(() => {
    return filteredRoutes.map((item) => {
      const [fromPart, toPart] = item.route_name.split('->').map((part) => part.trim());
      const from = fromPart || 'Source';
      const to = toPart || 'Destination';
      const distanceMeters = Math.round(item.distance_km * 1000);
      const distanceText = distanceMeters < 1000 ? `${distanceMeters}m away` : `${item.distance_km.toFixed(1)}km away`;
      const placePair = `${from} - ${to}`;
      const busNumbers = item.buses?.map((bus) => bus.busNumber).filter(Boolean) ?? [];

      return {
        route_id: item.route_id,
        placePair,
        route_name: item.route_name,
        distanceText,
        busNumbers,
      };
    });
  }, [filteredRoutes]);

  const hasSearchQuery = routeQuery.trim().length > 0;

  const selectedRouteSummary = useMemo(() => {
    if (!selectedRouteId) return null;

    const summary = allRoutes.find((item) => item.route_id === selectedRouteId);
    if (!summary) return null;

    const fareEstimate = Math.max(20, Math.round(summary.distance_km * 4.5));
    const [fromPart, toPart] = summary.route_name.split('->').map((part) => part.trim());

    return {
      ...summary,
      from: fromPart || summary.route_name,
      to: toPart || 'Destination',
      fareEstimate,
    };
  }, [allRoutes, selectedRouteId]);

  return (
    <ScreenShell>
      <View style={styles.pageWrap}>
        <ScrollView contentContainerStyle={[styles.pageContent, isCompact && styles.pageContentCompact]}>
          <StopsHeader title="Stops" subtitle="Find nearby bus stops" />

          <StopsSearchBar
            value={routeQuery}
            onChangeText={setRouteQuery}
            placeholder="Search stops..."
            onNearMePress={() => {
              notify('Use search to find routes near your location.', {
                analyticsEvent: 'near_me_tapped',
              });
            }}
          />

          <View style={styles.stopsSectionCard}>
            <Text style={styles.sectionTitle}>Nearby stops</Text>
            <Text style={styles.sectionSubtitle}>
              {hasSearchQuery ? 'closest matches for your search' : 'search a stop name, route id, or city'}
            </Text>

            {!allRoutes.length && !hasSearchQuery ? (
              <View style={styles.loadingWrap}>
                <View style={styles.loadingBarWide} />
                <View style={styles.loadingBarNarrow} />
                <View style={styles.loadingBarMedium} />
              </View>
            ) : hasSearchQuery ? (
              <View style={styles.stopsListWrap}>
                {stopCards.map((item) => {
                  const active = item.route_id === selectedRouteId;

                  return (
                    <StopCard
                      key={`stop-${item.route_id}`}
                      name={item.placePair}
                      distanceText={item.distanceText}
                      buses={item.busNumbers}
                      active={active}
                      onPress={() => {
                        setSelectedRouteId(item.route_id);
                        onRouteSelect?.(item.route_id);
                      }}
                    />
                  );
                })}

                {!stopCards.length && (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No stops found</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.hintCard}>
                <Text style={styles.hintTitle}>Search nearby stops</Text>
                <Text style={styles.hintText}>Type to reveal stop cards and buses serving each stop.</Text>
              </View>
            )}
          </View>

          {selectedRouteSummary && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryTitleWrap}>
                  <Text style={styles.summaryTitle}>{selectedRouteSummary.from} → {selectedRouteSummary.to}</Text>
                  <Text style={styles.summarySubtitle}>
                    {selectedRouteSummary.route_id} · {selectedRouteSummary.estimated_time_minutes} min
                  </Text>
                </View>
                <Text style={styles.summaryPrice}>₹{selectedRouteSummary.fareEstimate}</Text>
              </View>

              <View style={styles.summaryGrid}>
                <View style={styles.summaryMetric}>
                  <Text style={styles.summaryMetricLabel}>Route</Text>
                  <Text style={styles.summaryMetricValue} numberOfLines={1}>{selectedRouteSummary.route_name}</Text>
                </View>
                <View style={styles.summaryMetric}>
                  <Text style={styles.summaryMetricLabel}>Buses</Text>
                  <Text style={styles.summaryMetricValue}>{selectedRouteSummary.buses.length}</Text>
                </View>
                <View style={styles.summaryMetric}>
                  <Text style={styles.summaryMetricLabel}>Distance</Text>
                  <Text style={styles.summaryMetricValue}>{selectedRouteSummary.distance_km} km</Text>
                </View>
              </View>

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
  pageWrap: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  pageContent: {
    paddingHorizontal: 14,
    paddingTop: appTheme.spacing.md,
    paddingBottom: 96,
  },
  pageContentCompact: {
    paddingHorizontal: 12,
    paddingTop: appTheme.spacing.sm,
  },
  stopsSectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    marginBottom: 12,
    shadowColor: '#10213A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    color: '#12223A',
    fontSize: 16,
    fontWeight: '800',
  },
  sectionSubtitle: {
    marginTop: 2,
    color: appTheme.colors.textMuted,
    fontSize: 13,
  },
  stopsListWrap: {
    marginTop: 10,
  },
  loadingWrap: {
    marginTop: 12,
    gap: 8,
  },
  loadingBarWide: {
    height: 12,
    borderRadius: 6,
    width: '78%',
    backgroundColor: '#E9EFF4',
  },
  loadingBarNarrow: {
    height: 12,
    borderRadius: 6,
    width: '56%',
    backgroundColor: '#E9EFF4',
  },
  loadingBarMedium: {
    height: 12,
    borderRadius: 6,
    width: '70%',
    backgroundColor: '#E9EFF4',
  },
  emptyCard: {
    borderWidth: 1,
    borderColor: '#DEE8EF',
    borderRadius: 10,
    backgroundColor: '#F8FBFF',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  emptyText: {
    color: appTheme.colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  hintCard: {
    borderWidth: 1,
    borderColor: '#E0E8F0',
    borderRadius: 14,
    backgroundColor: '#F8FBFF',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  hintTitle: {
    color: '#12223A',
    fontSize: 15,
    fontWeight: '800',
  },
  hintText: {
    marginTop: 3,
    color: appTheme.colors.textMuted,
    fontSize: 13,
  },
  summaryCard: {
    marginTop: 2,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6EF',
    padding: 14,
    shadowColor: '#10213A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
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
    color: '#12223A',
    fontSize: 16,
    fontWeight: '700',
  },
  summarySubtitle: {
    marginTop: 2,
    color: appTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  summaryPrice: {
    color: '#0F8B8D',
    fontSize: 18,
    fontWeight: '800',
  },
  summaryGrid: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 7,
  },
  summaryMetric: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#F6FAFE',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E3EDF5',
  },
  summaryMetricLabel: {
    color: appTheme.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  summaryMetricValue: {
    marginTop: 4,
    color: '#12223A',
    fontSize: 12,
    fontWeight: '700',
  },
  summaryActions: {
    marginTop: 12,
  },
  showMapBtn: {
    width: '100%',
    borderRadius: 999,
    backgroundColor: '#0F8B8D',
  },
});

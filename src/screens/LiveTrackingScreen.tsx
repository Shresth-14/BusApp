import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomTabKey } from '../types/ui';
import { appTheme } from '../theme';
import { AppButton, AppIcon, BottomNav, ScreenShell } from '../components/primitives';
import { LeafletMapCard, BusSelector } from '../components/sections';
import { useAppFeedback } from '../feedback/useAppFeedback';
import { useDeviceClass } from '../utils/device';
import { getAllRoutes, getLiveBus, getRouteDetails } from '../api/haryanaApi';
import { BackendLiveBus, BackendRouteDetails } from '../types/backend';
import type { BusItem } from '../components/sections/BusSelector';

type LiveTrackingScreenProps = {
  onTabPress?: (tab: BottomTabKey) => void;
  routeId?: string;
  onRouteSelect?: (routeId: string) => void;
};

export function LiveTrackingScreen({
  onTabPress,
  routeId,
  onRouteSelect,
}: LiveTrackingScreenProps) {
  const { notify } = useAppFeedback();
  const { height, isCompact, isPlusMax, isSE } = useDeviceClass();
  const [buses, setBuses] = useState<BusItem[]>([]);
  const [selectedBus, setSelectedBus] = useState<BusItem | null>(null);
  const [busesLoading, setBusesLoading] = useState(true);
  const [liveBus, setLiveBus] = useState<BackendLiveBus | null>(null);
  const [route, setRoute] = useState<BackendRouteDetails | null>(null);
  const [busError, setBusError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mapRatio = isSE ? 0.39 : isCompact ? 0.42 : isPlusMax ? 0.49 : 0.46;
  const mapHeight = Math.max(236, Math.min(440, Math.round(height * mapRatio)));

  // Fetch all buses from all routes
  useEffect(() => {
    let mounted = true;

    const loadAllBuses = async () => {
      try {
        setBusesLoading(true);
        setBusError(null);

        const routes = await getAllRoutes();
        if (!mounted) return;

        // Flatten all buses from all routes
        const allBuses: BusItem[] = [];
        routes.forEach((route) => {
          route.buses?.forEach((bus) => {
            allBuses.push({
              busNumber: bus.busNumber,
              routeName: route.route_name,
              from: route.stops?.[0] || 'Start',
              to: route.stops?.[route.stops.length - 1] || 'End',
            });
          });
        });

        if (!mounted) return;
        setBuses(allBuses);

        if (!selectedBus && allBuses.length > 0) {
          // Auto-select first bus or bus on preferred route
          let initialBus = allBuses[0];
          if (routeId) {
            const preferredBus = allBuses.find((b) => {
              const routeForBus = routes.find((r) => r.route_id === routeId);
              return routeForBus?.buses?.some((rb) => rb.busNumber === b.busNumber);
            });
            if (preferredBus) initialBus = preferredBus;
          }
          setSelectedBus(initialBus);
        }
      } catch (error) {
        if (!mounted) return;
        const message = error instanceof Error ? error.message : 'Unable to load buses.';
        setBusError(message);
      } finally {
        if (mounted) setBusesLoading(false);
      }
    };

    loadAllBuses();

    return () => {
      mounted = false;
    };
  }, [routeId]);

  // Fetch live bus data when selected bus changes
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!selectedBus) {
        if (mounted) {
          setLiveBus(null);
          setRoute(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setBusError(null);
        const live = await getLiveBus(selectedBus.busNumber);
        if (!mounted) return;
        setLiveBus(live);

        const details = await getRouteDetails(live.route_id);
        if (!mounted) return;
        setRoute(details);
      } catch (error) {
        if (!mounted) return;
        const message = error instanceof Error ? error.message : 'Unable to load live bus data.';
        setBusError(message);
        notify(message, {
          analyticsEvent: 'live_fetch_error',
        });
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    if (selectedBus) {
      load();
    }

    const timer = setInterval(() => {
      if (selectedBus) load();
    }, 7000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [selectedBus, notify]);

  const mapCenter = liveBus?.current_location ?? route?.polyline.points[0] ?? { lat: 28.989, lng: 77.02 };
  const routePath = route?.polyline.points ?? [];
  const markers = useMemo(() => {
    const stopMarkers =
      route?.stops.slice(0, 6).map((stop, idx) => ({
        lat: stop.coordinates.lat,
        lng: stop.coordinates.lng,
        label: `${idx + 1}`,
        isPrimary: stop.stop_id === liveBus?.next_stop_id,
      })) ?? [];

    const busMarker = liveBus
      ? [
          {
            lat: liveBus.current_location.lat,
            lng: liveBus.current_location.lng,
            label: 'BUS',
            isPrimary: true,
          },
        ]
      : [];

    return [...stopMarkers, ...busMarker];
  }, [route, liveBus]);

  const upcomingStops = useMemo(() => {
    if (!route || !liveBus) return [];
    const nextIdx = Math.max(0, route.stops.findIndex((s) => s.stop_id === liveBus.next_stop_id));

    return route.stops.slice(nextIdx, nextIdx + 3).map((stop, idx) => ({
      stop: `${stop.name} / ${stop.city}`,
      eta: `${liveBus.eta_to_next_stop + idx * 6} min`,
    }));
  }, [route, liveBus]);

  return (
    <ScreenShell>
      <View style={[styles.mapWrap, isCompact && styles.mapWrapCompact]}>
        <LeafletMapCard
          height={mapHeight}
          rounded={false}
          animateBus={false}
          center={mapCenter}
          zoom={12}
          markers={markers}
          routePath={routePath}
        />

        <View style={[styles.topRow, isCompact && styles.topRowCompact]}>
          <View style={[styles.titleCard, isCompact && styles.titleCardCompact]}>
            <Text style={[styles.title, isCompact && styles.titleCompact]} numberOfLines={1}>Live Tracking</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {busesLoading
                ? 'Finding available buses...'
                : isLoading
                  ? 'Loading live data...'
                  : busError
                    ? 'Error loading bus'
                    : selectedBus
                      ? `Tracking ${selectedBus.busNumber}`
                      : 'Select a bus'}
            </Text>
          </View>

          <Pressable
            style={styles.iconBtn}
            onPress={() =>
              notify('No new service alerts in your area.', {
                analyticsEvent: 'live_notifications_opened',
              })
            }
          >
            <AppIcon name="bell" size={18} color={appTheme.colors.primaryNavy} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.sheetContent, isCompact && styles.sheetContentCompact]}>
        <BusSelector
          buses={buses}
          selectedBusNumber={selectedBus?.busNumber ?? null}
          onSelectBus={setSelectedBus}
          isLoading={busesLoading}
        />

        {!!busError && <Text style={styles.errorText}>{busError}</Text>}

        <View style={[styles.etaCard, isCompact && styles.etaCardCompact]}>
          <View>
            <Text style={[styles.route, isCompact && styles.routeCompact]}>{liveBus?.route_id || 'Route --'}</Text>
            <Text style={styles.routeSub}>{liveBus?.route_name || 'No active bus selected'}</Text>
          </View>
          <Text style={[styles.eta, isCompact && styles.etaCompact]}>
            ETA {liveBus?.eta_to_next_stop ?? '--'} min
          </Text>
        </View>

        <View style={styles.stopRow}>
          <Text style={styles.stopTitle}>Next Stops / अगले स्टॉप</Text>
          <Text style={styles.liveBadge}>LIVE</Text>
        </View>

        {upcomingStops.map((item) => (
          <View key={item.stop} style={styles.stopItem}>
            <View style={styles.stopBullet} />
            <Text style={styles.stopItemText} numberOfLines={1}>{item.stop}</Text>
            <Text style={styles.stopEta}>{item.eta}</Text>
          </View>
        ))}

        {!upcomingStops.length && <Text style={styles.routeSub}>No upcoming stops yet.</Text>}

        <View style={[styles.actionRow, isCompact && styles.actionRowCompact]}>
          <AppButton
            title="Set Alert / अलर्ट सेट करें"
            variant="secondary"
            style={styles.actionBtn}
            onPress={() =>
              notify('Arrival alert set for Route HR-41A.', {
                analyticsEvent: 'live_arrival_alert_set',
              })
            }
          />
          <AppButton
            title="View Stop / स्टॉप देखें"
            style={styles.actionBtn}
            onPress={() => {
              if (liveBus?.route_id) onRouteSelect?.(liveBus.route_id);
              onTabPress?.('routes');
            }}
          />
        </View>
      </ScrollView>

      <BottomNav activeTab="live" onTabPress={onTabPress} />
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
  topRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  topRowCompact: {
    left: 8,
    right: 8,
    top: 8,
  },
  titleCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.34)',
  },
  titleCardCompact: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: appTheme.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: appTheme.colors.primaryNavy,
    fontSize: 16,
    fontWeight: '700',
  },
  titleCompact: {
    fontSize: 14,
  },
  subtitle: {
    color: appTheme.colors.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  sheetContent: {
    marginTop: -10,
    backgroundColor: appTheme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: appTheme.spacing.lg,
    paddingTop: appTheme.spacing.lg,
    paddingBottom: appTheme.spacing.xl,
    gap: appTheme.spacing.md,
  },
  sheetContentCompact: {
    paddingHorizontal: appTheme.spacing.md,
    paddingTop: appTheme.spacing.md,
  },
  etaCard: {
    borderRadius: appTheme.radii.lg,
    backgroundColor: '#F1F8F1',
    padding: appTheme.spacing.md,
    borderWidth: 1,
    borderColor: '#D4E8D5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  etaCardCompact: {
    padding: appTheme.spacing.sm,
  },
  route: {
    color: appTheme.colors.primaryNavy,
    fontSize: 17,
    fontWeight: '700',
  },
  routeCompact: {
    fontSize: 15,
  },
  routeSub: {
    color: appTheme.colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  errorText: {
    color: appTheme.colors.errorRed,
    fontSize: 13,
    fontWeight: '500',
  },
  eta: {
    color: '#2E7D32',
    fontSize: 20,
    fontWeight: '700',
  },
  etaCompact: {
    fontSize: 17,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stopTitle: {
    color: appTheme.colors.primaryNavy,
    fontSize: 15,
    fontWeight: '600',
  },
  liveBadge: {
    backgroundColor: '#DFF4E0',
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '700',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    minHeight: 48,
    gap: 8,
  },
  stopBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: appTheme.colors.primaryNavy,
  },
  stopItemText: {
    flex: 1,
    color: appTheme.colors.textCharcoal,
    fontSize: 14,
  },
  stopEta: {
    color: appTheme.colors.primaryNavy,
    fontSize: 14,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  actionRowCompact: {
    flexDirection: 'column',
  },
  actionBtn: {
    flex: 1,
  },
});

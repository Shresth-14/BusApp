import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, SafeAreaView, Dimensions } from 'react-native';
import { BottomTabKey } from '../types/ui';
import { appTheme } from '../theme';
import { AppIcon } from '../components/primitives';
import { LeafletMapCard } from '../components/sections';
import { useAppFeedback } from '../feedback/useAppFeedback';
import { getAllRoutes, getLiveBus, getRouteDetails } from '../api/haryanaApi';
import { BackendLiveBus, BackendRouteDetails } from '../types/backend';

type LiveTrackingScreenProps = {
  onTabPress?: (tab: BottomTabKey) => void;
  routeId?: string;
  onRouteSelect?: (routeId: string) => void;
  onGoBack?: () => void;
};

export function LiveTrackingScreen({
  onTabPress,
  routeId,
  onRouteSelect,
  onGoBack,
}: LiveTrackingScreenProps) {
  const { notify } = useAppFeedback();
  const [busNumber, setBusNumber] = useState<string | null>(null);
  const [liveBus, setLiveBus] = useState<BackendLiveBus | null>(null);
  const [route, setRoute] = useState<BackendRouteDetails | null>(null);
  const [isBusLoading, setIsBusLoading] = useState(true);
  const [busError, setBusError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const resolveBusNumber = async () => {
      try {
        setIsBusLoading(true);
        setBusError(null);

        const routes = await getAllRoutes();
        if (!mounted) return;

        if (!routes.length) {
          setBusNumber(null);
          setBusError('No buses available.');
          return;
        }

        const preferredRoute = routeId ? routes.find((r) => r.route_id === routeId) : routes[0];
        const firstRouteWithBus = routes.find((r) => r.buses?.length);
        const selectedRoute = preferredRoute?.buses?.length ? preferredRoute : firstRouteWithBus;
        const resolvedBus = selectedRoute?.buses?.[0]?.busNumber;

        if (!resolvedBus) {
          setBusNumber(null);
          setBusError('No buses available.');
          return;
        }

        setBusNumber(resolvedBus);
        if (selectedRoute?.route_id) {
          onRouteSelect?.(selectedRoute.route_id);
        }
      } catch (error) {
        if (!mounted) return;
        const message = error instanceof Error ? error.message : 'Unable to load routes.';
        setBusNumber(null);
        setBusError(message);
      } finally {
        if (mounted) setIsBusLoading(false);
      }
    };

    resolveBusNumber();

    return () => {
      mounted = false;
    };
  }, [routeId, onRouteSelect]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!busNumber) {
        if (mounted) {
          setLiveBus(null);
          setRoute(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        const live = await getLiveBus(busNumber);
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

    if (busNumber) {
      load();
    }

    const timer = setInterval(() => {
      if (busNumber) load();
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [busNumber, notify]);

  const mapCenter = liveBus?.current_location ?? route?.polyline.points[0] ?? { lat: 28.989, lng: 77.02 };
  const routePath = route?.polyline.points ?? [];
  const tripFare = Math.max(20, Math.round((route?.distance_km ?? 0) * 4.5));
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

  const mapHeight = Dimensions.get('window').height;

  return (
    <SafeAreaView style={styles.container}>
      {/* Full-screen map */}
      <View style={styles.mapContainer}>
        <LeafletMapCard
          height={Math.round(mapHeight)}
          rounded={false}
          animateBus={false}
          center={mapCenter}
          zoom={13}
          markers={markers}
          routePath={routePath}
        />
      </View>

      {/* Back button - top left */}
      <Pressable style={styles.backBtn} onPress={onGoBack}>
        <AppIcon name="back" size={24} color={appTheme.colors.primaryNavy} />
      </Pressable>

      {/* Floating info card - bottom */}
      {liveBus && (
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View>
              <Text style={styles.busNumber}>{busNumber}</Text>
              <Text style={styles.routeInfo}>{route?.route_name || liveBus.route_name || 'Active route'}</Text>
            </View>
            <View style={styles.etaContainer}>
              <Text style={styles.etaLabel}>ETA</Text>
              <Text style={styles.eta}>{liveBus.eta_to_next_stop}m</Text>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Trip time</Text>
              <Text style={styles.metricValue}>{route?.estimated_time_minutes ?? '--'} min</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Fare</Text>
              <Text style={styles.metricValue}>₹{tripFare}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Occupancy</Text>
              <Text style={styles.metricValue}>{liveBus.occupancy}</Text>
            </View>
          </View>
          
          <View style={styles.infoFooter}>
            <View style={styles.nextStopContainer}>
              <Text style={styles.nextStopLabel}>Next bus arrives in</Text>
              <Text style={styles.nextStopEta}>{liveBus.eta_to_next_stop} min</Text>
              <Text style={styles.nextStopLabel}>Next Stop</Text>
              <Text style={styles.nextStop} numberOfLines={1}>
                {liveBus.next_stop?.name || 'Coming soon'}
              </Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>{liveBus.status}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Loading state */}
      {!liveBus && busError && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{busError}</Text>
        </View>
      )}

      {/* Loading indicator */}
      {isBusLoading && !liveBus && (
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>Finding buses...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  infoCard: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  busNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: appTheme.colors.primaryNavy,
    marginBottom: 4,
  },
  routeInfo: {
    fontSize: 13,
    color: appTheme.colors.textMuted,
    fontWeight: '500',
  },
  etaContainer: {
    alignItems: 'flex-end',
  },
  etaLabel: {
    fontSize: 11,
    color: appTheme.colors.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  eta: {
    fontSize: 20,
    fontWeight: '700',
    color: appTheme.colors.statusOnline,
  },
  infoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    gap: 12,
  },
  nextStopContainer: {
    flex: 1,
  },
  nextStopLabel: {
    fontSize: 11,
    color: appTheme.colors.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  nextStopEta: {
    fontSize: 17,
    color: appTheme.colors.statusOnline,
    fontWeight: '800',
    marginBottom: 8,
  },
  nextStop: {
    fontSize: 14,
    fontWeight: '600',
    color: appTheme.colors.primaryNavy,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#F7FBF8',
    borderWidth: 1,
    borderColor: '#E3EEE7',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  metricLabel: {
    fontSize: 11,
    color: appTheme.colors.textMuted,
    fontWeight: '600',
  },
  metricValue: {
    marginTop: 4,
    fontSize: 13,
    color: appTheme.colors.primaryNavy,
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#E6F4EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPillText: {
    color: '#2C7D5B',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  errorCard: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: appTheme.colors.errorRed,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  loadingCard: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: appTheme.colors.accentTeal,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    fontSize: 13,
    color: appTheme.colors.primaryNavy,
    fontWeight: '500',
  },
});

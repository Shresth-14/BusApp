import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabKey } from '../types/ui';
import { appTheme } from '../theme';
import { AppIcon, BottomNav, ScreenShell } from '../components/primitives';
import { LeafletMapCard } from '../components/sections';
import { useAppFeedback } from '../feedback/useAppFeedback';
import { useDeviceClass } from '../utils/device';
import { getAllRoutes, getRouteDetails } from '../api/haryanaApi';
import { BackendRouteDetails, BackendRouteSummary } from '../types/backend';

type RouteDetailsScreenProps = {
  onTabPress?: (tab: BottomTabKey) => void;
  routeId?: string;
  onRouteSelect?: (routeId: string) => void;
};

type ArrivalItem = {
  id: string;
  line: string;
  color: string;
  name: string;
  platform: string;
  eta: string;
};

export function RouteDetailsScreen({
  onTabPress,
  routeId = 'HRY-RTE-001',
  onRouteSelect,
}: RouteDetailsScreenProps) {
  const { notify } = useAppFeedback();
  const { height, isCompact, isSE, isPlusMax } = useDeviceClass();
  const [route, setRoute] = useState<BackendRouteDetails | null>(null);
  const [allRoutes, setAllRoutes] = useState<BackendRouteSummary[]>([]);
  const [showAllRoutes, setShowAllRoutes] = useState(false);
  const [routeQuery, setRouteQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('C');
  const mapRatio = isSE ? 0.29 : isCompact ? 0.31 : isPlusMax ? 0.37 : 0.34;
  const mapHeight = Math.max(200, Math.min(320, Math.round(height * mapRatio)));

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        const details = await getRouteDetails(routeId);
        if (!mounted) return;
        setRoute(details);
        setSelectedPlatform(details.stops[0]?.platforms?.[0] || 'A');
      } catch (error) {
        if (!mounted) return;
        const message = error instanceof Error ? error.message : 'Unable to load route details.';
        notify(message, {
          analyticsEvent: 'route_details_error',
        });
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [routeId, notify]);

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

  const arrivals = useMemo<ArrivalItem[]>(
    () =>
      (route?.stops || []).slice(0, 5).map((stop, index) => ({
        id: stop.stop_id,
        line: route?.route_id.replace('HRY-RTE-', '') || 'HRY',
        color: ['#92A93B', '#2C8DB7', '#C9513D', '#7183C2', '#46A97A'][index % 5],
        name: `${stop.name} / ${stop.city}`,
        platform: stop.platforms[0] || selectedPlatform,
        eta: `${Math.max(2, stop.estimated_arrival_from_start_minutes)} min`,
      })),
    [route, selectedPlatform]
  );

  const mapCenter = route?.polyline.points[0] ?? { lat: 28.99, lng: 77.02 };
  const mapPath = route?.polyline.points ?? [];
  const mapMarkers = (route?.stops || []).slice(0, 6).map((stop, index) => ({
    lat: stop.coordinates.lat,
    lng: stop.coordinates.lng,
    label: stop.platforms[0] || `${index + 1}`,
    isPrimary: index === 0,
  }));

  const filteredRoutes = useMemo(() => {
    const query = routeQuery.trim().toLowerCase();
    if (!query) return allRoutes;

    return allRoutes.filter((item) => {
      const id = item.route_id.toLowerCase();
      const name = item.route_name.toLowerCase();
      return id.includes(query) || name.includes(query);
    });
  }, [allRoutes, routeQuery]);

  return (
    <ScreenShell>
      <View style={[styles.mapWrap, isCompact && styles.mapWrapCompact]}>
        <LeafletMapCard
          height={mapHeight}
          rounded={false}
          center={mapCenter}
          zoom={13}
          markers={mapMarkers}
          routePath={mapPath}
        />

        <View style={styles.topActions}>
          <Pressable style={styles.backBtn} onPress={() => onTabPress?.('tickets')}>
            <AppIcon name="back" size={20} color={appTheme.colors.primaryNavy} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <Pressable
            style={styles.circleBtn}
            onPress={() =>
              notify('Stop saved to favorites.', {
                analyticsEvent: 'route_stop_favorited',
              })
            }
          >
            <MaterialCommunityIcons name="heart-outline" size={18} color={appTheme.colors.primaryNavy} />
          </Pressable>
        </View>
      </View>

      <View style={styles.panelWrap}>
        <ScrollView contentContainerStyle={[styles.panelContent, isCompact && styles.panelContentCompact]}>
          <View style={styles.routeSwitchCard}>
            <View style={styles.routeSwitchHead}>
              <Text style={styles.routeSwitchTitle}>Switch Route / रूट बदलें</Text>
              <Pressable style={styles.routeSwitchBtn} onPress={() => setShowAllRoutes((prev) => !prev)}>
                <Text style={styles.routeSwitchBtnText}>{showAllRoutes ? 'Hide' : 'Browse all'}</Text>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.routeChipRow}
            >
              {filteredRoutes.map((item) => {
                const active = item.route_id === routeId;

                return (
                  <Pressable
                    key={item.route_id}
                    style={[styles.routeChip, active && styles.routeChipActive]}
                    onPress={() => onRouteSelect?.(item.route_id)}
                  >
                    <Text style={[styles.routeChipCode, active && styles.routeChipCodeActive]}>{item.route_id}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {showAllRoutes && (
              <View style={styles.routeListWrap}>
                <View style={styles.routeSearchWrap}>
                  <MaterialCommunityIcons name="magnify" size={16} color={appTheme.colors.textMuted} />
                  <TextInput
                    value={routeQuery}
                    onChangeText={setRouteQuery}
                    placeholder="Filter by route id or city"
                    placeholderTextColor={appTheme.colors.textMuted}
                    style={styles.routeSearchInput}
                  />
                </View>

                <ScrollView nestedScrollEnabled style={styles.routeListScroll}>
                  {filteredRoutes.map((item) => (
                    <Pressable
                      key={`list-${item.route_id}`}
                      style={[styles.routeListItem, item.route_id === routeId && styles.routeListItemActive]}
                      onPress={() => {
                        onRouteSelect?.(item.route_id);
                        setShowAllRoutes(false);
                      }}
                    >
                      <View style={styles.routeListHeader}>
                        <Text style={styles.routeListCode}>{item.route_id}</Text>
                        <Text style={styles.routeListMeta}>{item.estimated_time_minutes} min</Text>
                      </View>
                      <Text style={styles.routeListName} numberOfLines={1}>{item.route_name}</Text>
                    </Pressable>
                  ))}

                  {!filteredRoutes.length && (
                    <View style={styles.routeListEmpty}>
                      <Text style={styles.routeListEmptyText}>No routes match your search.</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.stationRow}>
            <View style={styles.stationLeft}>
              <MaterialCommunityIcons name="flag-outline" size={20} color={appTheme.colors.primaryNavy} />
              <Text style={[styles.stationName, isCompact && styles.stationNameCompact]} numberOfLines={1}>
                {isLoading ? 'Loading route...' : route?.stops[0]?.name || 'Route stop'}
              </Text>
            </View>

            <Pressable
              style={styles.favoriteBtn}
              onPress={() =>
                notify('Sonipat Bus Stand saved as favorite.', {
                  analyticsEvent: 'route_station_favorite',
                })
              }
            >
              <MaterialCommunityIcons name="heart" size={16} color="#F0527B" />
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>Select platform / प्लेटफॉर्म चुनें</Text>

          <View style={styles.platformRow}>
            {(route?.stops[0]?.platforms?.length ? route.stops[0].platforms : ['A', 'B', 'C', 'D']).map((platform) => {
              const selected = platform === selectedPlatform;

              return (
                <Pressable
                  key={platform}
                  style={[styles.platformChip, selected && styles.platformChipActive]}
                  onPress={() => setSelectedPlatform(platform)}
                >
                  <Text style={[styles.platformText, selected && styles.platformTextActive]}>{platform}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.arrivalsList}>
            {arrivals.map((item) => (
              <View key={item.id} style={styles.arrivalRow}>
                <View style={styles.arrivalLeft}>
                  <MaterialCommunityIcons
                    name="bus-stop"
                    size={18}
                    color={appTheme.colors.textMuted}
                    style={styles.busIcon}
                  />

                  <View style={[styles.lineBadge, { backgroundColor: item.color }]}>
                    <Text style={styles.lineBadgeText}>{item.line}</Text>
                  </View>

                  <View style={styles.arrivalTextWrap}>
                    <Text style={[styles.arrivalName, isCompact && styles.arrivalNameCompact]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.arrivalMeta} numberOfLines={1}>
                      Platform {item.platform} · Accessible / सुलभ
                    </Text>
                  </View>
                </View>

                <Text style={[item.eta === '<1 min' ? styles.etaSoon : styles.eta, isCompact && styles.etaCompact]}>
                  {item.eta}
                </Text>
              </View>
            ))}

            {!arrivals.length && (
              <View style={styles.arrivalRow}>
                <Text style={styles.arrivalMeta}>No stop timing data available.</Text>
              </View>
            )}
          </View>
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
  routeSwitchCard: {
    borderWidth: 1,
    borderColor: '#DDE9E4',
    backgroundColor: '#F7FBF8',
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
  },
  routeSwitchHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  routeSwitchTitle: {
    color: appTheme.colors.primaryNavy,
    fontSize: 13,
    fontWeight: '700',
  },
  routeSwitchBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C9DCD4',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  routeSwitchBtnText: {
    color: '#2C7D5B',
    fontSize: 12,
    fontWeight: '700',
  },
  routeChipRow: {
    gap: 8,
    paddingRight: 10,
  },
  routeChip: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CFE0D8',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  routeChipActive: {
    borderColor: '#2C7D5B',
    backgroundColor: '#E6F4EE',
  },
  routeChipCode: {
    color: appTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  routeChipCodeActive: {
    color: '#1B5E20',
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
    maxHeight: 170,
  },
  routeListItem: {
    borderWidth: 1,
    borderColor: '#D7E6DF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: 7,
  },
  routeListItemActive: {
    borderColor: '#8FC0AB',
    backgroundColor: '#EFF8F4',
  },
  routeListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeListCode: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '700',
  },
  routeListMeta: {
    color: appTheme.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  routeListName: {
    marginTop: 2,
    color: appTheme.colors.primaryNavy,
    fontSize: 13,
    fontWeight: '600',
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

import React, { useEffect, useState, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BottomTabKey } from '../types/ui';
import { appTheme } from '../theme';
import { AppButton, AppIcon, BottomNav, Card, ScreenShell } from '../components/primitives';
import { useAppFeedback } from '../feedback/useAppFeedback';
import { useDeviceClass } from '../utils/device';
import { getAllRoutes, searchRoutes, searchStops, StopSuggestion } from '../api/haryanaApi';
import { BackendRouteSummary } from '../types/backend';

type TripPlannerScreenProps = {
  onTabPress?: (tab: BottomTabKey) => void;
  initialSource?: string;
  initialDestination?: string;
  onRouteSelect?: (routeId: string, source: string, destination: string) => void;
};

export function TripPlannerScreen({
  onTabPress,
  initialSource = 'Sonipat',
  initialDestination = 'Delhi',
  onRouteSelect,
}: TripPlannerScreenProps) {
  const { notify } = useAppFeedback();
  const { isCompact } = useDeviceClass();
  const [source, setSource] = useState(initialSource);
  const [destination, setDestination] = useState(initialDestination);
  const [isSearching, setIsSearching] = useState(false);
  const [routes, setRoutes] = useState<BackendRouteSummary[]>([]);
  const [isRoutesLoading, setIsRoutesLoading] = useState(true);
  const [sourceSuggestions, setSourceSuggestions] = useState<StopSuggestion[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<StopSuggestion[]>([]);
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);

  useEffect(() => {
    setSource(initialSource);
    setDestination(initialDestination);
  }, [initialSource, initialDestination]);

  // Fetch source suggestions
  useEffect(() => {
    if (!source.trim() || source.length < 2) {
      setSourceSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const suggestions = await searchStops(source);
        setSourceSuggestions(suggestions);
      } catch (error) {
        console.error('Failed to fetch source suggestions:', error);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [source]);

  // Fetch destination suggestions
  useEffect(() => {
    if (!destination.trim() || destination.length < 2) {
      setDestSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const suggestions = await searchStops(destination);
        setDestSuggestions(suggestions);
      } catch (error) {
        console.error('Failed to fetch destination suggestions:', error);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [destination]);

  useEffect(() => {
    let mounted = true;

    const loadRoutes = async () => {
      try {
        const allRoutes = await getAllRoutes();
        if (!mounted) return;
        setRoutes(allRoutes);
      } catch (error) {
        if (!mounted) return;
        const message = error instanceof Error ? error.message : 'Unable to load Haryana routes.';
        notify(message, {
          analyticsEvent: 'planner_routes_load_error',
        });
      } finally {
        if (mounted) setIsRoutesLoading(false);
      }
    };

    loadRoutes();

    return () => {
      mounted = false;
    };
  }, [notify]);

  const runSearch = async () => {
    if (!source.trim() || !destination.trim()) {
      notify('Please enter both source and destination.', {
        analyticsEvent: 'planner_validation_error',
      });
      return;
    }

    try {
      setIsSearching(true);
      const result = await searchRoutes(source.trim(), destination.trim());
      const best = result.suggestions[0];

      if (!best || !best.route_ids.length) {
        notify('No routes found for this journey.', {
          analyticsEvent: 'planner_no_routes',
        });
        return;
      }

      onRouteSelect?.(best.route_ids[0], source.trim(), destination.trim());
      notify(`Best route found: ${best.route_ids[0]}`, {
        analyticsEvent: 'planner_search_success',
        haptic: 'tap',
      });
      onTabPress?.('routes');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to fetch routes.';
      notify(message, {
        analyticsEvent: 'planner_search_error',
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <ScreenShell>
      <View style={styles.pageWrap}>
      <View style={[styles.headerWrap, isCompact && styles.headerWrapCompact]}>
        <View style={styles.headerSurface}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTextBlock}>
              <Text style={styles.headerKicker}>HARYANAGO PLANNER</Text>
              <Text style={[styles.headerTitle, isCompact && styles.headerTitleCompact]}>Search & Navigation</Text>
              <Text style={styles.headerSubtitle}>खोजें और नेविगेट करें</Text>
            </View>

            <Pressable
              style={styles.headerHomeBtn}
              onPress={() => onTabPress?.('tickets')}
            >
              <AppIcon name="home" size={18} color={appTheme.colors.primaryNavy} />
            </Pressable>
          </View>

          <View style={styles.headerMetaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>Routes {isRoutesLoading ? '...' : routes.length}</Text>
            </View>
            <View style={styles.metaPillSoft}>
              <Text style={styles.metaPillSoftText}>Haryana Roadways</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.searchCard}>
          <Text style={styles.searchLabel}>From / कहाँ से</Text>
          <View style={styles.searchInputWrap}>
            <AppIcon name="home" size={16} color={appTheme.colors.textMuted} />
            <TextInput
              value={source}
              onChangeText={setSource}
              onFocus={() => setShowSourceSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSourceSuggestions(false), 100)}
              placeholder="Enter source city"
              placeholderTextColor={appTheme.colors.textMuted}
              style={styles.searchInput}
            />
          </View>
          {showSourceSuggestions && source.trim().length > 0 && sourceSuggestions.length > 0 && (
            <View style={styles.suggestionsDropdown}>
              {sourceSuggestions.map((suggestion, idx) => (
                <Pressable
                  key={`${suggestion.text}-${idx}`}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setSource(suggestion.text);
                    setShowSourceSuggestions(false);
                  }}
                >
                  <AppIcon
                    name={suggestion.type === 'city' ? 'map-marker' : 'bus'}
                    size={14}
                    color={appTheme.colors.textMuted}
                  />
                  <View style={styles.suggestionContent}>
                    <Text style={styles.suggestionText}>{suggestion.text}</Text>
                    {suggestion.type === 'stop' && suggestion.city && (
                      <Text style={styles.suggestionCity}>{suggestion.city}</Text>
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          <Text style={styles.searchLabel}>To / कहाँ तक</Text>
          <View style={styles.searchInputWrap}>
            <AppIcon name="routes" size={16} color={appTheme.colors.textMuted} />
            <TextInput
              value={destination}
              onChangeText={setDestination}
              onFocus={() => setShowDestSuggestions(true)}
              onBlur={() => setTimeout(() => setShowDestSuggestions(false), 100)}
              placeholder="Enter destination city"
              placeholderTextColor={appTheme.colors.textMuted}
              style={styles.searchInput}
            />
          </View>
          {showDestSuggestions && destination.trim().length > 0 && destSuggestions.length > 0 && (
            <View style={styles.suggestionsDropdown}>
              {destSuggestions.map((suggestion, idx) => (
                <Pressable
                  key={`${suggestion.text}-${idx}`}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setDestination(suggestion.text);
                    setShowDestSuggestions(false);
                  }}
                >
                  <AppIcon
                    name={suggestion.type === 'city' ? 'map-marker' : 'bus'}
                    size={14}
                    color={appTheme.colors.textMuted}
                  />
                  <View style={styles.suggestionContent}>
                    <Text style={styles.suggestionText}>{suggestion.text}</Text>
                    {suggestion.type === 'stop' && suggestion.city && (
                      <Text style={styles.suggestionCity}>{suggestion.city}</Text>
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          <AppButton
            title="Select on map / मैप पर चुनें"
            variant="secondary"
            onPress={() => notify('Map selection enabled.', { analyticsEvent: 'search_select_on_map' })}
          />
        </Card>

        <View style={styles.quickTitleRow}>
          <Text style={styles.quickTitle}>Quick Access / त्वरित पहुँच</Text>
        </View>

        <View style={[styles.quickGrid, isCompact && styles.quickGridCompact]}>
          {[
            {
              key: 'snp_dlh',
              en: 'Sonipat -> Delhi',
              hi: 'सोनीपत से दिल्ली',
              sub: 'HRY-RTE-001',
              source: 'Sonipat',
              destination: 'Delhi',
            },
            {
              key: 'pnp_kkr',
              en: 'Panipat -> Kurukshetra',
              hi: 'पानीपत से कुरुक्षेत्र',
              sub: 'HRY-RTE-002',
              source: 'Panipat',
              destination: 'Kurukshetra',
            },
            {
              key: 'rtk_dlh',
              en: 'Rohtak -> Delhi',
              hi: 'रोहतक से दिल्ली',
              sub: 'HRY-RTE-003',
              source: 'Rohtak',
              destination: 'Delhi',
            },
            {
              key: 'fbd_dlh',
              en: 'Faridabad -> Delhi',
              hi: 'फरीदाबाद से दिल्ली',
              sub: 'HRY-RTE-006',
              source: 'Faridabad',
              destination: 'Delhi',
            },
            {
              key: 'srs_rtk',
              en: 'Sirsa -> Rohtak',
              hi: 'सिरसा से रोहतक',
              sub: 'HRY-RTE-009',
              source: 'Sirsa',
              destination: 'Rohtak',
            },
            {
              key: 'nnl_ggn',
              en: 'Narnaul -> Gurugram',
              hi: 'नारनौल से गुरुग्राम',
              sub: 'HRY-RTE-012',
              source: 'Narnaul',
              destination: 'Gurugram',
            },
          ].map((item) => (
            <Pressable
              key={item.key}
              style={[styles.quickItem, isCompact && styles.quickItemCompact]}
              onPress={() => {
                setSource(item.source);
                setDestination(item.destination);
                notify(`${item.en} selected.`, { analyticsEvent: `search_quick_${item.key}` });
              }}
            >
              <Text style={styles.quickName}>{item.en}</Text>
              <Text style={styles.quickHindi}>{item.hi}</Text>
              <Text style={styles.quickSub}>{item.sub}</Text>
            </Pressable>
          ))}
        </View>

        <Card style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Ready to navigate? / यात्रा शुरू करें</Text>
          <Text style={styles.ctaSub}>We will suggest Haryana Roadways routes with ETA and platform details.</Text>
          <AppButton
            title={isSearching ? 'Searching... / खोज रहे हैं...' : 'Search Routes / रूट खोजें'}
            onPress={runSearch}
          />
        </Card>

        <Card style={styles.routesCard}>
          <View style={styles.routesHeadRow}>
            <Text style={styles.ctaTitle}>All Haryana Routes / सभी रूट</Text>
            {!isRoutesLoading && <Text style={styles.routesCount}>{routes.length}</Text>}
          </View>
          <Text style={styles.routesSub}>
            {isRoutesLoading ? 'Loading routes...' : `${routes.length} routes available`}
          </Text>

          <View style={styles.routeListWrap}>
            <ScrollView nestedScrollEnabled style={styles.routeListScroll}>
              {routes.map((route) => {
                const [fromRaw, toRaw] = route.route_name.split('->').map((part) => part.trim());
                const from = fromRaw || 'Source';
                const to = toRaw || 'Destination';

                return (
                  <Pressable
                    key={route.route_id}
                    style={styles.routeItem}
                    onPress={() => {
                      if (fromRaw) setSource(fromRaw);
                      if (toRaw) setDestination(toRaw);
                      onRouteSelect?.(route.route_id, fromRaw || source, toRaw || destination);
                      notify(`Selected ${route.route_name}`, { analyticsEvent: `route_pick_${route.route_id}` });
                      onTabPress?.('routes');
                    }}
                  >
                    <View style={styles.routeItemHeader}>
                      <Text style={styles.routeItemCode}>{route.route_id}</Text>
                      <Text style={styles.routeItemMeta}>{route.estimated_time_minutes} min</Text>
                    </View>
                    <View style={styles.routeCityRow}>
                      <Text style={styles.routeCity}>{from}</Text>
                      <Text style={styles.routeArrow}>{'->'}</Text>
                      <Text style={styles.routeCity}>{to}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Card>
      </ScrollView>
      </View>

      <BottomNav activeTab="tickets" onTabPress={onTabPress} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  pageWrap: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerWrap: {
    paddingHorizontal: appTheme.spacing.md,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerWrapCompact: {
    paddingTop: 6,
    paddingBottom: 2,
  },
  headerSurface: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCE6EF',
    backgroundColor: '#FFFFFF',
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
    color: '#0F8B8D',
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
    borderColor: '#DCE6EF',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMetaRow: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaPill: {
    borderRadius: 999,
    backgroundColor: '#0F8B8D',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  metaPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  metaPillSoft: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#DCE6EF',
    backgroundColor: '#F6FAFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  metaPillSoftText: {
    color: '#0F8B8D',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    padding: appTheme.spacing.md,
    gap: appTheme.spacing.md,
    paddingBottom: 96,
  },
  searchCard: {
    gap: appTheme.spacing.sm,
    borderWidth: 1,
    borderColor: '#DCE6EF',
    borderRadius: 16,
  },
  searchLabel: {
    ...appTheme.typography.caption,
    color: appTheme.colors.textMuted,
  },
  searchInputWrap: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: appTheme.colors.borderSubtle,
    backgroundColor: '#F5F8F5',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: appTheme.colors.textCharcoal,
    fontSize: 14,
  },
  quickTitleRow: {
    marginTop: 2,
  },
  quickTitle: {
    color: appTheme.colors.primaryNavy,
    fontSize: 15,
    fontWeight: '600',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickGridCompact: {
    gap: 8,
  },
  quickItem: {
    flexBasis: '48%',
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderColor: '#DCE6EF',
    shadowColor: '#10213A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  quickItemCompact: {
    flexBasis: '100%',
  },
  quickName: {
    color: appTheme.colors.primaryNavy,
    fontSize: 14,
    fontWeight: '700',
  },
  quickHindi: {
    color: appTheme.colors.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  quickSub: {
    color: '#0F8B8D',
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
  },
  ctaCard: {
    gap: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#DCE6EF',
    borderRadius: 16,
  },
  routesCard: {
    gap: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DCE6EF',
    borderRadius: 16,
  },
  routesHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routesCount: {
    minWidth: 28,
    textAlign: 'center',
    backgroundColor: '#EAF8F8',
    color: '#0F8B8D',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 12,
    fontWeight: '700',
  },
  routesSub: {
    color: appTheme.colors.textMuted,
    fontSize: 12,
    marginBottom: 2,
  },
  routeListWrap: {
    borderTopWidth: 1,
    borderTopColor: '#E3EDF5',
    paddingTop: 8,
  },
  routeListScroll: {
    maxHeight: 260,
  },
  routeItem: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE6EF',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  routeItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeItemCode: {
    color: '#0F8B8D',
    fontSize: 12,
    fontWeight: '700',
  },
  routeItemMeta: {
    color: appTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  routeCityRow: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeCity: {
    color: appTheme.colors.primaryNavy,
    fontSize: 13,
    fontWeight: '600',
  },
  routeArrow: {
    color: '#0F8B8D',
    fontSize: 12,
    fontWeight: '700',
  },
  ctaTitle: {
    color: appTheme.colors.primaryNavy,
    fontSize: 15,
    fontWeight: '700',
  },
  ctaSub: {
    color: appTheme.colors.textMuted,
    fontSize: 13,
    marginBottom: 4,
  },
  suggestionsDropdown: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.borderSubtle,
    backgroundColor: '#FFFFFF',
    marginTop: 4,
    overflow: 'hidden',
    ...appTheme.elevation.card,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 10,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionText: {
    color: appTheme.colors.textCharcoal,
    fontSize: 13,
    fontWeight: '500',
  },
  suggestionCity: {
    color: appTheme.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});

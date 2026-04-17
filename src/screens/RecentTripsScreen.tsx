import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomTabKey } from '../types/ui';
import { appTheme } from '../theme';
import { AppButton, AppIcon, BottomNav, Card, ScreenShell } from '../components/primitives';
import { useAppFeedback } from '../feedback/useAppFeedback';
import { useDeviceClass } from '../utils/device';
import { getJourneyHistory } from '../api/haryanaApi';
import { BackendJourney } from '../types/backend';

type RecentTripsScreenProps = {
  onTabPress?: (tab: BottomTabKey) => void;
  onRouteSelect?: (routeId: string) => void;
};

export function RecentTripsScreen({ onTabPress, onRouteSelect }: RecentTripsScreenProps) {
  const { notify } = useAppFeedback();
  const { isCompact } = useDeviceClass();
  const [journeys, setJourneys] = useState<BackendJourney[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadJourneys = async () => {
      try {
        const history = await getJourneyHistory(8);
        if (!mounted) return;
        setJourneys(history);
      } catch (error) {
        if (!mounted) return;
        const message = error instanceof Error ? error.message : 'Unable to load journey history.';
        notify(message, {
          analyticsEvent: 'journey_history_error',
        });
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadJourneys();

    return () => {
      mounted = false;
    };
  }, [notify]);

  const completedTrips = journeys.filter((journey) => journey.status === 'completed');
  const inProgressTrips = journeys.filter((journey) => journey.status === 'in-progress');
  const avgFare = journeys.length
    ? Math.round(journeys.reduce((sum, journey) => sum + journey.fare_inr, 0) / journeys.length)
    : 0;

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={[styles.content, isCompact && styles.contentCompact]}>
        <View style={styles.headerSurface}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTextBlock}>
              <Text style={styles.headerKicker}>HARYANAGO</Text>
              <Text style={[styles.headerTitle, isCompact && styles.headerTitleCompact]}>Recent Trips</Text>
              <Text style={styles.headerSubtitle}>Your saved and recent journeys in one place</Text>
            </View>
            <Pressable style={styles.headerHomeBtn} onPress={() => onTabPress?.('routes')}>
              <AppIcon name="routes" size={18} color={appTheme.colors.primaryNavy} />
            </Pressable>
          </View>

          <View style={styles.headerStatsRow}>
            <View style={styles.statPill}>
              <Text style={styles.statPillLabel}>Trips</Text>
              <Text style={styles.statPillValue}>{journeys.length}</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statPillLabel}>Active</Text>
              <Text style={styles.statPillValue}>{inProgressTrips.length}</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statPillLabel}>Avg Fare</Text>
              <Text style={styles.statPillValue}>₹{avgFare}</Text>
            </View>
          </View>
        </View>

        <Card style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle}>Pick up where you left off</Text>
              <Text style={styles.heroSubtitle}>Tap any recent journey to open its route and map.</Text>
            </View>
            <View style={styles.heroIconWrap}>
              <AppIcon name="tickets" size={20} color={appTheme.colors.primaryNavy} />
            </View>
          </View>
          <AppButton
            title="Browse Routes"
            variant="secondary"
            onPress={() => onTabPress?.('routes')}
            style={styles.heroBtn}
          />
        </Card>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <Text style={styles.sectionMeta}>{isLoading ? 'Loading...' : `${completedTrips.length} completed`}</Text>
        </View>

        {journeys.map((journey) => {
          const statusLabel = journey.status === 'in-progress' ? 'Live trip' : journey.status === 'completed' ? 'Completed' : 'Cancelled';

          return (
            <Pressable
              key={journey.journey_id}
              style={styles.tripCard}
              onPress={() => {
                onRouteSelect?.(journey.route_id);
                onTabPress?.('routes');
              }}
            >
              <View style={styles.tripTopRow}>
                <View style={styles.tripTitleWrap}>
                  <Text style={styles.tripRoute} numberOfLines={1}>{journey.route_name}</Text>
                  <Text style={styles.tripMeta}>{journey.route_id} · Bus {journey.bus_id}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{statusLabel}</Text>
                </View>
              </View>

              <View style={styles.tripGrid}>
                <View style={styles.tripMetric}>
                  <Text style={styles.tripMetricLabel}>Duration</Text>
                  <Text style={styles.tripMetricValue}>{journey.duration_minutes} min</Text>
                </View>
                <View style={styles.tripMetric}>
                  <Text style={styles.tripMetricLabel}>Fare</Text>
                  <Text style={styles.tripMetricValue}>₹{journey.fare_inr}</Text>
                </View>
                <View style={styles.tripMetric}>
                  <Text style={styles.tripMetricLabel}>Payment</Text>
                  <Text style={styles.tripMetricValue}>{journey.payment_mode}</Text>
                </View>
              </View>

              <Text style={styles.tripStops} numberOfLines={1}>
                {journey.source_stop?.name || 'Start'} → {journey.destination_stop?.name || 'End'}
              </Text>
            </Pressable>
          );
        })}

        {!journeys.length && !isLoading && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No journeys yet</Text>
            <Text style={styles.emptyText}>Your recent trips will appear here after you start riding.</Text>
          </Card>
        )}
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
    borderColor: '#CFE3D8',
    backgroundColor: '#EEF8F2',
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
  },
  headerKicker: {
    color: appTheme.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerTitle: {
    marginTop: 2,
    color: appTheme.colors.primaryNavy,
    fontSize: 24,
    fontWeight: '800',
  },
  headerTitleCompact: {
    fontSize: 21,
  },
  headerSubtitle: {
    marginTop: 3,
    color: appTheme.colors.textMuted,
    fontSize: 13,
  },
  headerHomeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: appTheme.colors.borderSubtle,
  },
  headerStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  statPill: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#D9E8E0',
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
  heroBtn: {
    marginTop: 12,
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
  tripCard: {
    marginHorizontal: appTheme.spacing.md,
    marginBottom: 10,
    borderRadius: 18,
    backgroundColor: '#fff',
    padding: 14,
    borderWidth: 1,
    borderColor: '#DCE7E1',
  },
  tripTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  tripTitleWrap: {
    flex: 1,
  },
  tripRoute: {
    color: appTheme.colors.primaryNavy,
    fontSize: 15,
    fontWeight: '800',
  },
  tripMeta: {
    marginTop: 2,
    color: appTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#E6F4EE',
  },
  statusBadgeText: {
    color: '#2C7D5B',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  tripGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  tripMetric: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#F7FBF8',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E3EEE7',
  },
  tripMetricLabel: {
    color: appTheme.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  tripMetricValue: {
    marginTop: 4,
    color: appTheme.colors.primaryNavy,
    fontSize: 13,
    fontWeight: '700',
  },
  tripStops: {
    marginTop: 10,
    color: appTheme.colors.textCharcoal,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    marginHorizontal: appTheme.spacing.md,
    marginTop: 8,
    padding: 16,
  },
  emptyTitle: {
    color: appTheme.colors.primaryNavy,
    fontSize: 15,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 4,
    color: appTheme.colors.textMuted,
    fontSize: 13,
  },
});

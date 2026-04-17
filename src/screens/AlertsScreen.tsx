import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabKey } from '../types/ui';
import { appTheme } from '../theme';
import { AppIcon, BottomNav, Card, ScreenShell } from '../components/primitives';
import { useAppFeedback } from '../feedback/useAppFeedback';
import { useDeviceClass } from '../utils/device';
import { getJourneyHistory } from '../api/haryanaApi';
import { BackendJourney } from '../types/backend';

type AlertsScreenProps = {
  onTabPress?: (tab: BottomTabKey) => void;
};

export function AlertsScreen({ onTabPress }: AlertsScreenProps) {
  const { notify } = useAppFeedback();
  const { isCompact } = useDeviceClass();
  const [journeys, setJourneys] = useState<BackendJourney[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const data = await getJourneyHistory(20);
        setJourneys(data || []);
      } catch (error) {
        console.error('Failed to fetch journey history:', error);
        notify('Could not load journey history', { haptic: 'tap' });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [notify]);

  const monthlySpend = journeys.reduce((sum, j) => sum + j.fare_inr, 0);

  return (
    <ScreenShell>
      <View style={[styles.headerWrap, isCompact && styles.headerWrapCompact]}>
        <View style={styles.headerSurface}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTextBlock}>
              <Text style={styles.headerKicker}>TRAVEL HISTORY</Text>
              <Text style={[styles.headerTitle, isCompact && styles.headerTitleCompact]}>Journey Ledger</Text>
              <Text style={styles.headerSubtitle}>पिछली यात्राएं, समय और किराया</Text>
            </View>

            <Pressable
              style={styles.headerRefreshBtn}
              onPress={() =>
                notify('Journey list refreshed.', {
                  analyticsEvent: 'journey_feed_refreshed',
                })
              }
            >
              <AppIcon name="refresh" size={18} color={appTheme.colors.primaryNavy} />
            </Pressable>
          </View>

          <View style={styles.headerMetaRow}>
            <View style={styles.metaPillStrong}>
              <Text style={styles.metaPillStrongText}>Trips {journeys.length}</Text>
            </View>
            <View style={styles.metaPillSoft}>
              <Text style={styles.metaPillSoftText}>Spent INR {monthlySpend}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Current Journey Card */}
        <Card style={styles.currentJourneyCard}>
          <View style={styles.currentJourneyBadge}>
            <View style={styles.liveIndicator} />
            <Text style={styles.currentJourneyLabel}>ACTIVE JOURNEY</Text>
          </View>
          
          <View style={styles.currentJourneyContent}>
            <View style={styles.currentRouteBlock}>
              <Text style={styles.currentRouteName}>Sonipat → Panipat</Text>
              <Text style={styles.currentRouteHindi}>सोनीपत से पानीपत</Text>
            </View>
            <Text style={styles.currentFare}>INR 55</Text>
          </View>

          <View style={styles.currentJourneyMeta}>
            <View style={styles.metaItemCurrent}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#2E7D57" />
              <View style={styles.metaContentCurrent}>
                <Text style={styles.metaLabelCurrent}>Boarded</Text>
                <Text style={styles.metaValueCurrent}>08:15 AM</Text>
              </View>
            </View>

            <View style={styles.dividerVertical} />

            <View style={styles.metaItemCurrent}>
              <MaterialCommunityIcons name="map-marker-outline" size={16} color="#2E7D57" />
              <View style={styles.metaContentCurrent}>
                <Text style={styles.metaLabelCurrent}>ETA</Text>
                <Text style={styles.metaValueCurrent}>09:03 AM</Text>
              </View>
            </View>

            <View style={styles.dividerVertical} />

            <View style={styles.metaItemCurrent}>
              <MaterialCommunityIcons name="bus" size={16} color="#2E7D57" />
              <View style={styles.metaContentCurrent}>
                <Text style={styles.metaLabelCurrent}>Seat 14B</Text>
                <Text style={styles.metaValueCurrent}>HRY-BUS-101</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Past Journeys Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Travel History</Text>
          <Text style={styles.sectionSubtitle}>{journeys.length} trips recorded</Text>
        </View>

        {/* History Items */}
        {journeys.length > 0 ? (
          <View style={styles.historyList}>
            {journeys.map((journey, index) => {
              const startDate = new Date(journey.started_at);
              const endDate = new Date(journey.ended_at);
              const startTime = startDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
              const endTime = endDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
              const dateStr = startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
              const routeDisplay = `${journey.source_stop?.name || 'Unknown'} → ${journey.destination_stop?.name || 'Unknown'}`;
              const isFirst = index === 0;
              
              const statusConfig = {
                completed: { color: '#E7F4EC', textColor: '#2D7A57', bgColor: '#1F6F4E' },
                cancelled: { color: '#FADDD3', textColor: '#B3261E', bgColor: '#B3261E' },
                'in-progress': { color: '#FFF3E0', textColor: '#E65100', bgColor: '#E65100' },
              };
              const config = statusConfig[journey.status as keyof typeof statusConfig] || statusConfig.completed;
              
              return (
                <Pressable
                  key={journey.journey_id}
                  style={[styles.journeyItemWrapper, isFirst && styles.journeyItemFirst]}
                  onPress={() =>
                    notify(`Receipt opened for ${journey.journey_id}`, {
                      analyticsEvent: `journey_receipt_${journey.journey_id}`,
                    })
                  }
                >
                  <Card style={styles.journeyItem}>
                    {/* Top Row: Route and Fare */}
                    <View style={styles.journeyItemTop}>
                      <View style={styles.journeyRouteSection}>
                        <View style={styles.journeyIcon}>
                          <MaterialCommunityIcons name="bus-side" size={20} color="#FFFFFF" />
                        </View>
                        <View style={styles.journeyRouteInfo}>
                          <Text style={styles.journeyRoute}>{routeDisplay}</Text>
                          <Text style={styles.journeyDate}>{dateStr}</Text>
                        </View>
                      </View>
                      <View style={styles.journeyFareSection}>
                        <Text style={styles.journeyFare}>₹{journey.fare_inr}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
                          <Text style={[styles.statusBadgeText, { color: config.textColor }]}>
                            {journey.status}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Meta Row: Time and Duration */}
                    <View style={styles.journeyMeta}>
                      <View style={styles.metaItem}>
                        <MaterialCommunityIcons name="clock-outline" size={14} color="#666666" />
                        <Text style={styles.metaText}>
                          {startTime} - {endTime}
                        </Text>
                      </View>
                      <View style={styles.metaDivider} />
                      <View style={styles.metaItem}>
                        <MaterialCommunityIcons name="timer-outline" size={14} color="#666666" />
                        <Text style={styles.metaText}>{journey.duration_minutes} min</Text>
                      </View>
                      <View style={styles.metaDivider} />
                      <View style={styles.metaItem}>
                        <MaterialCommunityIcons
                          name={journey.payment_mode === 'upi' ? 'phone' : 'wallet-outline'}
                          size={14}
                          color="#666666"
                        />
                        <Text style={styles.metaText}>{journey.payment_mode.toUpperCase()}</Text>
                      </View>
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <Card style={styles.emptyStateCard}>
            <MaterialCommunityIcons name="bus-stop" size={48} color="#CCCCCC" />
            <Text style={styles.emptyStateText}>No journeys yet</Text>
            <Text style={styles.emptyStateSub}>Start your first trip to see it here</Text>
          </Card>
        )}

        {/* Monthly Stats Card */}
        {journeys.length > 0 && (
          <Card style={styles.statsCard}>
            <View style={styles.statsGrid}>
              <View style={styles.statCell}>
                <MaterialCommunityIcons name="wallet" size={24} color="#2E7D57" />
                <Text style={styles.statValue}>₹{monthlySpend}</Text>
                <Text style={styles.statLabel}>Total Spent</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCell}>
                <MaterialCommunityIcons name="bus-multiple" size={24} color="#2E7D57" />
                <Text style={styles.statValue}>{journeys.length}</Text>
                <Text style={styles.statLabel}>Trips</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCell}>
                <MaterialCommunityIcons name="clock-alert-outline" size={24} color="#2E7D57" />
                <Text style={styles.statValue}>
                  {journeys.length > 0 ? Math.round(journeys.reduce((sum, j) => sum + j.duration_minutes, 0) / journeys.length) : 0}m
                </Text>
                <Text style={styles.statLabel}>Avg Duration</Text>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>

      <BottomNav activeTab="profile" onTabPress={onTabPress} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
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
    fontWeight: '500',
    letterSpacing: 0.9,
  },
  headerTitle: {
    marginTop: 2,
    color: appTheme.colors.primaryNavy,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '600',
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
  headerRefreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCE1D6',
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
  metaPillStrong: {
    borderRadius: 999,
    backgroundColor: '#2D7A57',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  metaPillStrongText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  metaPillSoft: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#C2DCCF',
    backgroundColor: '#F8FCF9',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  metaPillSoftText: {
    color: '#2E7D57',
    fontSize: 11,
    fontWeight: '500',
  },
  content: {
    padding: appTheme.spacing.md,
    gap: appTheme.spacing.md,
    paddingBottom: appTheme.spacing.lg + 20,
  },
  
  /* Current Journey Card */
  currentJourneyCard: {
    backgroundColor: 'linear-gradient(135deg, #E8F7EF 0%, #F2FAF5 100%)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#C7E6D1',
    overflow: 'hidden',
  },
  currentJourneyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: 8,
    backgroundColor: '#E7F4EC',
    borderBottomWidth: 1,
    borderBottomColor: '#D0E9DD',
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D32F2F',
  },
  currentJourneyLabel: {
    color: '#2D7A57',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  currentJourneyContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: appTheme.spacing.md,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D0E9DD',
  },
  currentRouteBlock: {
    flex: 1,
  },
  currentRouteName: {
    color: appTheme.colors.primaryNavy,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
  },
  currentRouteHindi: {
    color: '#666666',
    fontSize: 12,
    marginTop: 2,
  },
  currentFare: {
    color: '#1F6F4E',
    fontSize: 22,
    fontWeight: '600',
  },
  currentJourneyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: 12,
  },
  metaItemCurrent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  metaContentCurrent: {
    gap: 1,
  },
  metaLabelCurrent: {
    color: '#999999',
    fontSize: 11,
    fontWeight: '400',
  },
  metaValueCurrent: {
    color: appTheme.colors.primaryNavy,
    fontSize: 13,
    fontWeight: '600',
  },
  dividerVertical: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },

  /* Section Header */
  sectionHeader: {
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    color: appTheme.colors.primaryNavy,
    fontSize: 16,
    fontWeight: '600',
  },
  sectionSubtitle: {
    color: '#999999',
    fontSize: 12,
    marginTop: 2,
  },

  /* History List */
  historyList: {
    gap: 10,
  },
  journeyItemWrapper: {
    marginBottom: 2,
  },
  journeyItemFirst: {
    marginBottom: 6,
  },

  /* Journey Item Card */
  journeyItem: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  journeyItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  journeyRouteSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  journeyIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#2D7A57',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  journeyRouteInfo: {
    flex: 1,
    minWidth: 0,
  },
  journeyRoute: {
    color: appTheme.colors.primaryNavy,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 16,
  },
  journeyDate: {
    color: '#999999',
    fontSize: 12,
    marginTop: 2,
  },
  journeyFareSection: {
    alignItems: 'flex-end',
    gap: 6,
  },
  journeyFare: {
    color: '#1F6F4E',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },

  /* Journey Meta */
  journeyMeta: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  metaText: {
    color: '#666666',
    fontSize: 12,
    fontWeight: '400',
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#E0E0E0',
  },

  /* Empty State */
  emptyStateCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#FAFAFA',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    color: appTheme.colors.primaryNavy,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyStateSub: {
    color: '#999999',
    fontSize: 13,
    marginTop: 6,
  },

  /* Stats Card */
  statsCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8FCF9',
    paddingVertical: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statCell: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  statValue: {
    color: appTheme.colors.primaryNavy,
    fontSize: 18,
    fontWeight: '600',
  },
  statLabel: {
    color: '#999999',
    fontSize: 11,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#D0E9DD',
  },
});

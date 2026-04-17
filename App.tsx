import React, { useState } from 'react';
import { View } from 'react-native';
import { BottomTabKey } from './src/types/ui';
import { AppFeedbackProvider } from './src/feedback/useAppFeedback';
import {
  AlertsScreen,
  LiveTrackingScreen,
  RouteDetailsScreen,
  TripPlannerScreen,
} from './src/screens';

const ROUTE_TO_BUS_ID: Record<string, string> = {
  'HRY-RTE-001': 'HRY-BUS-101',
  'HRY-RTE-002': 'HRY-BUS-202',
  'HRY-RTE-003': 'HRY-BUS-303',
  'HRY-RTE-004': 'HRY-BUS-404',
  'HRY-RTE-005': 'HRY-BUS-505',
  'HRY-RTE-006': 'HRY-BUS-606',
  'HRY-RTE-007': 'HRY-BUS-707',
  'HRY-RTE-008': 'HRY-BUS-808',
  'HRY-RTE-009': 'HRY-BUS-909',
  'HRY-RTE-010': 'HRY-BUS-010',
  'HRY-RTE-011': 'HRY-BUS-011',
  'HRY-RTE-012': 'HRY-BUS-012',
};

export default function App() {
  const [tab, setTab] = useState<BottomTabKey>('live');
  const [selectedRouteId, setSelectedRouteId] = useState('HRY-RTE-001');
  const [selectedBusId, setSelectedBusId] = useState('HRY-BUS-101');
  const [plannerSource, setPlannerSource] = useState('Sonipat');
  const [plannerDestination, setPlannerDestination] = useState('Delhi');

  const renderScreen = () => {
    switch (tab) {
      case 'routes':
        return (
          <RouteDetailsScreen
            onTabPress={setTab}
            routeId={selectedRouteId}
            onRouteSelect={(routeId) => {
              setSelectedRouteId(routeId);
              setSelectedBusId(ROUTE_TO_BUS_ID[routeId] || selectedBusId);
            }}
          />
        );
      case 'tickets':
        return (
          <TripPlannerScreen
            onTabPress={setTab}
            initialSource={plannerSource}
            initialDestination={plannerDestination}
            onRouteSelect={(routeId, source, destination) => {
              setSelectedRouteId(routeId);
              setSelectedBusId(ROUTE_TO_BUS_ID[routeId] || 'HRY-BUS-101');
              setPlannerSource(source);
              setPlannerDestination(destination);
            }}
          />
        );
      case 'profile':
        return <AlertsScreen onTabPress={setTab} />;
      case 'live':
      default:
        return (
          <LiveTrackingScreen
            onTabPress={setTab}
            busId={selectedBusId}
            onRouteSelect={(routeId) => {
              setSelectedRouteId(routeId);
              setSelectedBusId(ROUTE_TO_BUS_ID[routeId] || selectedBusId);
            }}
          />
        );
    }
  };

  return (
    <AppFeedbackProvider>
      <View style={{ flex: 1 }}>{renderScreen()}</View>
    </AppFeedbackProvider>
  );
}

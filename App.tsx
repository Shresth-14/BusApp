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

export default function App() {
  const [tab, setTab] = useState<BottomTabKey>('live');
  const [selectedRouteId, setSelectedRouteId] = useState('HRY-RTE-001');
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
            routeId={selectedRouteId}
            onRouteSelect={(routeId) => {
              setSelectedRouteId(routeId);
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

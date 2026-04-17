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
  const [tab, setTab] = useState<BottomTabKey>('tickets');
  const [selectedRouteId, setSelectedRouteId] = useState('HRY-RTE-001');
  const [previousTab, setPreviousTab] = useState<BottomTabKey>('tickets');
  const [plannerSource, setPlannerSource] = useState('Sonipat');
  const [plannerDestination, setPlannerDestination] = useState('Delhi');

  const handleTabPress = (newTab: BottomTabKey) => {
    setPreviousTab(tab);
    setTab(newTab);
  };

  const handleGoBack = () => {
    // Go back to trip planner
    setPreviousTab(tab);
    setTab('tickets');
  };

  const renderScreen = () => {
    switch (tab) {
      case 'routes':
        return (
          <RouteDetailsScreen
            onTabPress={handleTabPress}
            routeId={selectedRouteId}
            onRouteSelect={(routeId) => {
              setSelectedRouteId(routeId);
            }}
          />
        );
      case 'tickets':
        return (
          <TripPlannerScreen
            onTabPress={handleTabPress}
            initialSource={plannerSource}
            initialDestination={plannerDestination}
            onRouteSelect={(routeId, source, destination) => {
              setSelectedRouteId(routeId);
              setPlannerSource(source);
              setPlannerDestination(destination);
              // Auto-navigate to live tracking
              setPreviousTab('tickets');
              setTab('live');
            }}
          />
        );
      case 'profile':
        return <AlertsScreen onTabPress={handleTabPress} />;
      case 'live':
      default:
        return (
          <LiveTrackingScreen
            onTabPress={handleTabPress}
            routeId={selectedRouteId}
            onRouteSelect={(routeId) => {
              setSelectedRouteId(routeId);
            }}
            onGoBack={handleGoBack}
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

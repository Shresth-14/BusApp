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
  const [tab, setTab] = useState<BottomTabKey>('routes');
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isTrackingRoute, setIsTrackingRoute] = useState(false);

  const handleTabPress = (newTab: BottomTabKey) => {
    setTab(newTab);
    // Reset tracking when switching tabs
    if (newTab !== 'routes' || newTab === 'routes') {
      setIsTrackingRoute(false);
    }
  };

  const handleSelectRoute = (routeId: string) => {
    setSelectedRouteId(routeId);
    setIsTrackingRoute(true);
  };

  const handleGoBack = () => {
    setIsTrackingRoute(false);
    setSelectedRouteId(null);
  };

  const renderScreen = () => {
    // If tracking a route, show live tracking
    if (isTrackingRoute && selectedRouteId) {
      return (
        <LiveTrackingScreen
          onTabPress={handleTabPress}
          routeId={selectedRouteId}
          onRouteSelect={() => {}}
          onGoBack={handleGoBack}
        />
      );
    }

    // Otherwise show tab content
    switch (tab) {
      case 'routes':
        return (
          <RouteDetailsScreen
            onTabPress={handleTabPress}
            routeId={selectedRouteId || 'HRY-RTE-001'}
            onRouteSelect={handleSelectRoute}
          />
        );
      case 'tickets':
        return (
          <TripPlannerScreen
            onTabPress={handleTabPress}
            initialSource="Sonipat"
            initialDestination="Delhi"
            onRouteSelect={(routeId) => {
              setSelectedRouteId(routeId);
              setIsTrackingRoute(true);
            }}
          />
        );
      case 'profile':
        return <AlertsScreen onTabPress={handleTabPress} />;
      default:
        return (
          <RouteDetailsScreen
            onTabPress={handleTabPress}
            routeId={selectedRouteId || 'HRY-RTE-001'}
            onRouteSelect={handleSelectRoute}
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

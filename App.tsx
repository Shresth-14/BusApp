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
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isTrackingRoute, setIsTrackingRoute] = useState(false);

  const handleTabPress = (newTab: BottomTabKey) => {
    setTab(newTab);
  };

  const handleSelectRoute = (routeId: string) => {
    setSelectedRouteId(routeId);
  };

  const handleShowMap = (routeId: string) => {
    setSelectedRouteId(routeId);
    setIsTrackingRoute(true);
  };

  const handleGoBack = () => {
    setIsTrackingRoute(false);
    setTab('routes');
  };

  const renderScreen = () => {
    // If tracking a route, show live tracking
    if (isTrackingRoute && selectedRouteId) {
      return (
        <LiveTrackingScreen
          onTabPress={handleTabPress}
          routeId={selectedRouteId}
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
            onShowMap={handleShowMap}
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
              setTab('routes');
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
            onShowMap={handleShowMap}
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

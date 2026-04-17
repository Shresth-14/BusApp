import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, ViewStyle } from 'react-native';
import { appTheme } from '../../theme';

type ScreenShellProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function ScreenShell({ children, style }: ScreenShellProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={appTheme.colors.backgroundSoft} />
      <View style={[styles.container, style]}>
        <View pointerEvents="none" style={styles.topGlow} />
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: appTheme.colors.backgroundSoft,
  },
  container: {
    flex: 1,
    backgroundColor: appTheme.colors.backgroundSoft,
  },
  topGlow: {
    position: 'absolute',
    top: -30,
    left: -50,
    right: -50,
    height: 120,
    borderRadius: 120,
    backgroundColor: 'rgba(46, 168, 162, 0.12)',
  },
});

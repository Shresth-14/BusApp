import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { appTheme } from '../../theme';

type StopsHeaderProps = {
  title: string;
  subtitle: string;
};

export function StopsHeader({ title, subtitle }: StopsHeaderProps) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name="map-marker-path" size={18} color="#0F8B8D" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    color: '#12223A',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 2,
    color: appTheme.colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF8F8',
    borderWidth: 1,
    borderColor: '#D2ECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { appTheme } from '../../theme';
import { AppButton, Card } from '../primitives';

type PlannerFormCardProps = {
  fromValue: string;
  toValue: string;
  onChangeFrom?: (value: string) => void;
  onChangeTo?: (value: string) => void;
  onLeaveNow?: () => void;
  onSearch?: () => void;
};

export function PlannerFormCard({
  fromValue,
  toValue,
  onChangeFrom,
  onChangeTo,
  onLeaveNow,
  onSearch,
}: PlannerFormCardProps) {
  return (
    <Card>
      <View style={styles.formField}>
        <Text style={styles.label}>From</Text>
        <TextInput
          value={fromValue}
          onChangeText={onChangeFrom}
          style={styles.input}
          placeholder="Enter source"
          placeholderTextColor="rgba(26,26,46,0.45)"
        />
      </View>

      <View style={styles.formField}>
        <Text style={styles.label}>To</Text>
        <TextInput
          value={toValue}
          onChangeText={onChangeTo}
          style={styles.input}
          placeholder="Enter destination"
          placeholderTextColor="rgba(26,26,46,0.45)"
        />
      </View>

      <View style={styles.actions}>
        <AppButton title="Leave Now" variant="secondary" onPress={onLeaveNow} style={styles.button} />
        <AppButton title="Search Buses" variant="primary" onPress={onSearch} style={styles.button} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  formField: {
    marginBottom: appTheme.spacing.sm,
  },
  label: {
    ...appTheme.typography.caption,
    color: appTheme.colors.textMuted,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: appTheme.colors.borderSubtle,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    paddingVertical: 9,
    paddingHorizontal: 10,
    ...appTheme.typography.body,
    color: appTheme.colors.textCharcoal,
  },
  actions: {
    flexDirection: 'row',
    gap: appTheme.spacing.sm,
    marginTop: appTheme.spacing.sm,
  },
  button: {
    flex: 1,
  },
});

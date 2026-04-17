import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

async function runHaptic(task: () => Promise<void>) {
  if (Platform.OS === 'web') return;

  try {
    await task();
  } catch {
    // Ignore haptic failures on unsupported devices.
  }
}

export async function triggerTapHaptic() {
  await runHaptic(() => Haptics.selectionAsync());
}

export async function triggerSuccessHaptic() {
  await runHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

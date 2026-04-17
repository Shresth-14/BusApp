import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { AppSnackbar } from '../components/primitives';
import { triggerSuccessHaptic, triggerTapHaptic } from '../utils/haptics';

type FeedbackHaptic = 'none' | 'tap' | 'success';

type FeedbackOptions = {
  haptic?: FeedbackHaptic;
  durationMs?: number;
  analyticsEvent?: string;
};

type AppFeedbackContextValue = {
  notify: (message: string, options?: FeedbackOptions) => void;
};

type AppFeedbackProviderProps = {
  children: React.ReactNode;
  onTrackEvent?: (eventName: string) => void;
};

const AppFeedbackContext = createContext<AppFeedbackContextValue | null>(null);

export function AppFeedbackProvider({ children, onTrackEvent }: AppFeedbackProviderProps) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const value = useMemo<AppFeedbackContextValue>(
    () => ({
      notify: async (nextMessage: string, options?: FeedbackOptions) => {
        const durationMs = options?.durationMs ?? 1800;
        const haptic = options?.haptic ?? 'success';

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        setMessage(nextMessage);
        setVisible(true);

        if (haptic === 'success') {
          await triggerSuccessHaptic();
        }

        if (haptic === 'tap') {
          await triggerTapHaptic();
        }

        if (options?.analyticsEvent) {
          if (onTrackEvent) {
            onTrackEvent(options.analyticsEvent);
          } else {
            console.log(`[analytics] ${options.analyticsEvent}`);
          }
        }

        timeoutRef.current = setTimeout(() => {
          setVisible(false);
        }, durationMs);
      },
    }),
    [onTrackEvent]
  );

  return (
    <AppFeedbackContext.Provider value={value}>
      <View style={{ flex: 1 }}>
        {children}
        <AppSnackbar visible={visible} message={message} />
      </View>
    </AppFeedbackContext.Provider>
  );
}

export function useAppFeedback() {
  const ctx = useContext(AppFeedbackContext);

  if (!ctx) {
    throw new Error('useAppFeedback must be used within AppFeedbackProvider');
  }

  return ctx;
}

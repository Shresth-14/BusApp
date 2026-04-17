# HaryanaGo React Native Screen Kit

Tokenized React Native UI kit for the HaryanaGo Smart Bus Tracker concept.

## Included

- Theme tokens: colors, spacing, radii, typography, elevation
- Reusable primitives: screen shell, header, card, badge, button, bottom nav
- Reusable sections: map preview, ETA hero, crowd meter, timeline, alerts list, planner form, frequency and recommendation cards
- Four screens: live tracking, route details, alerts, trip planner
- Barrel exports from `src/index.ts`

## File Structure

```text
src/
  components/
    primitives/
    sections/
  screens/
  theme/
  types/
App.tsx
```

## Usage

Import tokens and components from the kit:

```ts
import { appTheme, Card, AppButton, LiveTrackingScreen } from './src';
```

Use the sample `App.tsx` as a starting point, or copy only `src/` into an existing React Native app.

## Notes

- Typography is tuned for Inter. In React Native, add Inter with `expo-font` or native asset linking for full fidelity.
- Icon placeholders are text-based so you can replace them with your preferred icon set.

## Backend Integration

The screens now fetch live data from the HaryanaGo backend.

- Default API base URL: `http://localhost:4000`
- Override with Expo public env var when testing on physical devices:

```bash
EXPO_PUBLIC_API_BASE_URL=http://<your-local-ip>:4000 npx expo start --web
```

For Android emulator, API calls automatically use `http://10.0.2.2:4000` if no env var is provided.

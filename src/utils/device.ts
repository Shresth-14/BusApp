import { useWindowDimensions } from 'react-native';

export type DeviceClass = 'iphone-se' | 'iphone-compact' | 'iphone-regular' | 'iphone-plus-max';

export function getDeviceClass(width: number, height: number): DeviceClass {
  const shortSide = Math.min(width, height);
  const longSide = Math.max(width, height);

  if (shortSide <= 320 || longSide <= 568) return 'iphone-se';
  if (shortSide < 360 || longSide < 740) return 'iphone-compact';
  if (shortSide >= 430 || longSide >= 900) return 'iphone-plus-max';
  return 'iphone-regular';
}

export function useDeviceClass() {
  const { width, height } = useWindowDimensions();
  const deviceClass = getDeviceClass(width, height);

  const isSE = deviceClass === 'iphone-se';
  const isCompact = deviceClass === 'iphone-se' || deviceClass === 'iphone-compact';
  const isRegular = deviceClass === 'iphone-regular';
  const isPlusMax = deviceClass === 'iphone-plus-max';

  return {
    width,
    height,
    deviceClass,
    isSE,
    isCompact,
    isRegular,
    isPlusMax,
  } as const;
}

export const colors = {
  primaryNavy: '#1B5E20',
  accentTeal: '#A5D6A7',
  alertOrange: '#FFC107',
  errorRed: '#C44536',
  backgroundSoft: '#F8F9FA',
  textCharcoal: '#212121',
  surface: '#FFFFFF',
  borderSubtle: 'rgba(33, 33, 33, 0.12)',
  textMuted: '#757575',
  mapNightA: '#EAF3EA',
  mapNightB: '#DFECDF',
  statusOnline: '#2E7D32',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const typography = {
  heroEta: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '600' as const,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '500' as const,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '500' as const,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '300' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '300' as const,
  },
} as const;

export const elevation = {
  card: {
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
  },
} as const;

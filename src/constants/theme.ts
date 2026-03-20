export const COLORS = {
  background: '#050608',
  surface: '#0E1117',
  surfaceSoft: '#161A22',
  surfaceMid: '#1C2030',
  accent: '#5CE1E6',
  accentSoft: 'rgba(92, 225, 230, 0.12)',
  accentStrong: '#3BC0C6',
  textPrimary: '#F5F7FA',
  textSecondary: '#A3A7B5',
  textMuted: '#6F7482',
  border: '#252A36',
  borderSoft: '#1E2230',
  danger: '#FF6B81',
  success: '#4ADE80',
  successSoft: 'rgba(74, 222, 128, 0.12)',
  dangerSoft: 'rgba(255, 107, 129, 0.12)',
  cardShadow: 'rgba(0, 0, 0, 0.55)',
  overlay: 'rgba(0, 0, 0, 0.72)',
} as const;

/** Per-category accent colours */
export const CATEGORY_COLORS = {
  relationship: {
    primary: '#FF6B8A',
    soft: 'rgba(255, 107, 138, 0.12)',
    label: 'Relationship',
  },
  self: {
    primary: '#6C8EF5',
    soft: 'rgba(108, 142, 245, 0.12)',
    label: 'Self',
  },
  growth: {
    primary: '#F5A623',
    soft: 'rgba(245, 166, 35, 0.12)',
    label: 'Growth',
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const RADIUS = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const TYPOGRAPHY = {
  heading1: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
    lineHeight: 36,
  },
  heading2: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 24,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
    lineHeight: 24,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
    lineHeight: 18,
  },
} as const;

export const ELEVATION = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.55,
    shadowRadius: 32,
    elevation: 16,
  },
} as const;

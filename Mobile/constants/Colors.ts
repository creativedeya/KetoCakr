export const Colors = {
  primary: {
    main: '#A80048',
    light: '#D4336D',
    dark: '#7A0034',
    opacity: {
      10: '#A8004819',
      20: '#A8004833',
      30: '#A800484D',
      50: '#A8004880',
      85: '#A80048D9',
    }
  },
  secondary: {
    main: '#B2AC88',
    light: '#C8C4A8',
    dark: '#8E8A6A',
    opacity: {
      10: '#B2AC8819',
      20: '#B2AC8833',
      50: '#B2AC8880',
    }
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    tertiary: '#F5F5F5',
    accent: '#FFF5F8',
    beige: '#FAF9F6',
  },
  text: {
    primary: '#333333',
    secondary: '#666666',
    tertiary: '#999999',
    inverse: '#FFFFFF',
    link: '#A80048',
  },
  success: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C',
  },
  error: {
    main: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
  },
  warning: {
    main: '#FF9800',
    light: '#FFB74D',
    dark: '#F57C00',
  },
  info: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2',
  },
  border: {
    light: '#E9ECEF',
    medium: '#DEE2E6',
    dark: '#CED4DA',
  },
  shadow: {
    light: '#00000019',
    medium: '#00000033',
    dark: '#0000004D',
  },
  nutrition: {
    calories: '#FF6B6B',
    protein: '#4ECDC4',
    fat: '#FFE66D',
    carbs: '#A8E6CF',
    netCarbs: '#A80048',
  },
} as const;

export const PRIMARY = Colors.primary.main;
export const SECONDARY = Colors.secondary.main;
export const BACKGROUND = Colors.background.primary;
export const TEXT = Colors.text.primary;
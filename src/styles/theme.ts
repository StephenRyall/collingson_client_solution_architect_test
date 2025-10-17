// ============================================================================
// THEME CONFIGURATION
// Priority Pass × Taxi Integration
// Design system and color palette
// ============================================================================

export const theme = {
  // Color Palette
  colors: {
    // Primary (Priority Pass brand colors)
    primary: '#003B5C',        // Dark blue
    primaryLight: '#005A87',
    primaryDark: '#002440',
    
    // Secondary (Taxi/Transport accent)
    secondary: '#FFB300',      // Amber/Gold
    secondaryLight: '#FFD54F',
    secondaryDark: '#FF8F00',
    
    // Status Colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    
    // Neutral Colors
    background: '#F5F7FA',
    surface: '#FFFFFF',
    border: '#E0E0E0',
    divider: '#BDBDBD',
    
    // Text Colors
    textPrimary: '#212121',
    textSecondary: '#757575',
    textDisabled: '#BDBDBD',
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#000000',
    
    // Lounge-specific
    loungeGold: '#D4AF37',
    loungePremium: '#8B4789',
  },
  
  // Typography
  typography: {
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"Monaco", "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  // Spacing (based on 8px grid)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },
  
  // Border Radius
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    base: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },
  
  // Breakpoints (for responsive design)
  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },
  
  // Z-index layers
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
};

// Type for theme (useful for TypeScript)
export type Theme = typeof theme;

// Helper function to get responsive value
export const getResponsiveValue = (
  mobile: string,
  tablet?: string,
  desktop?: string
) => ({
  mobile,
  tablet: tablet || mobile,
  desktop: desktop || tablet || mobile,
});


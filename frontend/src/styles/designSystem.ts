export const designSystem = {
  colors: {
    // Liberian flag colors: Red, White, Blue, with star
    primary: {
      50: '#eff6ff',   // Very light blue
      100: '#dbeafe',  // Light blue
      500: '#1e40af',  // Deep blue (Liberian flag blue)
      600: '#1e3a8a',  // Darker blue
      700: '#1e3a8a'   // Navy blue
    },
    secondary: {
      500: '#dc2626',  // Liberian red (flag red)
      600: '#b91c1c'   // Darker red
    },
    accent: {
      orange: '#f97316', // Vibrant orange for highlights
      red: '#dc2626',    // Liberian red
      blue: '#1e40af',   // Liberian blue
      green: '#16a34a',  // Success green
      gold: '#f59e0b'    // Gold for premium/featured items
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      500: '#737373',
      900: '#171717'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px'
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.07)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.15)'
  },
  typography: {
    fontFamily: {
      sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    }
  }
}

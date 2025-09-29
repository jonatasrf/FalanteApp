import React from 'react';
import { createTheme } from '@mui/material/styles';

// Tema Airbnb-inspired
const airbnbTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FF385C', // Airbnb red
      light: '#FF5A5F',
      dark: '#E31B23',
    },
    secondary: {
      main: '#008489', // Airbnb teal
      light: '#00A699',
      dark: '#007A87',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#484848',
      secondary: '#767676',
    },
    grey: {
      50: '#F7F7F7',
      100: '#EBEBEB',
      200: '#DDDDDD',
      300: '#CCCCCC',
      400: '#999999',
      500: '#767676',
      600: '#484848',
      700: '#222222',
    },
  },
  typography: {
    fontFamily: '"Circular", "-apple-system", "BlinkMacSystemFont", "Roboto", "Helvetica Neue", "sans-serif"',
    h1: {
      fontSize: '3rem',
      fontWeight: 800,
      color: '#484848',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 700,
      color: '#484848',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 600,
      color: '#484848',
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#484848',
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#484848',
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#484848',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#484848',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
      color: '#767676',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '14px 24px',
          fontSize: '1rem',
          boxShadow: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          backgroundColor: '#FF385C',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#E31B23',
          },
        },
        outlined: {
          borderColor: '#DDDDDD',
          color: '#484848',
          backgroundColor: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#F7F7F7',
            borderColor: '#CCCCCC',
          },
        },
        text: {
          color: '#484848',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
          border: '1px solid #EBEBEB',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 16,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#484848',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          borderBottom: '1px solid #EBEBEB',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            transition: 'all 0.2s ease',
            '& fieldset': {
              borderColor: '#DDDDDD',
              borderWidth: '2px',
            },
            '&:hover fieldset': {
              borderColor: '#CCCCCC',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FF385C',
            },
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(255, 56, 92, 0.1)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#767676',
            '&.Mui-focused': {
              color: '#FF385C',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

export default airbnbTheme;

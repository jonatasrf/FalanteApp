import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';

// Tema escuro atual (Falante)
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ffff', // Ciano
    },
    secondary: {
      main: '#ff6b6b', // Coral
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#cccccc',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

// Tema claro inspirado no Airbnb
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FF385C', // Vermelho Airbnb
      light: '#FF5A5F',
      dark: '#E31B23',
    },
    secondary: {
      main: '#008489', // Verde Airbnb
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
    fontFamily: '"Circular", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 800,
      color: '#484848',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#484848',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#484848',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#484848',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#484848',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#484848',
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
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '12px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
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
          '&:hover': {
            backgroundColor: '#F7F7F7',
            borderColor: '#CCCCCC',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid #EBEBEB',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#484848',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
            '& fieldset': {
              borderColor: '#DDDDDD',
            },
            '&:hover fieldset': {
              borderColor: '#CCCCCC',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FF385C',
            },
          },
        },
      },
    },
  },
});

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Carregar preferência do usuário do localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('falante-theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      // Detectar preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  // Salvar preferência no localStorage
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('falante-theme', newTheme ? 'dark' : 'light');
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

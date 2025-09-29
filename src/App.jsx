import React, { useState, useEffect } from 'react';
import { ToastProvider } from './contexts/ToastContext';
import { UserProgressProvider } from './contexts/UserProgressContext';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import airbnbTheme from './contexts/ThemeContext';
import { supabase } from './supabaseClient';
import MainApp from './components/MainApp';
import './App.css';
import './airbnb-theme.css';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('App.jsx: getSession() result:', session);
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('App.jsx: onAuthStateChange event:', _event, 'session:', session);
      setSession(session);

      // Clean up the URL after successful authentication
      if (session && (_event === 'SIGNED_IN' || _event === 'INITIAL_SESSION')) {
        const currentPath = window.location.pathname;
        const basePath = import.meta.env.BASE_URL; // Get base path from Vite config

        // Check if the current path is the auth callback path
        if (currentPath.includes(`${basePath}auth/callback`)) {
          window.history.replaceState({}, document.title, window.location.origin + basePath);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <ThemeProvider theme={airbnbTheme}>
      <CssBaseline />
      <ToastProvider>
        <UserProgressProvider session={session}>
          <MainApp session={session} />
        </UserProgressProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, Button } from '@mui/material';
import { useUserProgress } from '../contexts/UserProgressContext';
import { supabase } from '../supabaseClient';
import ConversationListenType from './ConversationListenType';
import ConversationQuiz from './ConversationQuiz';
import ConversationCarousel from './ConversationCarousel';
import Login from './Login';
import DiamondPopup from './DiamondPopup';
import LevelUpPopup from './LevelUpPopup';
import UpdatePassword from './UpdatePassword';
import ProgressPage from './ProgressPage';
import SettingsPage from './SettingsPage';
import DonationPage from './DonationPage';
import Header from './Header';
import CategoriesHeader from './CategoriesHeader';


const VIEWS = {
  HOME: 'Home',
  CONVERSATIONS: 'Conversations',
  CONVERSATION_LISTEN_TYPE: 'Conversation Listen & Type',
  DONATION: 'Donation',
  LOGIN: 'Login',
  UPDATE_PASSWORD: 'Update Password',
  PROFILE: 'Profile',
};

export default function MainApp({ session }) {
  const [activeView, setActiveView] = useState(VIEWS.HOME);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [quizReady, setQuizReady] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);

  

  // Redirect to home when user logs in
  useEffect(() => {
    if (session && activeView === VIEWS.LOGIN) {
      setActiveView(VIEWS.HOME);
    }
  }, [session, activeView]);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('id, title, image_url, phrases, objective_questions, level');

        if (error) {
          throw error;
        }

        const formattedConversations = data.map(c => ({ ...c, objectiveQuestions: c.objective_questions }));
        setConversations(formattedConversations);
        setFilteredConversations(formattedConversations);
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(conv =>
        (conv.title && typeof conv.title === 'string' && conv.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (conv.level && typeof conv.level === 'string' && conv.level.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredConversations(filtered);
    }
  }, [searchTerm, conversations]);

    const { isDiamondPopupOpen, diamondsEarned, closeDiamondPopup, isLevelUpPopupOpen, newLevel, levelUpMessage, closeLevelUpPopup, level: _level, diamonds: _diamonds, conversationProgress: _conversationProgress, isGuest: _isGuest } = useUserProgress();

  useEffect(() => {
    const handleGlobalKeyDown = (event) => {
      const activeEl = document.activeElement;
      const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

      if (activeView === VIEWS.CONVERSATION_LISTEN_TYPE) {
        // Conversation Listen & Type shortcuts
        if (event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey) {
          event.preventDefault();
          document.getElementById('speak-button')?.click();
        } else if (event.key === 'Tab') {
          event.preventDefault();
          document.getElementById('hint-button')?.click();
        } else if (event.key === 'Enter' && !isInputFocused) {
          event.preventDefault();
          const checkButton = document.getElementById('check-button');
          const nextButton = document.getElementById('next-button');
          if (checkButton && !checkButton.disabled) {
            checkButton.click();
          } else if (nextButton && !nextButton.disabled) {
            nextButton.click();
          }
        }
      } else if (activeView === VIEWS.CONVERSATION_QUIZ) {
        // Conversation Quiz shortcuts
        if (event.key === 'Enter' && !isInputFocused) {
          event.preventDefault();
          document.getElementById('next-question-button')?.click();
        } else if (event.key >= '1' && event.key <= '4') { // Assuming max 4 options
          event.preventDefault();
          const optionButton = document.getElementById(`option-${event.key - 1}`);
          if (optionButton) {
            optionButton.click();
          }
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [activeView]);

  const handleConversationStart = (conv) => {
    setSelectedConversation(conv);
    setActiveView(VIEWS.CONVERSATION_LISTEN_TYPE);
  };

  const handleConversationComplete = () => {
    setQuizReady(true);
  };

  const handleQuizComplete = () => {
    setSelectedConversation(null);
    setQuizReady(false);
    setActiveView(VIEWS.CONVERSATIONS);
  };

  const renderView = () => {
    if (activeView === VIEWS.LOGIN) {
        return <Login />;
    }
    if (activeView === VIEWS.UPDATE_PASSWORD) {
        return <UpdatePassword />;
    }
    if (activeView === VIEWS.PROFILE) {
        return <ProgressPage />;
    }
    if (activeView === 'Settings') {
        return <SettingsPage />;
    }
    if (activeView === VIEWS.DONATION) {
        return <DonationPage />;
    }
    if (loading && activeView === VIEWS.HOME) {
        return (
            <div className="container">
                <h1>Choose a Conversation</h1>
                <div className="conversations-grid">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="conversation-card skeleton-card">
                            <div className="skeleton-image"></div>
                            <div className="conversation-card-content">
                                <div className="skeleton-text skeleton-title"></div>
                                <div className="skeleton-text skeleton-subtitle"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    if (loading) {
      return <p>Loading...</p>;
    }
    if (error) {
      return <p className="error">Error: {error}. Please check your Supabase connection and table setup.</p>;
    }
    if (conversations.length === 0) {
      return <p>No conversations found. Please add some to your Supabase 'conversations' table.</p>;
    }

    switch (activeView) {
      case VIEWS.HOME: {
        return (
          <Box sx={{
            minHeight: '100vh',
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'
              : 'linear-gradient(135deg, #FFFFFF 0%, #F7F7F7 50%, #EBEBEB 100%)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: (theme) => theme.palette.mode === 'dark'
                ? `
                  radial-gradient(circle at 20% 80%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(255, 107, 107, 0.1) 0%, transparent 50%)
                `
                : `
                  radial-gradient(circle at 20% 80%, rgba(255, 107, 107, 0.05) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(0, 168, 168, 0.05) 0%, transparent 50%)
                `,
              pointerEvents: 'none'
            }
          }}>
            <Box sx={{
              position: 'relative',
              zIndex: 1,
              maxWidth: 1200,
              mx: 'auto',
              px: 3,
              py: 8,
              textAlign: 'center'
            }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  fontWeight: 800,
                  mb: 2,
                  background: (theme) => theme.palette.mode === 'dark'
                    ? 'linear-gradient(45deg, #00ffff, #ff6b6b)'
                    : 'linear-gradient(45deg, #1976d2, #dc004e)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: (theme) => theme.palette.mode === 'dark'
                    ? '0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.4)'
                    : 'none'
                }}
              >
                Welcome to Falante
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mb: 6,
                  color: (theme) => theme.palette.mode === 'dark' ? '#cccccc' : '#767676',
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  maxWidth: 600,
                  mx: 'auto'
                }}
              >
                Master English conversation skills through interactive learning
              </Typography>

              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
                gap: 3,
                mb: 8
              }}>
                {[
                  { icon: '🎧', title: 'Listen & Learn', desc: 'Practice your listening skills with native speaker audio and learn natural conversation patterns.' },
                  { icon: '✏️', title: 'Interactive Practice', desc: 'Type what you hear and get instant feedback to improve your spelling and comprehension.' },
                  { icon: '🧠', title: 'Knowledge Tests', desc: 'Test your understanding with quizzes that reinforce what you\'ve learned in each conversation.' },
                  { icon: '📊', title: 'Track Progress', desc: 'Monitor your improvement with detailed statistics, levels, and achievement tracking.' }
                ].map((feature, index) => (
                  <Card key={index} sx={{
                    p: 3,
                    backgroundColor: (theme) => theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.8)',
                    border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#EBEBEB'}`,
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: (theme) => theme.palette.mode === 'dark'
                        ? '0 8px 25px rgba(0, 255, 255, 0.2)'
                        : '0 8px 25px rgba(0, 0, 0, 0.1)'
                    }
                  }}>
                    <Typography variant="h3" sx={{ mb: 2, fontSize: '2rem' }}>
                      {feature.icon}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: (theme) => theme.palette.mode === 'dark' ? '#cccccc' : '#767676'
                    }}>
                      {feature.desc}
                    </Typography>
                  </Card>
                ))}
              </Box>

              <Box sx={{ mb: 8 }}>
                <Typography variant="h3" sx={{ mb: 4, fontWeight: 700 }}>
                  How It Works
                </Typography>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 3,
                  textAlign: 'left',
                  maxWidth: 800,
                  mx: 'auto'
                }}>
                  {[
                    'Choose a conversation: Select from various topics and difficulty levels',
                    'Listen carefully: Play the audio and focus on pronunciation and intonation',
                    'Type what you hear: Practice spelling while reinforcing listening skills',
                    'Take the quiz: Test your comprehension with multiple-choice questions',
                    'Earn rewards: Gain diamonds and level up as you progress',
                    'Track your journey: View detailed statistics in your profile'
                  ].map((step, index) => (
                    <Box key={index} sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      mb: 2
                    }}>
                      <Typography sx={{
                        mr: 2,
                        fontWeight: 'bold',
                        color: (theme) => theme.palette.primary.main,
                        minWidth: '24px'
                      }}>
                        {index + 1}.
                      </Typography>
                      <Typography variant="body1">
                        {step}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Button
                variant="contained"
                size="large"
                onClick={() => setActiveView(VIEWS.CONVERSATIONS)}
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  backgroundColor: (theme) => theme.palette.primary.main,
                  color: (theme) => theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.primary.dark,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                🚀 Start Learning Now
              </Button>
            </Box>
          </Box>
        );
      }
      case VIEWS.CONVERSATIONS: {
        const conversationsToShow = searchTerm.trim() !== '' ? filteredConversations : conversations;

        // Definir ordem específica dos níveis
        const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'C3'];

        // Agrupar conversas por nível
        const conversationsByLevel = conversationsToShow.reduce((acc, conv) => {
          const level = conv.level || 'N/A';
          if (!acc[level]) {
            acc[level] = [];
          }
          acc[level].push(conv);
          return acc;
        }, {});

        // Filtrar apenas os níveis que existem nos dados e estão na ordem definida
        const orderedLevels = levelOrder.filter(level => conversationsByLevel[level] && conversationsByLevel[level].length > 0);

        return (
          <div>
            {orderedLevels.map(level => (
              <ConversationCarousel
                key={level}
                title={level}
                conversations={conversationsByLevel[level]}
                onConversationStart={handleConversationStart}
                conversationProgress={_conversationProgress}
              />
            ))}
          </div>
        );
      }
      case VIEWS.CONVERSATION_LISTEN_TYPE:
        if (!selectedConversation) return <p>No conversation selected.</p>;
        return (
          <>
            <ConversationListenType conversation={selectedConversation} onConversationComplete={handleConversationComplete} />
            {quizReady && (
              <div style={{ marginTop: '2rem' }}>
                <ConversationQuiz conversation={selectedConversation} onQuizComplete={handleQuizComplete} />
              </div>
            )}
          </>
        );
      default:
        return <p>Select a view</p>;
    }
  };

  return (
    <>
      <CategoriesHeader
        session={session}
        setActiveView={setActiveView}
        supabase={supabase}
        activeView={activeView}
      />
      <Header
        session={session}
        setActiveView={setActiveView}
        supabase={supabase}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeView={activeView}
      />
      <main className="main-content">
        {!session && activeView !== VIEWS.LOGIN && (
            <div className="alert alert-warning">
                You are not logged in. Your progress will not be saved.
            </div>
        )}
        {renderView()}
      </main>
      <DiamondPopup open={isDiamondPopupOpen} diamondsEarned={diamondsEarned} onClose={closeDiamondPopup} />
      <LevelUpPopup open={isLevelUpPopupOpen} newLevel={newLevel} levelUpMessage={levelUpMessage} onClose={closeLevelUpPopup} />
    </>
  );
}

import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, Button } from '@mui/material';
import { useUserProgress } from '../contexts/UserProgressContext';
import { supabase } from '../supabaseClient';
import ConversationListenType from './ConversationListenType';
import ConversationQuiz from './ConversationQuiz';
import ConversationCarousel from './ConversationCarousel';
import RecommendedCarousel from './RecommendedCarousel';
import IncompleteConversationsCarousel from './IncompleteConversationsCarousel';
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
    // Diálogo completado - ativa quiz
    setQuizReady(true);
  };

  const handleQuizComplete = () => {
    // Quiz terminado - volta para listagem
    setSelectedConversation(null);
    setQuizReady(false);
    setActiveView(VIEWS.CONVERSATIONS);
  };

  const handleBackToConversations = () => {
    // Sempre volta para listagem de conversas
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
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F7F7F7 50%, #EBEBEB 100%)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 20% 80%, rgba(255, 56, 92, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(0, 132, 137, 0.05) 0%, transparent 50%)
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
                  background: 'linear-gradient(45deg, #FF385C, #008489)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Welcome to Falante
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mb: 6,
                  color: '#767676',
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
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #EBEBEB',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                    }
                  }}>
                    <Typography variant="h3" sx={{ mb: 2, fontSize: '2rem' }}>
                      {feature.icon}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#767676' }}>
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
                        color: '#FF385C',
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
                  backgroundColor: '#FF385C',
                  color: '#FFFFFF',
                  '&:hover': {
                    backgroundColor: '#E31B23',
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

        // Calcular nível do usuário baseado no progresso
        const userLevel = _level || 'A1';

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
            {/* Carrossel de Conversas Incompletas - aparece apenas se o usuário estiver LOGADO */}
            {session && (
              <IncompleteConversationsCarousel
                conversations={conversationsToShow}
                onConversationStart={handleConversationStart}
                conversationProgress={_conversationProgress}
                userLevel={userLevel}
              />
            )}

            {/* Carrossel de Recomendações - aparece apenas se o usuário estiver LOGADO */}
            {session && (
              <RecommendedCarousel
                conversations={conversationsToShow}
                onConversationStart={handleConversationStart}
                conversationProgress={_conversationProgress}
                userLevel={userLevel}
              />
            )}

            {/* Carrosséis por nível - com priorização de cards não completados */}
            {orderedLevels.map(level => (
              <ConversationCarousel
                key={level}
                title={level}
                conversations={conversationsByLevel[level]}
                onConversationStart={handleConversationStart}
                conversationProgress={_conversationProgress}
                prioritizeIncomplete={true}
              />
            ))}
          </div>
        );
      }
      case VIEWS.CONVERSATION_LISTEN_TYPE: {
        if (!selectedConversation) return <p>No conversation selected.</p>;

        // Verificar se a conversa já foi totalmente completa (inclusive quiz)
        const conversationProgress = _conversationProgress[selectedConversation.id];
        const isFullyCompleted = conversationProgress && conversationProgress.quiz_completed;

        return (
          <>
            <ConversationListenType
              conversation={selectedConversation}
              onConversationComplete={handleConversationComplete}
              onBackToConversations={handleBackToConversations}
            />
            {quizReady && !isFullyCompleted && (
              <div style={{ marginTop: '2rem' }}>
                <ConversationQuiz conversation={selectedConversation} onQuizComplete={handleQuizComplete} onBackToConversations={handleBackToConversations} />
              </div>
            )}
          </>
        );
      }
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

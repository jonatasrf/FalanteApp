import React, { useState, useEffect } from 'react';
import { useUserProgress } from '../contexts/UserProgressContext';
import { supabase } from '../supabaseClient';
import ConversationListenType from './ConversationListenType';
import ConversationQuiz from './ConversationQuiz';
import ConversationCarousel from './ConversationCarousel';
import Login from './Login';
import DiamondPopup from './DiamondPopup';
import LevelUpPopup from './LevelUpPopup';
import UpdatePassword from './UpdatePassword';
import ProfilePage from './ProfilePage';
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

  // Handle Supabase auth callback redirect
  useEffect(() => {
    if (window.location.pathname.includes('/auth/callback')) {
      // Supabase handles the session automatically
      // Redirect to home and clean up URL
      setActiveView(VIEWS.HOME);
      window.history.replaceState({}, document.title, window.location.origin + window.location.pathname.replace('/auth/callback', ''));
    }
  }, []);

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
        return <ProfilePage />;
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
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '2rem',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
            minHeight: '100vh',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 20% 80%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 107, 107, 0.1) 0%, transparent 50%)
              `,
              pointerEvents: 'none'
            }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <h1 style={{
                fontSize: '3rem',
                marginBottom: '2rem',
                color: '#ffffff',
                textShadow: '0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.4)',
                background: 'linear-gradient(45deg, #00ffff, #ff6b6b)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Welcome to Falante
              </h1>

              <p style={{
                fontSize: '1.5rem',
                marginBottom: '2rem',
                color: '#e0e0e0',
                lineHeight: '1.6',
                textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
              }}>
                Master English conversation skills through interactive learning
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                marginTop: '3rem'
              }}>
                <div style={{
                  background: 'rgba(26, 26, 46, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid #00ffff',
                  borderRadius: '12px',
                  color: 'white',
                  padding: '2rem',
                  boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
                  transition: 'all 0.3s ease'
                }}>
                  <h3 style={{
                    marginBottom: '1rem',
                    color: '#00ffff',
                    textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
                  }}>
                    🎧 Listen & Learn
                  </h3>
                  <p style={{
                    color: '#e0e0e0',
                    textShadow: '0 0 5px rgba(255, 255, 255, 0.3)'
                  }}>
                    Practice your listening skills with native speaker audio and learn natural conversation patterns.
                  </p>
                </div>

                <div style={{
                  background: 'rgba(26, 26, 46, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid #ff6b6b',
                  borderRadius: '12px',
                  color: 'white',
                  padding: '2rem',
                  boxShadow: '0 0 20px rgba(255, 107, 107, 0.3)',
                  transition: 'all 0.3s ease'
                }}>
                  <h3 style={{
                    marginBottom: '1rem',
                    color: '#ff6b6b',
                    textShadow: '0 0 10px rgba(255, 107, 107, 0.5)'
                  }}>
                    ✏️ Interactive Practice
                  </h3>
                  <p style={{
                    color: '#e0e0e0',
                    textShadow: '0 0 5px rgba(255, 255, 255, 0.3)'
                  }}>
                    Type what you hear and get instant feedback to improve your spelling and comprehension.
                  </p>
                </div>

                <div style={{
                  background: 'rgba(26, 26, 46, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid #00ffff',
                  borderRadius: '12px',
                  color: 'white',
                  padding: '2rem',
                  boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
                  transition: 'all 0.3s ease'
                }}>
                  <h3 style={{
                    marginBottom: '1rem',
                    color: '#00ffff',
                    textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
                  }}>
                    🧠 Knowledge Tests
                  </h3>
                  <p style={{
                    color: '#e0e0e0',
                    textShadow: '0 0 5px rgba(255, 255, 255, 0.3)'
                  }}>
                    Test your understanding with quizzes that reinforce what you've learned in each conversation.
                  </p>
                </div>

                <div style={{
                  background: 'rgba(26, 26, 46, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid #ff6b6b',
                  borderRadius: '12px',
                  color: 'white',
                  padding: '2rem',
                  boxShadow: '0 0 20px rgba(255, 107, 107, 0.3)',
                  transition: 'all 0.3s ease'
                }}>
                  <h3 style={{
                    marginBottom: '1rem',
                    color: '#ff6b6b',
                    textShadow: '0 0 10px rgba(255, 107, 107, 0.5)'
                  }}>
                    📊 Track Progress
                  </h3>
                  <p style={{
                    color: '#e0e0e0',
                    textShadow: '0 0 5px rgba(255, 255, 255, 0.3)'
                  }}>
                    Monitor your improvement with detailed statistics, levels, and achievement tracking.
                  </p>
                </div>
              </div>

              <div style={{
                marginTop: '3rem',
                padding: '2rem',
                background: 'rgba(26, 26, 46, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '2px solid #00ffff',
                borderRadius: '12px',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)'
              }}>
                <h2 style={{
                  color: '#ffffff',
                  marginBottom: '1rem',
                  textShadow: '0 0 15px rgba(0, 255, 255, 0.6)'
                }}>
                  How It Works
                </h2>
                <ol style={{
                  textAlign: 'left',
                  display: 'inline-block',
                  color: '#e0e0e0',
                  lineHeight: '1.8',
                  textShadow: '0 0 5px rgba(255, 255, 255, 0.3)'
                }}>
                  <li><strong>Choose a conversation:</strong> Select from various topics and difficulty levels</li>
                  <li><strong>Listen carefully:</strong> Play the audio and focus on pronunciation and intonation</li>
                  <li><strong>Type what you hear:</strong> Practice spelling while reinforcing listening skills</li>
                  <li><strong>Take the quiz:</strong> Test your comprehension with multiple-choice questions</li>
                  <li><strong>Earn rewards:</strong> Gain diamonds and level up as you progress</li>
                  <li><strong>Track your journey:</strong> View detailed statistics in your profile</li>
                </ol>
              </div>

              <div style={{ marginTop: '3rem' }}>
                <button
                  onClick={() => setActiveView(VIEWS.CONVERSATIONS)}
                  style={{
                    background: 'linear-gradient(45deg, #ff6b6b, #ffa726)',
                    color: '#ffffff',
                    border: '2px solid #ff6b6b',
                    padding: '1rem 2rem',
                    fontSize: '1.2rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(255, 107, 107, 0.6)',
                    transition: 'all 0.3s ease',
                    textShadow: '0 0 5px rgba(255, 255, 255, 0.5)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 0 30px rgba(255, 107, 107, 0.8)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.6)';
                  }}
                >
                  🚀 Start Learning Now
                </button>
              </div>
            </div>
          </div>
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

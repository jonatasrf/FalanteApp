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
          <div className="home-container">
            <div className="home-background"></div>
            <div className="home-content">
              <h1 className="home-title">
                Welcome to Falante
              </h1>
              <p className="home-subtitle">
                Master English conversation skills through interactive learning
              </p>
              <div className="home-features">
                <div className="home-feature-card">
                  <h3>🎧 Listen & Learn</h3>
                  <p>
                    Practice your listening skills with native speaker audio and learn natural conversation patterns.
                  </p>
                </div>
                <div className="home-feature-card">
                  <h3>✏️ Interactive Practice</h3>
                  <p>
                    Type what you hear and get instant feedback to improve your spelling and comprehension.
                  </p>
                </div>
                <div className="home-feature-card">
                  <h3>🧠 Knowledge Tests</h3>
                  <p>
                    Test your understanding with quizzes that reinforce what you've learned in each conversation.
                  </p>
                </div>
                <div className="home-feature-card">
                  <h3>📊 Track Progress</h3>
                  <p>
                    Monitor your improvement with detailed statistics, levels, and achievement tracking.
                  </p>
                </div>
              </div>
              <div className="home-how-it-works">
                <h2>How It Works</h2>
                <ol>
                  <li><strong>Choose a conversation:</strong> Select from various topics and difficulty levels</li>
                  <li><strong>Listen carefully:</strong> Play the audio and focus on pronunciation and intonation</li>
                  <li><strong>Type what you hear:</strong> Practice spelling while reinforcing listening skills</li>
                  <li><strong>Take the quiz:</strong> Test your comprehension with multiple-choice questions</li>
                  <li><strong>Earn rewards:</strong> Gain diamonds and level up as you progress</li>
                  <li><strong>Track your journey:</strong> View detailed statistics in your profile</li>
                </ol>
              </div>
              <div>
                <button
                  onClick={() => setActiveView(VIEWS.CONVERSATIONS)}
                  className="home-start-button"
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

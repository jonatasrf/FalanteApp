import React from 'react';
import ChatIcon from '@mui/icons-material/Chat';
import FavoriteIcon from '@mui/icons-material/Favorite';
import UserMenu from './UserMenu';

const categories = [
  { label: 'Conversations', icon: <ChatIcon />, action: 'Conversations' },
  { label: 'Donation', icon: <FavoriteIcon />, action: 'Donation' },
];

export default function CategoriesHeader({ session, setActiveView, supabase, activeView }) {
  // Determinar qual botão deve estar ativo baseado na view atual
  const getActiveIndex = () => {
    if (activeView === 'Conversations') return 0;
    if (activeView === 'Donation') return 1;
    return -1; // Nenhum botão ativo quando estiver em Home ou outras páginas
  };

  const activeIndex = getActiveIndex();

  return (
    <div className="categories-header">
      <div className="logo" onClick={() => setActiveView('Home')}>
        <span className="logo-f">F</span>alante
      </div>
      <div className="categories-buttons-container">
        {categories.map((category, index) => (
          <button
            key={index}
            className={`category-item ${index === activeIndex ? 'active' : ''}`}
            onClick={() => {
              if (category.action) {
                setActiveView(category.action);
              }
            }}
          >
            <div className="category-icon">{category.icon}</div>
            <div className="category-label">{category.label}</div>
          </button>
        ))}
      </div>
      <UserMenu session={session} setActiveView={setActiveView} supabase={supabase} />
    </div>
  );
}

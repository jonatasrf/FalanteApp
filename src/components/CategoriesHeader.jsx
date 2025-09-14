import React from 'react';
import ChatIcon from '@mui/icons-material/Chat';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BarChartIcon from '@mui/icons-material/BarChart';
import UserMenu from './UserMenu';

const categories = [
  { label: 'Conversations', icon: <ChatIcon />, action: 'Conversations' },
  { label: 'Progress', icon: <BarChartIcon />, action: 'Profile', requiresAuth: true },
  { label: 'Donation', icon: <FavoriteIcon />, action: 'Donation' },
];

export default function CategoriesHeader({ session, setActiveView, supabase, activeView }) {
  // Filtrar categorias baseado na autenticação
  const visibleCategories = categories.filter(category =>
    !category.requiresAuth || (category.requiresAuth && session)
  );

  // Determinar qual botão deve estar ativo baseado na view atual
  const getActiveIndex = () => {
    const conversationsIndex = visibleCategories.findIndex(cat => cat.action === 'Conversations');
    const donationIndex = visibleCategories.findIndex(cat => cat.action === 'Donation');

    if (activeView === 'Conversations') return conversationsIndex;
    if (activeView === 'Profile') return visibleCategories.findIndex(cat => cat.action === 'Profile');
    if (activeView === 'Donation') return donationIndex;
    return -1; // Nenhum botão ativo quando estiver em Home ou outras páginas
  };

  const activeIndex = getActiveIndex();

  return (
    <div className="categories-header">
      <div className="logo" onClick={() => setActiveView('Home')}>
        <span className="logo-f">F</span>alante
      </div>
      <div className="categories-buttons-container">
        {visibleCategories.map((category, index) => (
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

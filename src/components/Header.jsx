import React from 'react';

export default function Header({ session, setActiveView, supabase, searchTerm, setSearchTerm, activeView }) {
  const showSearch = activeView === 'Conversations';

  if (!showSearch) {
    return null;
  }

  return (
    <header className="header">
      <input
        type="text"
        placeholder="Search conversations"
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </header>
  );
}

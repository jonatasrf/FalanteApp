import React, { useState, useEffect, useRef } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useUserProgress } from '../contexts/UserProgressContext';

export default function UserMenu({ session, setActiveView, supabase }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { userProfile } = useUserProgress();

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setMenuOpen(false);
    }
  };



  useEffect(() => {
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="user-menu" ref={menuRef}>
      <button className="user-menu-button" onClick={handleMenuToggle}>
        <MenuIcon />
        {userProfile?.avatar ? (
          <img
            src={userProfile.avatar}
            alt="Profile"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <AccountCircleIcon />
        )}
      </button>
      {menuOpen && (
        <div className="user-menu-dropdown">
          {session ? (
            <>
              <div className="user-info" style={{
                padding: '10px',
                borderBottom: '1px solid #eee',
                marginBottom: '5px'
              }}>
                {userProfile?.avatar && (
                  <img
                    src={userProfile.avatar}
                    alt="Profile"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginBottom: '5px'
                    }}
                  />
                )}
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {userProfile?.name || 'User'}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {userProfile?.email}
                </div>
              </div>
              <a href="#" onClick={() => { setActiveView('Settings'); setMenuOpen(false); }}>
                Settings
              </a>
              <a href="#" onClick={() => { supabase.auth.signOut(); setMenuOpen(false); }}>
                Logout
              </a>
            </>
          ) : (
            <a href="#" onClick={() => { setActiveView('Login'); setMenuOpen(false); }}>
              Login
            </a>
          )}
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

function Header() {
  const { user, logout } = useAuth();

  return (
    <header>
      <div className="top-right-links">
        {user ? (
          <>
            <Link to="/profile">Profile</Link>
            <button onClick={logout}>Sign Out</button>
          </>
        ) : null}
      </div>
      <img src={require('./download.jpeg')} alt="Image Description" />
      {/* Other header content */}
    </header>
  );
}

export default Header;

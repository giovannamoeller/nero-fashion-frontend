import React, { useState, createContext, useContext } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import ImageDescribe from './ImageDescribe';
import SmartProductSell from './SmartProductSell';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showDescribe, setShowDescribe] = useState(false);
  const [showSmartSell, setShowSmartSell] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      <div className="app-layout">
      <header className="app-header">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <h1>NeroFashion</h1>
          </Link>

          <div className="navbar-search">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          <div className="navbar-actions">
            <button
              className="navbar-button"
              onClick={() => setShowSmartSell(true)}
              title="Find perfect products with AI"
            >
              Smart Find
            </button>
            <button
              className="navbar-button"
              onClick={() => setShowDescribe(true)}
              title="Describe Image with AI"
            >
              AI Describe
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {children}
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>
            © 2025 Product Catalog Demo |
            Made for GKE Turns 10 Hackathon |
            <a
              href="https://github.com/xValentim/microservices-demo"
              target="_blank"
              rel="noopener noreferrer"
            >
              {'  '} Source Code
            </a>
          </p>
        </div>
      </footer>

      {/* Modal de Smart Product Sell */}
      {showSmartSell && (
        <SmartProductSell onClose={() => setShowSmartSell(false)} />
      )}

      {/* Modal de Describe */}
      {showDescribe && (
        <ImageDescribe onClose={() => setShowDescribe(false)} />
      )}
      </div>
    </SearchContext.Provider>
  );
};

export default Layout;

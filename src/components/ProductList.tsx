import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, truncateText } from '../utils/formatters';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { useProducts } from '../hooks/useProducts';
import { useSearch } from './Layout';
import { Eye } from 'lucide-react';

const ProductList: React.FC = () => {
  const { products, loading, error, refetch } = useProducts();
  const { searchQuery } = useSearch();

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }

    const query = searchQuery.toLowerCase().trim();
    return products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      (product.categories && product.categories.some(category => category.toLowerCase().includes(query)))
    );
  }, [products, searchQuery]);

  if (loading) {
    return <LoadingSpinner message="Loading products..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={refetch}
      />
    );
  }

  if (products.length === 0) {
    return (
      <div className="empty-state">
        <h2>No products found</h2>
        <p>The product catalog is currently empty.</p>
      </div>
    );
  }

  if (searchQuery.trim() && filteredProducts.length === 0) {
    return (
      <div className="empty-state">
        <h2>No products found</h2>
        <p>No products match your search for "{searchQuery}". Try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="product-list-container">
      <div className="page-header">
        <div className="header-content-main">
          <h1 className="page-title">
            {searchQuery.trim() ? (
              <>
                <span className="title-main">Search Results for</span>
                <span className="title-text">"{searchQuery}"</span>
              </>
            ) : (
              <>
                <span className="title-main">Discover Amazing Products and</span>
                <span className="title-text">Try Our AI Features</span>
              </>
            )}
          </h1>
          <p className="page-subtitle">
            Curated collection powered by AI • {searchQuery.trim() ? `${filteredProducts.length} of ${products.length} products found` : `${products.length} products available`}
          </p>
        </div>
      </div>

      <div className="product-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
            <Link to={`/product/${product.id}`} className="product-link">
              <div className="product-image-container">
                <div className="product-badge">
                  <span>New</span>
                </div>
                <img
                  src={product.picture}
                  alt={product.name}
                  className="product-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('placeholder-product.svg')) {
                      target.src = '/placeholder-product.svg';
                      target.onerror = null;
                    }
                  }}
                />
                <div className="product-overlay">
                  <div className="overlay-actions">
                    <button className="overlay-btn">
                      <Eye className="btn-icon" />
                      Quick View
                    </button>
                  </div>
                </div>
              </div>

              <div className="product-info">
                <div className="product-header">
                  <h3 className="product-name">{product.name}</h3>
                </div>

                <p className="product-description">
                  {truncateText(product.description, 100)}
                </p>

                <div className="product-footer">
                  <div className="product-price">
                    {formatPrice(product.price)}
                  </div>
                </div>

                {product.categories && product.categories.length > 0 && (
                  <div className="product-categories">
                    {product.categories.map((category) => (
                      <span key={category} className="category-tag">
                        {category}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;

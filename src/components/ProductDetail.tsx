import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatters';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import ImageRemix from './ImageRemix';
import ImageDescribe from './ImageDescribe';
import FashionAssistant from './FashionAssistant';
import { useProduct } from '../hooks/useProducts';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error, refetch } = useProduct(id);
  const [showRemix, setShowRemix] = useState(false);
  const [showDescribe, setShowDescribe] = useState(false);
  const [showFashion, setShowFashion] = useState(false);

  if (loading) {
    return <LoadingSpinner message="Loading product details..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={refetch}
      />
    );
  }

  if (!product) {
    return (
      <div className="empty-state">
        <h2>Product not found</h2>
        <p>The requested product could not be found.</p>
        <Link to="/" className="btn btn-primary">
          ← Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="breadcrumb">
        <Link to="/" className="breadcrumb-link">Products</Link>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">{product.name}</span>
      </div>

      <div className="product-detail">
        <div className="product-detail-image">
          <img
            src={product.picture}
            alt={product.name}
            className="detail-image"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('placeholder-product.svg')) {
                target.src = '/placeholder-product.svg';
                target.onerror = null;
              }
            }}
          />
        </div>

        <div className="product-detail-info">
          <h1 className="product-title">{product.name}</h1>

          <div className="product-price-large">
            {formatPrice(product.price)}
          </div>

          <div className="product-description-full">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          {product.categories && product.categories.length > 0 && (
            <div className="product-categories-detail">
              <h3>Categories</h3>
              <div className="categories-list">
                {product.categories.map((category) => (
                  <span key={category} className="category-tag-large">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="product-actions">
            {/* AI Features - Primary Focus */}
            <div className="ai-features-section">
              <h4>Explore this Product with AI</h4>
              <div className="ai-buttons-grid">
                <button
                  className="btn btn-secondary btn-large ai-feature-btn"
                  onClick={() => setShowRemix(true)}
                >
                  Try with AI
                  <span className="btn-subtitle">Mix with other products</span>
                </button>
                <button
                  className="btn btn-secondary btn-large ai-feature-btn"
                  onClick={() => setShowFashion(true)}
                  title="Get personalized fashion advice using this product"
                >
                  Fashion AI
                  <span className="btn-subtitle">Style recommendations</span>
                </button>
                <button
                  className="btn btn-secondary btn-large ai-feature-btn"
                  onClick={() => setShowDescribe(true)}
                  title="Generate AI description of this product"
                >
                  AI Describe
                  <span className="btn-subtitle">Detailed analysis</span>
                </button>
              </div>
            </div>

            {/* Add to Cart - Secondary */}
            <div className="purchase-section">
              <button className="btn btn-secondary add-to-cart-btn" title="Add to Cart">
                <span className="cart-icon">🛒</span>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Remix */}
      {showRemix && (
        <ImageRemix
          product={product}
          onClose={() => setShowRemix(false)}
        />
      )}

      {/* Modal de Fashion Assistant */}
      {showFashion && (
        <FashionAssistant
          product={product}
          onClose={() => setShowFashion(false)}
        />
      )}

      {/* Modal de Describe */}
      {showDescribe && (
        <ImageDescribe
          defaultType="product"
          product={product}
          onClose={() => setShowDescribe(false)}
        />
      )}
    </div>
  );
};

export default ProductDetail;

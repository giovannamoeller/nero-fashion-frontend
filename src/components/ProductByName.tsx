import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatters';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { useProductByName } from '../hooks/useProducts';

const ProductByName: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const decodedName = name ? decodeURIComponent(name) : '';
  const { product, loading, error, refetch } = useProductByName(decodedName);

  if (loading) {
    return <LoadingSpinner message={`Loading product "${decodedName}"...`} />;
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
        <p>No product found with the name "{decodedName}".</p>
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

          <div className="product-meta">
            <div className="meta-item">
              <strong>Product ID:</strong> {product.id}
            </div>
            <div className="meta-item">
              <strong>Price:</strong> {formatPrice(product.price)}
            </div>
          </div>

          <div className="product-actions">
            <button className="btn btn-primary btn-large">
              Add to Cart
            </button>
            <Link to="/" className="btn btn-secondary">
              ← Back to Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductByName;

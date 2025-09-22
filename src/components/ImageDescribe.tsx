import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DescribeType } from '../services/describeService';
import { useDescribe } from '../hooks/useDescribe';
import { Product } from '../types/Product';
import { formatPrice } from '../utils/formatters';
import ImageUpload from './ImageUpload';
import LoadingSpinner from './LoadingSpinner';

interface ImageDescribeProps {
  onClose: () => void;
  defaultType?: DescribeType;
  product?: Product; // Product for automatic analysis
}

const ImageDescribe: React.FC<ImageDescribeProps> = ({
  onClose,
  defaultType = 'product',
  product
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [describeType, setDescribeType] = useState<DescribeType>(defaultType);
  const [copySuccessDescription, setCopySuccessDescription] = useState(false);
  const [copySuccessAlt, setCopySuccessAlt] = useState(false);
  const [isLoadingProductImage, setIsLoadingProductImage] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const {
    isLoading,
    error,
    result,
    altText,
    describeImage,
    reset,
    copyDescription,
    copyAltText
  } = useDescribe();

  // Check if speech synthesis is supported
  useEffect(() => {
    setSpeechSupported('speechSynthesis' in window);
  }, []);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (speechRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Voice-over functions
  const playDescription = () => {
    if (!speechSupported || !result?.description) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(result.description);
    speechRef.current = utterance;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    // Configure speech settings
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  };

  const pauseDescription = () => {
    if (!speechSupported) return;

    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resumeDescription = () => {
    if (!speechSupported) return;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stopDescription = () => {
    if (!speechSupported) return;

    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  // Function to convert product image URL to File
  const loadProductImage = async (imageUrl: string, productName: string): Promise<File> => {
    try {
      setIsLoadingProductImage(true);

      // Construir URL completa se necessário
      const fullImageUrl = imageUrl.startsWith('http')
        ? imageUrl
        : `${window.location.origin}${imageUrl}`;

      const response = await fetch(fullImageUrl);
      if (!response.ok) {
        throw new Error('Failed to load product image');
      }

      const blob = await response.blob();
      const filename = `${productName.toLowerCase().replace(/\s+/g, '-')}.jpg`;

      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      console.error('Error loading product image:', error);
      throw new Error('Could not load product image');
    } finally {
      setIsLoadingProductImage(false);
    }
  };

  // Effect to load product image automatically
  useEffect(() => {
    if (product && describeType === 'product') {
      const loadImage = async () => {
        try {
          const file = await loadProductImage(product.picture, product.name);
          setSelectedImage(file);
        } catch (error) {
          console.error('Failed to load product image:', error);
        }
      };

      loadImage();
    }
  }, [product, describeType]);

  const handleDescribe = async () => {
    if (!selectedImage) {
      alert('Please select an image first');
      return;
    }

    try {
      await describeImage({
        image: selectedImage,
        type_prompt: describeType,
      });
    } catch (error) {
      console.error('Description failed:', error);
    }
  };

  const handleCopyDescription = async () => {
    const success = await copyDescription();
    if (success) {
      setCopySuccessDescription(true);
      setTimeout(() => setCopySuccessDescription(false), 2000);
    }
  };

  const handleCopyAltText = async () => {
    const success = await copyAltText();
    if (success) {
      setCopySuccessAlt(true);
      setTimeout(() => setCopySuccessAlt(false), 2000);
    }
  };

  const handleReset = () => {
    reset();
    stopDescription(); // Stop any playing speech
    setSelectedImage(null);
    setCopySuccessDescription(false);
    setCopySuccessAlt(false);
  };

  const typeDescriptions = {
    product: {
      title: 'Product Description',
      description: 'Get detailed descriptions of product features, colors, materials, and design elements.',
      example: 'Perfect for e-commerce catalogs, inventory management, and accessibility.'
    },
    person: {
      title: 'Person Description',
      description: 'Generate descriptions of people including clothing, pose, appearance, and setting.',
      example: 'Ideal for accessibility, content moderation, and image categorization.'
    }
  };

  return (
    <div className="image-describe-modal">
      <div className="describe-overlay" onClick={onClose}></div>
      <div className="describe-content">
        <div className="describe-header">
          <h2>AI Image Description</h2>
          <p>
            {product
              ? `Generate description for ${product.name}`
              : 'Generate detailed, accessible descriptions of your images'
            }
          </p>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="describe-body">
          {!result ? (
            <div className="describe-setup">
              {/* Type Selection - Only show if no product provided */}
              {!product && (
                <div className="type-selection">
                  <h3>What are you describing?</h3>
                  <div className="type-options">
                    {Object.entries(typeDescriptions).map(([type, info]) => (
                      <label key={type} className="type-option">
                        <input
                          type="radio"
                          name="describeType"
                          value={type}
                          checked={describeType === type}
                          onChange={(e) => setDescribeType(e.target.value as DescribeType)}
                        />
                        <div className="type-content">
                          <h4>{info.title}</h4>
                          <p>{info.description}</p>
                          <span className="type-example">{info.example}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Image Display or Image Upload */}
              <div className="image-upload-section">
                {product && describeType === 'product' ? (
                  <div className="product-analysis-section">
                    <h3>Product to Analyze</h3>
                    <div className="product-image-analysis">
                      <img src={product.picture} alt={product.name} className="product-analysis-image" />
                      <div className="product-analysis-info">
                        <h4>{product.name}</h4>
                        <p>{product.description}</p>
                        <div className="product-analysis-meta">
                          <span>Price: {formatPrice(product.price)}</span>
                          {product.categories && product.categories.length > 0 && (
                            <span>Categories: {product.categories.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isLoadingProductImage && <p>Loading product image...</p>}
                  </div>
                ) : (
                  <ImageUpload
                    label="Upload Image"
                    description={`Upload ${describeType === 'product' ? 'a product photo' : 'a photo of a person'} to get an AI-generated description`}
                    onImageSelect={setSelectedImage}
                    maxSize={10}
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="describe-actions">
                {isLoading ? (
                  <LoadingSpinner message="Analyzing image with AI..." />
                ) : (
                  <button
                    className="btn btn-primary btn-large describe-button"
                    onClick={handleDescribe}
                    disabled={!selectedImage}
                  >
                    Describe Image
                  </button>
                )}
                {error && <div className="error-message">{error}</div>}
              </div>
            </div>
          ) : (
            <div className="describe-result">
              <h3>Description Generated</h3>

              {/* Image Preview */}
              {selectedImage && (
                <div className="result-image-preview">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Analyzed image"
                    className="analyzed-image"
                  />
                </div>
              )}

              {/* Full Description */}
              <div className="description-section">
                <div className="section-header">
                  <h4>Full Description</h4>
                  <div className="header-actions">
                    {speechSupported && (
                      <div className="voice-controls" role="group" aria-label="Voice playback controls">
                        {!isPlaying ? (
                          <button
                            className="voice-button play-button"
                            onClick={playDescription}
                            aria-label="Play description with text-to-speech"
                            title="Play description"
                          >
                            🔊 Play
                          </button>
                        ) : (
                          <>
                            {!isPaused ? (
                              <button
                                className="voice-button pause-button"
                                onClick={pauseDescription}
                                aria-label="Pause text-to-speech"
                                title="Pause"
                              >
                                ⏸️ Pause
                              </button>
                            ) : (
                              <button
                                className="voice-button resume-button"
                                onClick={resumeDescription}
                                aria-label="Resume text-to-speech"
                                title="Resume"
                              >
                                ▶️ Resume
                              </button>
                            )}
                            <button
                              className="voice-button stop-button"
                              onClick={stopDescription}
                              aria-label="Stop text-to-speech"
                              title="Stop"
                            >
                              ⏹️ Stop
                            </button>
                          </>
                        )}
                      </div>
                    )}
                    <button
                      className={`copy-button ${copySuccessDescription ? 'copied' : ''}`}
                      onClick={handleCopyDescription}
                      aria-label="Copy description to clipboard"
                    >
                      {copySuccessDescription ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="description-content" aria-live="polite">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Customize markdown rendering if needed
                      p: ({ children }) => <p className="markdown-paragraph">{children}</p>,
                      h1: ({ children }) => <h1 className="markdown-h1">{children}</h1>,
                      h2: ({ children }) => <h2 className="markdown-h2">{children}</h2>,
                      h3: ({ children }) => <h3 className="markdown-h3">{children}</h3>,
                      ul: ({ children }) => <ul className="markdown-list">{children}</ul>,
                      ol: ({ children }) => <ol className="markdown-ordered-list">{children}</ol>,
                      li: ({ children }) => <li className="markdown-list-item">{children}</li>,
                      strong: ({ children }) => <strong className="markdown-bold">{children}</strong>,
                      em: ({ children }) => <em className="markdown-italic">{children}</em>,
                      code: ({ children }) => <code className="markdown-code">{children}</code>,
                      blockquote: ({ children }) => <blockquote className="markdown-blockquote">{children}</blockquote>
                    }}
                  >
                    {result.description}
                  </ReactMarkdown>
                  {!speechSupported && (
                    <p className="voice-not-supported">
                      <small>Text-to-speech is not supported in your browser</small>
                    </p>
                  )}
                </div>
              </div>

              {/* Alt Text Suggestion */}
              {altText && (
                <div className="alt-text-section">
                  <div className="section-header">
                    <h4>Suggested Alt Text</h4>
                    <button
                      className={`copy-button ${copySuccessAlt ? 'copied' : ''}`}
                      onClick={handleCopyAltText}
                    >
                      {copySuccessAlt ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="alt-text-content">
                    <code>{altText}</code>
                    <p className="alt-text-help">
                      This is a concise version optimized for screen readers (≤125 characters)
                    </p>
                  </div>
                </div>
              )}

              {/* Meta Information */}
              <div className="meta-section">
                <h4>Analysis Details</h4>
                <div className="meta-grid">
                  <div className="meta-item">
                    <strong>Image ID:</strong> <code>{result.image_id}</code>
                  </div>
                  <div className="meta-item">
                    <strong>Analysis Type:</strong> {describeType === 'product' ? 'Product' : ' Person'}
                  </div>
                  <div className="meta-item">
                    <strong>Description Length:</strong> {result.description.length} characters
                  </div>
                  <div className="meta-item">
                    <strong>Alt Text Length:</strong> {altText?.length || 0} characters
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="result-actions">
                <button className="btn btn-primary" onClick={handleReset}>
                  Analyze Another Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageDescribe;

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Product } from '../types/Product';
import { formatPrice } from '../utils/formatters';
import { useFashion } from '../hooks/useFashion';
import ImageUpload from './ImageUpload';
import LoadingSpinner from './LoadingSpinner';

interface FashionAssistantProps {
  onClose: () => void;
  product: Product;
}

const FashionAssistant: React.FC<FashionAssistantProps> = ({
  onClose,
  product
}) => {
  const [userImage, setUserImage] = useState<File | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const {
    isLoading,
    error,
    result,
    getFashionAdvice,
    reset,
  } = useFashion();

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
  const playAdvice = () => {
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

  const pauseAdvice = () => {
    if (!speechSupported) return;

    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resumeAdvice = () => {
    if (!speechSupported) return;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stopAdvice = () => {
    if (!speechSupported) return;

    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleGetAdvice = async () => {
    if (!userImage) {
      alert('Please upload a photo of yourself wearing the product first');
      return;
    }

    try {
      await getFashionAdvice({ image: userImage });
    } catch (error) {
      console.error('Fashion advice failed:', error);
    }
  };

  const handleCopyAdvice = async () => {
    if (!result?.description) return;

    try {
      await navigator.clipboard.writeText(result.description);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy advice:', err);
    }
  };

  const handleStartOver = () => {
    reset();
    stopAdvice(); // Stop any playing speech
    setUserImage(null);
  };


  return (
    <div className="fashion-assistant-modal">
      <div className="fashion-overlay" onClick={onClose}></div>
      <div className="fashion-content">
        <div className="fashion-header">
          <h2>Fashion Assistant AI</h2>
          <p>Get personalized fashion tips using this product</p>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="fashion-body">
          {!result ? (
            <div className="fashion-setup">
              {/* Product Info */}
              <div className="fashion-product-info">
                <h3>Product Being Analyzed</h3>
                <div className="fashion-product-card">
                  <img src={product.picture} alt={product.name} className="fashion-product-image" />
                  <div className="fashion-product-details">
                    <h4>{product.name}</h4>
                    <p className="fashion-product-price">{formatPrice(product.price)}</p>
                    <p className="fashion-product-desc">{product.description}</p>
                  </div>
                </div>
              </div>

              {/* User Image Upload */}
              <div className="fashion-upload-section">
                <h3>Your Photo with the Product</h3>
                <p className="fashion-upload-description">
                  Upload a photo of yourself wearing this product (or a similar one) to receive personalized fashion tips and outfit combinations.
                </p>
                <ImageUpload
                  label="Upload Your Photo"
                  description="Your photo wearing the product for style analysis"
                  onImageSelect={setUserImage}
                  maxSize={10}
                />
              </div>

              {/* Action Buttons */}
              <div className="fashion-actions">
                {isLoading ? (
                  <LoadingSpinner message="Analyzing your style with AI..." />
                ) : (
                  <button
                    className="btn btn-primary fashion-analyze-btn"
                    onClick={handleGetAdvice}
                    disabled={!userImage}
                  >
                    Analyze My Style
                  </button>
                )}

                {error && (
                  <div className="fashion-error">
                    <p>Error: {error}</p>
                    <button className="btn btn-secondary" onClick={reset}>
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="fashion-results">
              {/* Results Header */}
              <div className="fashion-results-header">
                <h3>Your Personalized Style Analysis</h3>
                <p>Here are your exclusive fashion tips!</p>
              </div>

              {/* Fashion Advice */}
              <div className="fashion-advice-container">
                <div className="section-header">
                  <h4>Fashion Tips</h4>
                  <div className="header-actions">
                    {speechSupported && (
                      <div className="voice-controls" role="group" aria-label="Voice playback controls">
                        {!isPlaying ? (
                          <button
                            className="voice-button play-button"
                            onClick={playAdvice}
                            aria-label="Play fashion advice with text-to-speech"
                            title="Play advice"
                          >
                            🔊 Play
                          </button>
                        ) : (
                          <>
                            {!isPaused ? (
                              <button
                                className="voice-button pause-button"
                                onClick={pauseAdvice}
                                aria-label="Pause text-to-speech"
                                title="Pause"
                              >
                                ⏸️ Pause
                              </button>
                            ) : (
                              <button
                                className="voice-button resume-button"
                                onClick={resumeAdvice}
                                aria-label="Resume text-to-speech"
                                title="Resume"
                              >
                                ▶️ Resume
                              </button>
                            )}
                            <button
                              className="voice-button stop-button"
                              onClick={stopAdvice}
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
                      className={`copy-button ${copySuccess ? 'copied' : ''}`}
                      onClick={handleCopyAdvice}
                      aria-label="Copy fashion advice to clipboard"
                    >
                      {copySuccess ? 'Copied!' : 'Copy Tips'}
                    </button>
                  </div>
                </div>
                <div className="fashion-advice-text" aria-live="polite">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Customize markdown rendering to match existing fashion styles
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

              {/* Action Buttons */}
              <div className="fashion-results-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleStartOver}
                >
                  New Analysis
                </button>
              </div>

              {/* Metadata */}
              <div className="fashion-metadata">
                <small>Analysis ID: {result.image_id}</small>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FashionAssistant;

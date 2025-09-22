import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import { useSmartSell } from '../hooks/useSmartSell';
import ImageUpload from './ImageUpload';
import LoadingSpinner from './LoadingSpinner';

interface SmartProductSellProps {
  onClose: () => void;
}

const SmartProductSell: React.FC<SmartProductSellProps> = ({ onClose }) => {
  const [userImage, setUserImage] = useState<File | null>(null);
  const [queryText, setQueryText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const {
    isLoading,
    error,
    result,
    getRecommendation,
    reset,
    copyRecommendation,
  } = useSmartSell();

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
  const playRecommendation = () => {
    if (!speechSupported || !result?.sell_text) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(result.sell_text);
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

  const pauseRecommendation = () => {
    if (!speechSupported) return;

    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resumeRecommendation = () => {
    if (!speechSupported) return;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stopRecommendation = () => {
    if (!speechSupported) return;

    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  // Predefined query suggestions
  const querySuggestions = [
    "I would like sunglasses for summer use",
    "I need an elegant shirt for work",
    "I want comfortable sneakers for sports",
    "I'm looking for a modern accessory to complete my look",
    "I need something casual for everyday wear",
    "I want a statement piece for a special occasion"
  ];

  const handleGetRecommendation = async () => {
    if (!userImage) {
      alert('Please upload a photo of yourself first');
      return;
    }

    if (!queryText.trim()) {
      alert('Please describe what you are looking for');
      return;
    }

    try {
      await getRecommendation({
        image: userImage,
        text: queryText.trim(),
        model_name: 'gemini-1.5-pro',
        stream: false,
      });
    } catch (error) {
      console.error('Recommendation failed:', error);
    }
  };

  const handleCopyRecommendation = async () => {
    const success = await copyRecommendation();
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQueryText(suggestion);
  };

  const handleStartOver = () => {
    reset();
    stopRecommendation(); // Stop any playing speech
    setUserImage(null);
    setQueryText('');
  };


  return (
    <div className="smart-sell-modal">
      <div className="smart-sell-overlay" onClick={onClose}></div>
      <div className="smart-sell-content">
        <div className="smart-sell-header">
          <h2>Smart Product Recommender</h2>
          <p>Upload your photo + description and discover the perfect product for you!</p>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="smart-sell-body">
          {!result ? (
            <div className="smart-sell-setup">
              {/* User Image Upload */}
              <div className="smart-sell-image-section">
                <h3>Your Photo</h3>
                <p className="smart-sell-image-description">
                  Upload a photo of yourself so we can personalize recommendations based on your style.
                </p>
                <ImageUpload
                  label="Upload Your Photo"
                  description="Photo for personalized style analysis"
                  onImageSelect={setUserImage}
                  maxSize={10}
                />
              </div>

              {/* Query Text Input */}
              <div className="smart-sell-query-section">
                <h3>What are you looking for?</h3>
                <p className="smart-sell-query-description">
                  Describe in detail the product you would like to find. Be specific about occasion, style, colors, etc.
                </p>

                <textarea
                  className="smart-sell-query-input"
                  placeholder="Ex: I would like sunglasses for summer, something modern and elegant..."
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  rows={4}
                />

                {/* Quick Suggestions */}
                <div className="smart-sell-suggestions">
                  <h4>Quick suggestions:</h4>
                  <div className="suggestion-buttons">
                    {querySuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="suggestion-btn"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="smart-sell-actions">
                {isLoading ? (
                  <LoadingSpinner message="Analyzing and searching for perfect products..." />
                ) : (
                  <button
                    className="btn btn-primary smart-sell-btn"
                    onClick={handleGetRecommendation}
                    disabled={!userImage || !queryText.trim()}
                  >
                    Find Perfect Product
                  </button>
                )}

                {error && (
                  <div className="smart-sell-error">
                    <p>Error: {error}</p>
                    <button className="btn btn-secondary" onClick={reset}>
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="smart-sell-results">

              {/* Product Found Section */}
              <div className="smart-sell-product-found">
                <div className="product-found-header">
                  <h4>Perfect Match Found!</h4>
                  <p>We found the ideal product for you</p>
                </div>

                <div className="product-found-card">
                  <div className="product-found-info">
                    <h5>{result.product_name}</h5>
                    <p className="product-id-text">Product ID: {result.product_id}</p>
                    <Link
                      to={`/product/${result.product_id}`}
                      className="btn btn-primary view-product-btn"
                      onClick={onClose}
                    >
                      View Product Details
                    </Link>
                  </div>
                  <div className="product-found-image">
                    <img
                      src={`data:image/jpeg;base64,${result.image_base64}`}
                      alt={result.product_name}
                      className="found-product-img"
                    />
                  </div>
                </div>
              </div>

              {/* Product Recommendation */}
              <div className="smart-sell-recommendation">

                {/* Sell Text */}
                <div className="smart-sell-text-container">
                  <div className="section-header">
                    <h4>Why this product is perfect for you:</h4>
                    <div className="header-actions">
                      {speechSupported && (
                        <div className="voice-controls" role="group" aria-label="Voice playback controls">
                          {!isPlaying ? (
                            <button
                              className="voice-button play-button"
                              onClick={playRecommendation}
                              aria-label="Play recommendation with text-to-speech"
                              title="Play recommendation"
                            >
                              🔊 Play
                            </button>
                          ) : (
                            <>
                              {!isPaused ? (
                                <button
                                  className="voice-button pause-button"
                                  onClick={pauseRecommendation}
                                  aria-label="Pause text-to-speech"
                                  title="Pause"
                                >
                                  ⏸️ Pause
                                </button>
                              ) : (
                                <button
                                  className="voice-button resume-button"
                                  onClick={resumeRecommendation}
                                  aria-label="Resume text-to-speech"
                                  title="Resume"
                                >
                                  ▶️ Resume
                                </button>
                              )}
                              <button
                                className="voice-button stop-button"
                                onClick={stopRecommendation}
                                aria-label="Stop text-to-speech"
                                title="Stop"
                              >
                                ⏹️ Stop
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="smart-sell-text" aria-live="polite">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Customize markdown rendering
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
                      {result.sell_text}
                    </ReactMarkdown>
                    {!speechSupported && (
                      <p className="voice-not-supported">
                        <small>💡 Text-to-speech is not supported in your browser</small>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="smart-sell-results-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleCopyRecommendation}
                >
                  {copySuccess ? 'Copied!' : 'Copy Recommendation'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleStartOver}
                >
                  New Search
                </button>
              </div>

              {/* Metadata */}
              <div className="smart-sell-metadata">
                <small>Recommendation ID: {result.image_id}</small>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartProductSell;

import React, { useState } from 'react';
import { Product } from '../types/Product';
import { useRemix } from '../hooks/useRemix';
import ImageUpload from './ImageUpload';
import LoadingSpinner from './LoadingSpinner';

interface ImageRemixProps {
  product: Product;
  onClose: () => void;
}

const ImageRemix: React.FC<ImageRemixProps> = ({ product, onClose }) => {
  const [userImage, setUserImage] = useState<File | null>(null);
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);

  const { isLoading, error, resultUrl, remixImages, reset, downloadResult } = useRemix();

  // Predefined prompts based on product category
  const getDefaultPrompts = (product: Product): string[] => {
    const category = (product.categories && product.categories.length > 0)
      ? product.categories[0].toLowerCase()
      : '';

    const prompts: Record<string, string[]> = {
      'accessories': [
        `Place the ${product.name.toLowerCase()} on the person in a natural and stylish way.`,
        `Show the person wearing the ${product.name.toLowerCase()} elegantly.`,
        `Create a natural photo of the person using the ${product.name.toLowerCase()}.`,
      ],
      'clothing': [
        `Dress the person with the ${product.name.toLowerCase()} in a fashionable way.`,
        `Show the person wearing the ${product.name.toLowerCase()} stylishly.`,
        `Create a natural outfit with the person wearing the ${product.name.toLowerCase()}.`,
      ],
      'footwear': [
        `Show the person wearing the ${product.name.toLowerCase()} on their feet naturally.`,
        `Place the ${product.name.toLowerCase()} on the person's feet in a stylish way.`,
        `Create a natural photo of the person wearing the ${product.name.toLowerCase()}.`,
      ],
      'beauty': [
        `Show the person using the ${product.name.toLowerCase()} in a natural way.`,
        `Create a lifestyle photo of the person with the ${product.name.toLowerCase()}.`,
        `Place the ${product.name.toLowerCase()} near the person in a natural setting.`,
      ],
      'kitchen': [
        `Show the person using the ${product.name.toLowerCase()} in a kitchen setting.`,
        `Create a lifestyle photo of the person with the ${product.name.toLowerCase()}.`,
        `Place the ${product.name.toLowerCase()} in the person's hands naturally.`,
      ],
      'home': [
        `Show the person with the ${product.name.toLowerCase()} in a home setting.`,
        `Create a lifestyle photo featuring the person and the ${product.name.toLowerCase()}.`,
        `Place the ${product.name.toLowerCase()} near the person in a natural way.`,
      ],
    };

    return prompts[category] || [
      `Create a natural photo combining the person with the ${product.name.toLowerCase()}.`,
      `Show the person with the ${product.name.toLowerCase()} in a lifestyle setting.`,
      `Blend the person and ${product.name.toLowerCase()} in a natural way.`,
    ];
  };

  const defaultPrompts = getDefaultPrompts(product);

  // Convert product image URL to File
  const convertImageToFile = async (imageUrl: string, filename: string): Promise<File> => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      throw new Error('Failed to load product image');
    }
  };

  const handleRemix = async () => {
    if (!userImage) {
      alert('Please select your photo first');
      return;
    }

    if (!prompt.trim() && !customPrompt.trim()) {
      alert('Please select or enter a prompt');
      return;
    }

    try {
      // Convert product image to File if not done yet
      let productFile = productImageFile;
      if (!productFile) {
        const productImageUrl = product.picture.startsWith('http')
          ? product.picture
          : `${window.location.origin}${product.picture}`;

        productFile = await convertImageToFile(
          productImageUrl,
          `${product.name.toLowerCase().replace(/\s+/g, '-')}.jpg`
        );
        setProductImageFile(productFile);
      }

      const finalPrompt = useCustomPrompt ? customPrompt.trim() : prompt;

      await remixImages({
        image1: userImage,
        image2: productFile,
        prompt: finalPrompt,
        stream: false,
      });
    } catch (error) {
      console.error('Remix failed:', error);
    }
  };

  const handleDownload = () => {
    const filename = `remix-${product.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
    downloadResult(filename);
  };

  const handleReset = () => {
    reset();
    setUserImage(null);
    setProductImageFile(null);
    setPrompt('');
    setCustomPrompt('');
    setUseCustomPrompt(false);
  };

  return (
    <div className="image-remix-modal">
      <div className="remix-overlay" onClick={onClose}></div>
      <div className="remix-content">
        <div className="remix-header">
          <h2>AI Image Remix</h2>
          <p>Combine your photo with <strong>{product.name}</strong></p>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="remix-body">
          {!resultUrl ? (
            <div className="remix-setup">
              <div className="remix-images">
                <div className="image-section">
                  <ImageUpload
                    label="Your Photo"
                    description="Upload a photo of yourself"
                    onImageSelect={setUserImage}
                    maxSize={10}
                  />
                </div>

                <div className="remix-plus">+</div>

                <div className="image-section">
                  <div className="product-image-container">
                    <h4>Product Image</h4>
                    <div className="product-image-preview">
                      <img
                        src={product.picture}
                        alt={product.name}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes('placeholder-product.svg')) {
                            target.src = '/placeholder-product.svg';
                            target.onerror = null;
                          }
                        }}
                      />
                      <p>{product.name}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="prompt-section">
                <h4>Choose Style</h4>
                <div className="prompt-options">
                  {!useCustomPrompt ? (
                    <div className="preset-prompts">
                      {defaultPrompts.map((presetPrompt, index) => (
                        <label key={index} className="prompt-option">
                          <input
                            type="radio"
                            name="prompt"
                            value={presetPrompt}
                            checked={prompt === presetPrompt}
                            onChange={(e) => setPrompt(e.target.value)}
                          />
                          <span>{presetPrompt}</span>
                        </label>
                      ))}
                      <button
                        className="custom-prompt-button"
                        onClick={() => setUseCustomPrompt(true)}
                      >
                        Write custom prompt
                      </button>
                    </div>
                  ) : (
                    <div className="custom-prompt">
                      <textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="Describe how you want the images to be combined..."
                        rows={3}
                        className="custom-prompt-textarea"
                      />
                      <button
                        className="preset-prompts-button"
                        onClick={() => setUseCustomPrompt(false)}
                      >
                        ← Back to presets
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="remix-actions">
                {isLoading ? (
                  <LoadingSpinner message="Creating your AI remix..." />
                ) : (
                  <button
                    className="btn btn-primary btn-large remix-button"
                    onClick={handleRemix}
                    disabled={!userImage || (!prompt && !customPrompt.trim())}
                  >
                    Try it right now
                  </button>
                )}
                {error && <div className="error-message">{error}</div>}
              </div>
            </div>
          ) : (
            <div className="remix-result">
              <h3>Your Image is Ready!</h3>
              <div className="result-image-container">
                <img src={resultUrl} alt="AI Remix Result" className="result-image" />
              </div>
              <div className="result-actions">
                <button className="btn btn-primary" onClick={handleDownload}>
                  Download Image
                </button>
                <button className="btn btn-secondary" onClick={handleReset}>
                  Create Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageRemix;

import React, { useRef, useState, useEffect } from 'react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // em MB
  preview?: boolean;
  label: string;
  description?: string;
  currentImage?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  accept = 'image/*',
  maxSize = 10,
  preview = true,
  label,
  description,
  currentImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentImage) {
      setPreviewUrl(currentImage);
    }
  }, [currentImage]);

  const validateFile = (file: File): string | null => {
    // Verificar tipo
    if (!file.type.startsWith('image/')) {
      return 'Please select a valid image file.';
    }

    // Verificar tamanho
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      return `File size must be less than ${maxSize}MB.`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onImageSelect(file);

    if (preview) {
      // Limpar URL anterior
      if (previewUrl && !currentImage) {
        URL.revokeObjectURL(previewUrl);
      }

      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && !currentImage) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, currentImage]);

  return (
    <div className="image-upload-container">
      <label className="image-upload-label">{label}</label>
      {description && <p className="image-upload-description">{description}</p>}

      <div
        className={`image-upload-area ${dragOver ? 'drag-over' : ''} ${error ? 'error' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        {previewUrl ? (
          <div className="image-preview">
            <img src={previewUrl} alt="Preview" className="preview-image" />
            <div className="image-overlay">
              <span>Click or drop to change</span>
            </div>
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon">📸</div>
            <p>Click or drag & drop your image here</p>
            <span className="upload-hint">
              Supports: JPG, PNG, GIF (max {maxSize}MB)
            </span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="file-input-hidden"
          style={{ display: 'none' }}
        />
      </div>

      {error && <div className="upload-error">{error}</div>}
    </div>
  );
};

export default ImageUpload;

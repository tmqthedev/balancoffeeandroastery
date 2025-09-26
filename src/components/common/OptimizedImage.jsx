import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

const OptimizedImage = ({
  src,
  alt,
  className = '',
  placeholder = '/images/placeholder.jpg',
  loading = 'lazy',
  width,
  height,
  sizes,
  quality = 80,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholder);

  // Generate optimized image URL with quality parameter
  const getOptimizedSrc = useCallback((originalSrc, targetWidth, targetQuality = quality) => {
    if (!originalSrc) return placeholder;
    
    // If it's already a placeholder or external URL, return as is
    if (originalSrc === placeholder || originalSrc.startsWith('http') || originalSrc.startsWith('data:')) {
      return originalSrc;
    }

    // For local images, we can add query parameters for optimization
    const separator = originalSrc.includes('?') ? '&' : '?';
    return `${originalSrc}${separator}w=${targetWidth || width || 'auto'}&q=${targetQuality}`;
  }, [placeholder, quality, width]);

  // Preload image
  const preloadImage = useCallback(() => {
    if (!src || src === placeholder) return;

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(getOptimizedSrc(src, width, quality));
      setIsLoaded(true);
      setIsError(false);
      if (onLoad) onLoad();
    };

    img.onerror = () => {
      setIsError(true);
      setIsLoaded(false);
      setImageSrc(placeholder);
      if (onError) onError();
    };

    // Set src to start loading
    img.src = getOptimizedSrc(src, width, quality);
  }, [src, width, quality, placeholder, getOptimizedSrc, onLoad, onError]);

  useEffect(() => {
    // Use Intersection Observer for lazy loading
    if (loading === 'lazy') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            preloadImage();
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      const element = document.querySelector(`[data-src="${src}"]`);
      if (element) {
        observer.observe(element);
      } else {
        // Fallback: load immediately if element not found
        preloadImage();
      }

      return () => observer.disconnect();
    } else {
      // Load immediately if not lazy
      preloadImage();
    }
  }, [src, loading, preloadImage]);

  // Generate responsive srcSet for different screen sizes
  const generateSrcSet = useCallback(() => {
    if (!src || src === placeholder) return '';

    const breakpoints = [320, 480, 768, 1024, 1200, 1600];
    return breakpoints
      .map(bp => `${getOptimizedSrc(src, bp)} ${bp}w`)
      .join(', ');
  }, [src, placeholder, getOptimizedSrc]);

  return (
    <div className="relative overflow-hidden">
      {/* Placeholder/Blur effect */}
      {!isLoaded && !isError && (
        <div 
          className={`absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse ${className}`}
          style={{ width, height }}
        />
      )}

      {/* Main Image */}
      <img
        src={imageSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        srcSet={generateSrcSet()}
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'}
        width={width}
        height={height}
        loading={loading}
        data-src={src} // For intersection observer
        decoding="async"
        {...props}
      />

      {/* Error state */}
      {isError && (
        <div 
          className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}
          style={{ width, height }}
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  loading: PropTypes.oneOf(['lazy', 'eager']),
  width: PropTypes.number,
  height: PropTypes.number,
  sizes: PropTypes.string,
  quality: PropTypes.number,
  onLoad: PropTypes.func,
  onError: PropTypes.func
};

export default OptimizedImage;
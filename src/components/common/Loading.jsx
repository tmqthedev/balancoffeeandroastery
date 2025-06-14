import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'brand-primary', 
  message = 'Đang tải...', 
  fullScreen = false,
  className = ''
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xlarge: 'h-16 w-16'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-white bg-opacity-90 flex justify-center items-center z-50'
    : 'flex justify-center items-center py-8';
  return (
    <div className={`${containerClasses} ${className}`} aria-live="polite">
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-${color} ${sizeClasses[size]} mx-auto mb-3`}></div>
        <span className="text-gray-600 text-sm font-medium" aria-label={message}>
          {message}
        </span>
      </div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
  color: PropTypes.string,
  message: PropTypes.string,
  fullScreen: PropTypes.bool,
  className: PropTypes.string
};

// Skeleton loader for content
const SkeletonLoader = ({ className = '', width = '100%', height = '20px', rounded = false }) => (
  <div 
    className={`animate-pulse bg-gray-200 ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
    style={{ width, height }}
    aria-label="Loading content"
  />
);

SkeletonLoader.propTypes = {
  className: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  rounded: PropTypes.bool
};

// Product card skeleton
const ProductCardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
    <SkeletonLoader height="200px" className="w-full" />
    <div className="p-6 space-y-3">
      <SkeletonLoader width="80%" height="24px" />
      <SkeletonLoader width="100%" height="16px" />
      <SkeletonLoader width="60%" height="16px" />
    </div>
  </div>
);

export { LoadingSpinner, SkeletonLoader, ProductCardSkeleton };

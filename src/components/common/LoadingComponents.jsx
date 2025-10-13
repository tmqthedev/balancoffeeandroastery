import React, { memo } from 'react';
import PropTypes from 'prop-types';

// Skeleton loader cho product cards
export const ProductCardSkeleton = memo(() => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded mb-3"></div>
      <div className="h-3 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
    </div>
  </div>
));

ProductCardSkeleton.displayName = 'ProductCardSkeleton';

// Skeleton loader cho blog cards
export const BlogCardSkeleton = memo(() => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200"></div>
    <div className="p-6">
      <div className="h-4 bg-gray-200 rounded mb-4"></div>
      <div className="h-3 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="flex justify-between items-center">
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  </div>
));

BlogCardSkeleton.displayName = 'BlogCardSkeleton';

// Generic list skeleton
export const ListSkeleton = memo(({ count = 6, ItemSkeleton: SkeletonComponent = ProductCardSkeleton }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }, (_, index) => (
      <SkeletonComponent key={index} />
    ))}
  </div>
));

ListSkeleton.propTypes = {
  count: PropTypes.number,
  ItemSkeleton: PropTypes.elementType
};

ListSkeleton.displayName = 'ListSkeleton';

// Loading spinner với animation tối ưu
export const LoadingSpinner = memo(({ 
  size = 'medium', 
  message = 'Đang tải...', 
  fullScreen = false,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8', 
    large: 'w-12 h-12'
  };

  const LoadingContent = (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div 
        className={`${sizeClasses[size]} border-2 border-brand-primary border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      ></div>
      {message && (
        <span className="text-gray-600 text-sm font-medium">{message}</span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {LoadingContent}
      </div>
    );
  }

  return LoadingContent;
});

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  message: PropTypes.string,
  fullScreen: PropTypes.bool,
  className: PropTypes.string
};

LoadingSpinner.displayName = 'LoadingSpinner';

// Progress bar component
export const ProgressBar = memo(({ progress = 0, className = '', showLabel = true }) => (
  <div className={`w-full ${className}`}>
    <div className="flex justify-between items-center mb-1">
      {showLabel && (
        <span className="text-sm font-medium text-gray-700">
          {Math.round(progress)}%
        </span>
      )}
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className="bg-brand-primary h-2.5 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      ></div>
    </div>
  </div>
));

ProgressBar.propTypes = {
  progress: PropTypes.number,
  className: PropTypes.string,
  showLabel: PropTypes.bool
};

ProgressBar.displayName = 'ProgressBar';

// Lazy load wrapper
export const LazyWrapper = memo(({ 
  children, 
  fallback = <LoadingSpinner />, 
  threshold = 0.1 
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [ref, setRef] = React.useState(null);

  React.useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return (
    <div ref={setRef}>
      {isVisible ? children : fallback}
    </div>
  );
});

LazyWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  threshold: PropTypes.number
};

LazyWrapper.displayName = 'LazyWrapper';

export default {
  ProductCardSkeleton,
  BlogCardSkeleton,
  ListSkeleton,
  LoadingSpinner,
  ProgressBar,
  LazyWrapper
};
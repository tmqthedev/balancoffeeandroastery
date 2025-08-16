import React from 'react';
import PropTypes from 'prop-types';

const SearchStats = ({ 
  searchTerm, 
  totalResults, 
  searchTime, 
  suggestions = [], 
  onSuggestionClick,
  onClearSearch 
}) => {
  if (!searchTerm) return null;

  return (
    <div className="bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 border border-brand-primary/20 rounded-xl p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search Results Info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-brand-primary font-medium">
              Kết quả cho: <span className="font-bold">"{searchTerm}"</span>
            </span>
          </div>
          
          <div className="text-gray-600 text-sm">
            {totalResults} sản phẩm
            {searchTime && (
              <span className="ml-2">
                ({searchTime}ms)
              </span>
            )}
          </div>
        </div>

        {/* Clear Search */}
        <button
          onClick={onClearSearch}
          className="flex items-center space-x-2 text-gray-600 hover:text-brand-primary transition-colors duration-200 bg-white/50 hover:bg-white/80 px-3 py-1 rounded-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Xóa tìm kiếm</span>
        </button>
      </div>

      {/* Search Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-brand-primary/20">
          <div className="text-sm text-gray-700 mb-2">Có thể bạn đang tìm:</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={`suggestion-${suggestion}-${index}`}
                onClick={() => onSuggestionClick(suggestion)}
                className="px-3 py-1 bg-white/70 border border-brand-primary/30 rounded-full text-sm text-brand-primary hover:bg-brand-primary hover:text-brand-white hover:border-brand-primary transition-all duration-200 transform hover:scale-105"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

SearchStats.propTypes = {
  searchTerm: PropTypes.string,
  totalResults: PropTypes.number.isRequired,
  searchTime: PropTypes.number,
  suggestions: PropTypes.arrayOf(PropTypes.string),
  onSuggestionClick: PropTypes.func.isRequired,
  onClearSearch: PropTypes.func.isRequired
};

export default SearchStats;

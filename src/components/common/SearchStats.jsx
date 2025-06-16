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
    <div className="bg-coffee-50 border border-coffee-200 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search Results Info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-coffee-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-coffee-800 font-medium">
              Kết quả cho: <span className="font-bold">"{searchTerm}"</span>
            </span>
          </div>
          
          <div className="text-coffee-600 text-sm">
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
          className="flex items-center space-x-2 text-coffee-600 hover:text-coffee-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Xóa tìm kiếm</span>
        </button>
      </div>

      {/* Search Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-coffee-200">
          <div className="text-sm text-coffee-700 mb-2">Có thể bạn đang tìm:</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={`suggestion-${suggestion}-${index}`}
                onClick={() => onSuggestionClick(suggestion)}
                className="px-3 py-1 bg-white border border-coffee-300 rounded-full text-sm text-coffee-700 hover:bg-coffee-100 hover:border-coffee-400 transition-colors"
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

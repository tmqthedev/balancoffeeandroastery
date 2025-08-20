import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AdvancedSearch = ({ 
  value, 
  onChange, 
  onSearch, 
  placeholder = "Tìm kiếm sản phẩm...",
  showSuggestions = true,
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const timeoutRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('coffee-search-history');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to parse search history:', e);
      }
    }
  }, []);

  // Save search to history
  const saveToHistory = useCallback((searchTerm) => {
    if (!searchTerm.trim()) return;
    
    const newSearches = [
      searchTerm,
      ...recentSearches.filter(s => s !== searchTerm)
    ].slice(0, 10); // Keep only 10 recent searches
    
    setRecentSearches(newSearches);
    localStorage.setItem('coffee-search-history', JSON.stringify(newSearches));
  }, [recentSearches]);

  // Fetch search suggestions
  const fetchSuggestions = useCallback(async (searchTerm) => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products/search-suggestions`, {
        params: { q: searchTerm },
        timeout: 5000
      });
      
      if (response.data?.suggestions) {
        setSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.warn('Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced suggestion fetching
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (showSuggestions && value) {
        fetchSuggestions(value);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, showSuggestions, fetchSuggestions]);

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    setHighlightedIndex(-1);
    setShowSuggestionsList(true);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setShowSuggestionsList(true);
  };

  // Handle input blur (with delay to allow clicking suggestions)
  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestionsList(false);
    }, 200);
  };

  // Handle search submission
  const handleSearch = (searchTerm = value) => {
    if (searchTerm.trim()) {
      saveToHistory(searchTerm.trim());
      onSearch(searchTerm.trim());
      setShowSuggestionsList(false);
    }
  };

  // Handle key navigation
  const handleKeyDown = (e) => {
    const totalItems = suggestions.length + recentSearches.length;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < totalItems - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : totalItems - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          const selectedItem = highlightedIndex < suggestions.length 
            ? suggestions[highlightedIndex].name
            : recentSearches[highlightedIndex - suggestions.length];
          onChange(selectedItem);
          handleSearch(selectedItem);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestionsList(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion);
    handleSearch(suggestion);
  };

  // Clear search history
  const clearSearchHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem('coffee-search-history');
  };
  // Highlight matching text
  const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === searchTerm.toLowerCase() ? 
        <span key={`highlight-${part}-${index}`} className="bg-yellow-200 font-semibold">{part}</span> : 
        part
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-12 pr-4 text-lg border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition-all"
          autoComplete="off"
        />
        
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-4">
          <svg 
            className="h-5 w-5 text-coffee-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
            <svg className="animate-spin h-4 w-4 text-coffee-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestionsList && (suggestions.length > 0 || recentSearches.length > 0) && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-coffee-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-coffee-600 bg-coffee-50 border-b">
                Gợi ý tìm kiếm
              </div>              {suggestions.map((suggestion, index) => (
                <button
                  key={`suggestion-${suggestion.id || suggestion.name}-${index}`}
                  type="button"
                  className={`w-full px-4 py-3 text-left cursor-pointer transition-colors ${
                    index === highlightedIndex 
                      ? 'bg-coffee-100' 
                      : 'hover:bg-coffee-50'
                  }`}
                  onClick={() => handleSuggestionClick(suggestion.name)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-coffee-100 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-coffee-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-coffee-800">
                        {highlightText(suggestion.name, value)}
                      </div>
                      {suggestion.category && (
                        <div className="text-sm text-coffee-500">
                          trong {suggestion.category}
                        </div>
                      )}                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-coffee-600 bg-coffee-50 border-b flex items-center justify-between">
                <span>Tìm kiếm gần đây</span>
                <button
                  onClick={clearSearchHistory}
                  className="text-coffee-400 hover:text-coffee-600 transition-colors"
                  title="Xóa lịch sử"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>              {recentSearches.map((search, index) => (
                <button
                  key={`recent-${search}-${index}`}
                  type="button"
                  className={`w-full px-4 py-3 text-left cursor-pointer transition-colors ${
                    (suggestions.length + index) === highlightedIndex 
                      ? 'bg-coffee-100' 
                      : 'hover:bg-coffee-50'
                  }`}
                  onClick={() => handleSuggestionClick(search)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-coffee-700">{search}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>  );
};

AdvancedSearch.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  showSuggestions: PropTypes.bool,
  className: PropTypes.string
};

export default AdvancedSearch;

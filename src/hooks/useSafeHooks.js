import { useState, useEffect, useRef } from 'react';

// Safe debounce hook that handles React context issues
export const useSafeDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Check if we're in a valid React context
    if (typeof value === 'undefined') {
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Safe search hook
export const useSafeSearch = (searchTerm, data = []) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm || !searchTerm.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    if (!Array.isArray(data)) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      const searchResults = data.filter(item => {
        if (!item) return false;
        const searchText = JSON.stringify(item).toLowerCase();
        return searchText.includes(searchTerm.toLowerCase());
      });

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, data]);

  return { searchResults: results, isSearching: loading };
};

// Safe intersection observer hook
export const useSafeIntersectionObserver = (options = {}) => {
  const [entry, setEntry] = useState(null);
  const [node, setNode] = useState(null);
  const observer = useRef(null);

  useEffect(() => {
    if (!node) return;

    // Check if IntersectionObserver is available
    if (typeof IntersectionObserver === 'undefined') {
      console.warn('IntersectionObserver not supported');
      return;
    }

    if (observer.current) {
      observer.current.disconnect();
    }

    try {
      observer.current = new IntersectionObserver(([entry]) => {
        setEntry(entry);
      }, {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      });

      observer.current.observe(node);
    } catch (error) {
      console.error('IntersectionObserver error:', error);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [node, options]);

  return [setNode, entry];
};
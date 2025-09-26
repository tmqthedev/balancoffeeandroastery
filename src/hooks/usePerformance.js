import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Hook for debouncing values with fallback
export const useDebounce = (value, delay = 300) => {
  try {
    // Check if we're in a React component context
    if (typeof useState !== 'function') {
      console.warn('useDebounce called outside React component, using fallback');
      return value;
    }
    
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  } catch (error) {
    console.warn('useDebounce hook error, using fallback:', error);
    // Fallback: return value directly if hooks fail
    return value;
  }
};

// Hook for debounced search with caching and fallback
export const useSearch = (searchFunction, dependencies = [], delay = 300) => {
  try {
    // Check if we're in a React component context
    if (typeof useState !== 'function') {
      console.warn('useSearch called outside React component, using fallback');
      return {
        query: '',
        setQuery: () => {},
        results: [],
        loading: false,
        error: null,
        clearSearch: () => {},
        clearCache: () => {}
      };
    }
    
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cache for search results
    const cache = useMemo(() => new Map(), []);

    const debouncedQuery = useDebounce(query, delay);

    // Create stable dependency key with stable dependency array
    const stableDependencies = useMemo(() => dependencies, [JSON.stringify(dependencies)]);
    const depsKey = useMemo(() => {
      return JSON.stringify(stableDependencies);
    }, [stableDependencies]);

    const search = useCallback(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setLoading(false);
        setError(null);
        return;
      }

      // Check cache first
      if (cache.has(searchQuery)) {
        setResults(cache.get(searchQuery));
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const searchResults = await searchFunction(searchQuery);
        setResults(searchResults);
        
        // Cache results
        cache.set(searchQuery, searchResults);
        
        // Limit cache size
        if (cache.size > 50) {
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
      } catch (err) {
        setError(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, [searchFunction, cache, depsKey]);

    useEffect(() => {
      search(debouncedQuery);
    }, [debouncedQuery, search]);

    const clearSearch = useCallback(() => {
      setQuery('');
      setResults([]);
      setError(null);
    }, []);

    const clearCache = useCallback(() => {
      cache.clear();
    }, [cache]);

    return {
      query,
      setQuery,
      results,
      loading,
      error,
      clearSearch,
      clearCache
    };
  } catch (error) {
    console.warn('useSearch hook error, using fallback:', error);
    // Fallback: return basic search functionality
    return {
      query: '',
      setQuery: () => {},
      results: [],
      loading: false,
      error: null,
      clearSearch: () => {},
      clearCache: () => {}
    };
  }
};

// Hook for throttling function calls
export const useThrottle = (callback, delay = 100) => {
  const lastCall = useRef(0);

  return useCallback((...args) => {
    const now = Date.now();
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      return callback(...args);
    }
  }, [callback, delay]);
};

// Hook for intersection observer (lazy loading) with fallback
export const useIntersectionObserver = (options = {}) => {
  try {
    // Check if we're in a React component context
    if (typeof useState !== 'function') {
      console.warn('useIntersectionObserver called outside React component, using fallback');
      return [() => {}, { isIntersecting: true }];
    }
    
    const [entry, setEntry] = useState(null);
    const [node, setNode] = useState(null);

    const observer = useMemo(() => {
      if (typeof IntersectionObserver === 'undefined') return null;
      
      return new IntersectionObserver(([entry]) => {
        setEntry(entry);
      }, {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      });
    }, [options.threshold, options.rootMargin, options.root]);

    useEffect(() => {
      if (!observer || !node) return;

      observer.observe(node);

      return () => {
        observer.disconnect();
      };
    }, [observer, node]);

    return [setNode, entry];
  } catch (error) {
    console.warn('useIntersectionObserver hook error, using fallback:', error);
    // Fallback: return dummy functions
    return [() => {}, { isIntersecting: true }];
  }
};

// Hook for optimistic updates
export const useOptimisticUpdate = (initialData, updateFunction) => {
  try {
    // Check if we're in a React component context
    if (typeof useState !== 'function') {
      console.warn('useOptimisticUpdate called outside React component, using fallback');
      return { 
        data: initialData, 
        update: () => Promise.resolve(initialData), 
        isUpdating: false, 
        error: null 
      };
    }
    
    const [data, setData] = useState(initialData);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState(null);

    const update = useCallback(async (optimisticData, rollbackData = null) => {
      // Immediately update UI
      setData(optimisticData);
      setIsUpdating(true);
      setError(null);

      try {
        // Perform actual update
        const result = await updateFunction(optimisticData);
        setData(result);
      } catch (err) {
        // Rollback on error
        setData(rollbackData || initialData);
        setError(err);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    }, [updateFunction, initialData]);

    return { data, update, isUpdating, error };
  } catch (error) {
    console.warn('useOptimisticUpdate hook error, using fallback:', error);
    return { 
      data: initialData, 
      update: () => Promise.resolve(initialData), 
      isUpdating: false, 
      error: null 
    };
  }
};

// Hook for local storage with SSR support
export const useLocalStorage = (key, initialValue) => {
  try {
    // Check if we're in a React component context
    if (typeof useState !== 'function') {
      console.warn('useLocalStorage called outside React component, using fallback');
      return [initialValue, () => {}];
    }
    
    const [storedValue, setStoredValue] = useState(() => {
      if (typeof window === 'undefined') {
        return initialValue;
      }

      try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
        return initialValue;
      }
    });

    const setValue = useCallback((value) => {
      try {
        setStoredValue(value);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(value));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    }, [key]);

    return [storedValue, setValue];
  } catch (error) {
    console.warn('useLocalStorage hook error, using fallback:', error);
    return [initialValue, () => {}];
  }
};

// Hook for async data fetching with caching
export const useAsyncData = (fetchFunction, dependencies = [], options = {}) => {
  try {
    // Check if we're in a React component context
    if (typeof useState !== 'function') {
      console.warn('useAsyncData called outside React component, using fallback');
      return { 
        data: null, 
        loading: false, 
        error: null, 
        refetch: () => {} 
      };
    }
    
    const {
      cacheKey,
      cacheTime = 5 * 60 * 1000, // 5 minutes
      staleTime = 1 * 60 * 1000,  // 1 minute
      retry = 3,
      retryDelay = 1000
    } = options;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
  // Simple cache implementation
  const cache = useMemo(() => new Map(), []);

  // Create stable dependency key with stable dependency array  
  const stableDependencies = useMemo(() => dependencies, [JSON.stringify(dependencies)]);
  const depsKey = useMemo(() => {
    return JSON.stringify(stableDependencies);
  }, [stableDependencies]);

  const fetchData = useCallback(async (retryCount = 0) => {
    // Check cache first
    if (cacheKey && cache.has(cacheKey)) {
      const cachedData = cache.get(cacheKey);
      const now = Date.now();
      
      if (now - cachedData.timestamp < cacheTime) {
        setData(cachedData.data);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction();
      setData(result);
      
      // Cache the result
      if (cacheKey) {
        cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }
    } catch (err) {
      if (retryCount < retry) {
        setTimeout(() => {
          fetchData(retryCount + 1);
        }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
      } else {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, cacheKey, cache, cacheTime, retry, retryDelay, depsKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    // Clear cache for this key
    if (cacheKey && cache.has(cacheKey)) {
      cache.delete(cacheKey);
    }
    fetchData();
  }, [fetchData, cacheKey, cache]);

  return { data, loading, error, refetch };
  } catch (error) {
    console.warn('useAsyncData hook error, using fallback:', error);
    return { 
      data: null, 
      loading: false, 
      error: null, 
      refetch: () => {} 
    };
  }
};
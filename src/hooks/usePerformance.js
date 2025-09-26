import { useState, useEffect, useCallback, useRef } from 'react';

export const useDebounce = (value, delay = 300) => {
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
};

export const useSearch = (searchTerm, data) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm || !searchTerm.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const searchResults = data.filter(item => {
      const searchText = JSON.stringify(item).toLowerCase();
      return searchText.includes(searchTerm.toLowerCase());
    });

    setResults(searchResults);
    setLoading(false);
  }, [searchTerm, data]);

  return { searchResults: results, isSearching: loading };
};

export const useIntersectionObserver = (options = {}) => {
  const [entry, setEntry] = useState(null);
  const [node, setNode] = useState(null);
  const observer = useRef(null);

  useEffect(() => {
    if (!node) return;

    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(([entry]) => {
      setEntry(entry);
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });

    observer.current.observe(node);

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [node, options]);

  return [setNode, entry];
};

export const useOptimisticUpdate = (initialData, updateFunction) => {
  const [data, setData] = useState(initialData);
  const [isUpdating, setIsUpdating] = useState(false);

  const update = useCallback(async (optimisticData) => {
    setData(optimisticData);
    setIsUpdating(true);

    try {
      const result = await updateFunction(optimisticData);
      setData(result);
      return result;
    } catch (error) {
      setData(initialData);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [updateFunction, initialData]);

  return { data, update, isUpdating };
};

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

export const useAsyncData = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

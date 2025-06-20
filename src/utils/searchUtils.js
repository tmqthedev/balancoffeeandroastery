// Search utilities for highlighting and filtering

export const highlightSearchTerm = (text, searchTerm) => {
  if (!searchTerm || !text) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
    return parts.map((part) => {
    if (part.toLowerCase() === searchTerm.toLowerCase()) {
      return `<mark class="bg-yellow-200 font-semibold px-1 rounded">${part}</mark>`;
    }
    return part;
  }).join('');
};

export const getSearchScore = (product, searchTerm) => {
  if (!searchTerm) return 0;
  
  const term = searchTerm.toLowerCase();
  const name = (product.name || '').toLowerCase();
  const nameVi = (product.nameVi || '').toLowerCase();
  const description = (product.description || '').toLowerCase();
  
  let score = 0;
  
  // Exact match in name gets highest score
  if (name === term || nameVi === term) score += 100;
  
  // Name starts with search term
  if (name.startsWith(term) || nameVi.startsWith(term)) score += 50;
  
  // Name contains search term
  if (name.includes(term) || nameVi.includes(term)) score += 25;
  
  // Description contains search term
  if (description.includes(term)) score += 10;
  
  return score;
};

export const sortSearchResults = (products, searchTerm) => {
  if (!searchTerm) return products;
  
  return [...products].sort((a, b) => {
    const scoreA = getSearchScore(a, searchTerm);
    const scoreB = getSearchScore(b, searchTerm);
    
    if (scoreA !== scoreB) {
      return scoreB - scoreA; // Higher score first
    }
    
    // If same score, sort by name
    return (a.nameVi || a.name).localeCompare(b.nameVi || b.name, 'vi-VN');
  });
};

export const getSearchSuggestions = (products, searchTerm) => {
  if (!searchTerm || searchTerm.length < 2) return [];
  
  const term = searchTerm.toLowerCase();
  const suggestions = new Set();
  
  products.forEach(product => {
    const name = (product.nameVi || product.name || '').toLowerCase();
    const words = name.split(/\s+/);
    
    // Add matching words
    words.forEach(word => {
      if (word.includes(term) && word.length > 2) {
        suggestions.add(word);
      }
    });
    
    // Add matching product names
    if (name.includes(term)) {
      suggestions.add(product.nameVi || product.name);
    }
  });
  
  return Array.from(suggestions).slice(0, 8);
};

export const saveSearchHistory = (searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) return;
  
  const storageKey = 'coffee-search-history';
  let history = [];
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      history = JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to parse search history:', e);
  }
  
  // Remove if already exists and add to front
  history = history.filter(item => item !== searchTerm.trim());
  history.unshift(searchTerm.trim());
  
  // Keep only last 10 searches
  history = history.slice(0, 10);
  
  try {
    localStorage.setItem(storageKey, JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save search history:', e);
  }
};

export const getSearchHistory = () => {
  try {
    const stored = localStorage.getItem('coffee-search-history');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.warn('Failed to get search history:', e);
    return [];
  }
};

export const clearSearchHistory = () => {
  try {
    localStorage.removeItem('coffee-search-history');
  } catch (e) {
    console.warn('Failed to clear search history:', e);
  }
};

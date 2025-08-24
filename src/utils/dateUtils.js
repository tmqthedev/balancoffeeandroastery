/**
 * Utility functions for date formatting and conversion
 */

/**
 * Convert ISO date string to YYYY-MM-DD format for HTML date input
 * @param {string|Date} date - Date to convert
 * @returns {string} Date in YYYY-MM-DD format or empty string if invalid
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) return '';
    
    // Convert to YYYY-MM-DD format
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
};

/**
 * Convert YYYY-MM-DD format to ISO date string for backend
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} ISO date string or empty string if invalid
 */
export const formatDateForBackend = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString();
  } catch (error) {
    console.error('Error formatting date for backend:', error);
    return '';
  }
};

/**
 * Format date for display in Vietnamese locale
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateForDisplay = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toLocaleDateString('vi-VN');
  } catch (error) {
    console.error('Error formatting date for display:', error);
    return '';
  }
};

/**
 * Get age from birth date
 * @param {string|Date} birthDate - Birth date
 * @returns {number} Age in years
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return 0;
  
  try {
    const today = new Date();
    const birth = new Date(birthDate);
    
    // Check if date is valid
    if (isNaN(birth.getTime())) return 0;
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return Math.max(0, age);
  } catch (error) {
    console.error('Error calculating age:', error);
    return 0;
  }
};

export default {
  formatDateForInput,
  formatDateForBackend,
  formatDateForDisplay,
  calculateAge
};

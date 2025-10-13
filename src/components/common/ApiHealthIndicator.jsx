import React, { useState, useEffect } from 'react';
import { checkApiHealth, isProduction, API_BASE_URL } from '../config/api.js';

const ApiHealthIndicator = () => {
  const [healthStatus, setHealthStatus] = useState({
    isHealthy: null,
    loading: true,
    error: null,
    lastChecked: null
  });

  const checkHealth = async () => {
    setHealthStatus(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const isHealthy = await checkApiHealth();
      setHealthStatus({
        isHealthy,
        loading: false,
        error: null,
        lastChecked: new Date().toLocaleTimeString()
      });
    } catch (error) {
      setHealthStatus({
        isHealthy: false,
        loading: false,
        error: error.message,
        lastChecked: new Date().toLocaleTimeString()
      });
    }
  };

  useEffect(() => {
    checkHealth();
    
    // Check health every 30 seconds in production
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Don't show in development
  if (!isProduction) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg text-sm ${
      healthStatus.loading 
        ? 'bg-gray-100 text-gray-600'
        : healthStatus.isHealthy 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
    }`}>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${
          healthStatus.loading
            ? 'bg-gray-400 animate-pulse'
            : healthStatus.isHealthy
              ? 'bg-green-500'
              : 'bg-red-500'
        }`} />
        
        <span className="font-medium">
          {healthStatus.loading
            ? 'Checking API...'
            : healthStatus.isHealthy
              ? 'API Connected'
              : 'API Disconnected'
          }
        </span>
        
        {!healthStatus.loading && (
          <button
            onClick={checkHealth}
            className="ml-2 px-2 py-1 bg-white bg-opacity-50 rounded text-xs hover:bg-opacity-75 transition-colors"
          >
            ↻
          </button>
        )}
      </div>
      
      {healthStatus.error && (
        <div className="mt-1 text-xs opacity-75">
          Error: {healthStatus.error}
        </div>
      )}
      
      <div className="mt-1 text-xs opacity-75">
        API: {API_BASE_URL}
      </div>
      
      {healthStatus.lastChecked && (
        <div className="mt-1 text-xs opacity-50">
          Last: {healthStatus.lastChecked}
        </div>
      )}
    </div>
  );
};

export default ApiHealthIndicator;
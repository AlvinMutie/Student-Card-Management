// Default runtime configuration for the Student Card Management frontend.
// This file will be overwritten during deployments by scripts/generate-runtime-config.js
// When running locally without the build script, the API will default to localhost.
(function (win) {
  const DEFAULT_LOCAL_API = 'http://localhost:3000/api';


  if (!win.StudentCardConfig) {
    win.StudentCardConfig = {};
  }

  // Use relative path for production (Apache proxy handles /api), localhost for development
  if (!win.StudentCardConfig.apiBaseUrl) {
    // Check if we're on localhost
    const isLocalhost = win.location && (
      win.location.hostname === 'localhost' ||
      win.location.hostname === '127.0.0.1' ||
      win.location.hostname === ''
    );

    // Priority 1: Use the Local VPS API (The Most Reliable Way)
    const LOCAL_PROD_API = 'https://shuleniadvantage.co.ke/api';

    // Use the VPS Domain for production, absolute for localhost
    win.StudentCardConfig.apiBaseUrl = isLocalhost ? DEFAULT_LOCAL_API : LOCAL_PROD_API;
  }
})(window);


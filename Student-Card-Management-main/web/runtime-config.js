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

    // Priority 1: Use the previous "Working" Render API (The Legacy Way)
    const RENDER_API = 'https://student-card-management-api.onrender.com/api';

    // Use Render for production (resolves 404s), absolute for localhost
    win.StudentCardConfig.apiBaseUrl = isLocalhost ? DEFAULT_LOCAL_API : RENDER_API;
  }
})(window);


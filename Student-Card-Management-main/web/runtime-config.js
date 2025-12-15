// Default runtime configuration for the Student Card Management frontend.
// This file will be overwritten during deployments by scripts/generate-runtime-config.js
// When running locally without the build script, the API will default to localhost.
   (function (win) {
     const DEFAULT_LOCAL_API = 'http://localhost:3000/api';
     const DEFAULT_REMOTE_API = 'http://102.212.245.19/api'; // set to your real URL if different
     

  if (!win.StudentCardConfig) {
    win.StudentCardConfig = {};
  }
  
  // Use remote API by default (for production), fallback to local for development
  if (!win.StudentCardConfig.apiBaseUrl) {
    // Check if we're on localhost
    const isLocalhost = win.location && (
      win.location.hostname === 'localhost' || 
      win.location.hostname === '127.0.0.1' ||
      win.location.hostname === ''
    );
    
    win.StudentCardConfig.apiBaseUrl = isLocalhost ? DEFAULT_LOCAL_API : DEFAULT_REMOTE_API;
  }
})(window);


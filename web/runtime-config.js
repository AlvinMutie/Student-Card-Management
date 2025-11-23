// Default runtime configuration for the Student Card Management frontend.
// This file will be overwritten during deployments by scripts/generate-runtime-config.js
// When running locally without the build script, the API will default to localhost.
(function (win) {
  const DEFAULT_LOCAL_API = 'http://localhost:10000/api';
  if (!win.StudentCardConfig) {
    win.StudentCardConfig = {};
  }
  if (!win.StudentCardConfig.apiBaseUrl) {
    win.StudentCardConfig.apiBaseUrl = DEFAULT_LOCAL_API;
  }
})(window);


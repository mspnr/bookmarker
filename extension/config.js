// Configuration constants for the extension
// This is the single source of truth for default values
// These are global constants available to all scripts

// Frontend base URL (extension will add /api prefix internally)
const DEFAULT_API_URL = 'http://localhost:3001';
const API_URL_KEY = 'bookmarker_api_url';
const AUTH_STORAGE_KEY = 'bookmarker_auth';

// Cross-browser API compatibility
const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;

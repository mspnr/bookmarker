// Authentication utilities for the extension
// browserAPI is defined in config.js which is loaded first

/**
 * Get the API base URL from storage
 */
async function getApiUrl() {
  const result = await browserAPI.storage.local.get(API_URL_KEY);
  return result[API_URL_KEY] || DEFAULT_API_URL;
}

/**
 * Save auth tokens to storage
 */
async function saveAuthTokens(accessToken, refreshToken) {
  const authData = {
    accessToken,
    refreshToken,
    timestamp: Date.now()
  };
  await browserAPI.storage.local.set({ [AUTH_STORAGE_KEY]: authData });
}

/**
 * Get auth tokens from storage
 */
async function getAuthTokens() {
  const result = await browserAPI.storage.local.get(AUTH_STORAGE_KEY);
  return result[AUTH_STORAGE_KEY] || null;
}

/**
 * Clear auth tokens from storage
 */
async function clearAuthTokens() {
  await browserAPI.storage.local.remove(AUTH_STORAGE_KEY);
}

/**
 * Check if user is authenticated
 */
async function isAuthenticated() {
  const authData = await getAuthTokens();
  return authData && authData.accessToken;
}

/**
 * Make an authenticated API request
 */
async function makeAuthenticatedRequest(endpoint, options = {}) {
  const apiUrl = await getApiUrl();
  const authData = await getAuthTokens();

  if (!authData || !authData.accessToken) {
    throw new Error('Not authenticated');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authData.accessToken}`,
    ...options.headers
  };

  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers
  });

  // If unauthorized, try to refresh token
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry request with new token
      const newAuthData = await getAuthTokens();
      headers['Authorization'] = `Bearer ${newAuthData.accessToken}`;
      return fetch(`${apiUrl}${endpoint}`, { ...options, headers });
    } else {
      // Refresh failed, clear tokens
      await clearAuthTokens();
      throw new Error('Authentication failed');
    }
  }

  return response;
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken() {
  const apiUrl = await getApiUrl();
  const authData = await getAuthTokens();

  if (!authData || !authData.refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${apiUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refresh_token: authData.refreshToken
      })
    });

    if (response.ok) {
      const data = await response.json();
      await saveAuthTokens(data.access_token, data.refresh_token);
      return true;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }

  return false;
}

/**
 * Login with username and password
 */
async function login(username, password) {
  const apiUrl = await getApiUrl();

  const response = await fetch(`${apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      password
    })
  });

  if (response.ok) {
    const data = await response.json();
    await saveAuthTokens(data.access_token, data.refresh_token);
    return { success: true };
  } else {
    const error = await response.json();
    return { success: false, error: error.detail || 'Login failed' };
  }
}

/**
 * Logout
 */
async function logout() {
  const authData = await getAuthTokens();

  if (authData && authData.refreshToken) {
    try {
      await makeAuthenticatedRequest('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: authData.refreshToken })
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
  }

  await clearAuthTokens();
}

// Background script for token management and periodic refresh

const TOKEN_REFRESH_INTERVAL = 25 * 60 * 1000; // 25 minutes (tokens expire in 30 minutes)

// Setup alarm for periodic token refresh
browser.alarms.create('tokenRefresh', {
  periodInMinutes: 25
});

// Listen for alarm
browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'tokenRefresh') {
    await refreshTokenIfNeeded();
  }
});

/**
 * Refresh token if user is authenticated
 */
async function refreshTokenIfNeeded() {
  const authData = await browser.storage.local.get('bookmarker_auth');
  const auth = authData.bookmarker_auth;

  if (!auth || !auth.refreshToken) {
    return;
  }

  // Check if token is older than 20 minutes
  const tokenAge = Date.now() - auth.timestamp;
  const twentyMinutes = 20 * 60 * 1000;

  if (tokenAge > twentyMinutes) {
    try {
      const apiUrlData = await browser.storage.local.get(API_URL_KEY);
      const apiUrl = apiUrlData[API_URL_KEY] || DEFAULT_API_URL;

      const response = await fetch(`${apiUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refresh_token: auth.refreshToken
        })
      });

      if (response.ok) {
        const data = await response.json();
        await browser.storage.local.set({
          bookmarker_auth: {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            timestamp: Date.now()
          }
        });
        console.log('Token refreshed successfully');
      } else {
        console.error('Token refresh failed');
        // Clear auth data if refresh fails
        await browser.storage.local.remove('bookmarker_auth');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
    }
  }
}

// Listen for extension installation
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default API URL
    browser.storage.local.set({
      [API_URL_KEY]: DEFAULT_API_URL
    });
  }
});

console.log('Bookmarker background script loaded');

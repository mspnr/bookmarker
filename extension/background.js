// Background service worker for token management and periodic refresh
// Constants (DEFAULT_API_URL, API_URL_KEY, AUTH_STORAGE_KEY, browserAPI)
// are defined in config.js which is loaded first

/**
 * Refresh token if user is authenticated
 */
async function refreshTokenIfNeeded() {
  const authData = await browserAPI.storage.local.get(AUTH_STORAGE_KEY);
  const auth = authData[AUTH_STORAGE_KEY];

  if (!auth || !auth.refreshToken) {
    return;
  }

  // Check if token is older than 20 minutes
  const tokenAge = Date.now() - auth.timestamp;
  const twentyMinutes = 20 * 60 * 1000;

  if (tokenAge > twentyMinutes) {
    try {
      const apiUrlData = await browserAPI.storage.local.get(API_URL_KEY);
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
        await browserAPI.storage.local.set({
          [AUTH_STORAGE_KEY]: {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            timestamp: Date.now()
          }
        });
        console.log('Token refreshed successfully');
      } else {
        console.error('Token refresh failed');
        // Clear auth data if refresh fails
        await browserAPI.storage.local.remove(AUTH_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
    }
  }
}

// Listen for alarm
browserAPI.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'tokenRefresh') {
    await refreshTokenIfNeeded();
  }
});

// Create context menu items on service worker startup
browserAPI.contextMenus.removeAll(async () => {
  browserAPI.contextMenus.create({
    id: 'open-frontend',
    title: 'Open Bookmarker Web UI',
    contexts: ['action']
  });

  browserAPI.contextMenus.create({
    id: 'open-options',
    title: 'Settings',
    contexts: ['action']
  });
});

// Handle context menu clicks
browserAPI.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'open-frontend') {
    // Get the configured API URL
    const apiUrlData = await browserAPI.storage.local.get(API_URL_KEY);
    const frontendUrl = apiUrlData[API_URL_KEY] || DEFAULT_API_URL;

    // Check if server is configured (not default)
    if (frontendUrl === DEFAULT_API_URL) {
      // Server not configured, open options instead
      browserAPI.runtime.openOptionsPage();
    } else {
      // Open frontend in new tab
      browserAPI.tabs.create({ url: frontendUrl });
    }
  } else if (info.menuItemId === 'open-options') {
    // Open options page
    browserAPI.runtime.openOptionsPage();
  }
});

// Listen for extension installation
browserAPI.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Set default API URL
    await browserAPI.storage.local.set({
      [API_URL_KEY]: DEFAULT_API_URL
    });
  }

  // Setup alarm for periodic token refresh (25 minutes)
  await browserAPI.alarms.create('tokenRefresh', {
    periodInMinutes: 25
  });

  // Create context menu items
  browserAPI.contextMenus.create({
    id: 'open-frontend',
    title: 'Open Bookmarker Web UI',
    contexts: ['action']
  });

  browserAPI.contextMenus.create({
    id: 'open-options',
    title: 'Settings',
    contexts: ['action']
  });

  console.log('Bookmarker background service worker initialized');
});

// Setup alarm when service worker starts
browserAPI.alarms.create('tokenRefresh', {
  periodInMinutes: 25
});

console.log('Bookmarker background service worker loaded');

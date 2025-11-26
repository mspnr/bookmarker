// Popup functionality
// browserAPI is defined in config.js which is loaded first

document.addEventListener('DOMContentLoaded', async () => {
  const notLoggedInView = document.getElementById('notLoggedIn');
  const loggedInView = document.getElementById('loggedIn');
  const loadingView = document.getElementById('loading');
  const loginButton = document.getElementById('loginButton');
  const statusMessage = document.getElementById('statusMessage');
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');

  // Check if server is configured first
  const apiUrl = await getApiUrl();
  const serverConfigured = apiUrl !== DEFAULT_API_URL;

  if (!serverConfigured) {
    // Server not configured, open options page
    browserAPI.runtime.openOptionsPage();
    window.close();
    return;
  }

  // Check authentication status
  const authenticated = await isAuthenticated();

  // Get current tab info
  const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];

  loadingView.style.display = 'none';

  if (!authenticated) {
    // Show login view
    notLoggedInView.style.display = 'block';

    loginButton.addEventListener('click', () => {
      browserAPI.tabs.create({ url: browserAPI.runtime.getURL('login.html') });
      window.close();
    });

    const optionsButton = document.getElementById('optionsButton');
    if (optionsButton) {
      optionsButton.addEventListener('click', () => {
        browserAPI.runtime.openOptionsPage();
        window.close();
      });
    }
  } else {
    // Show logged in view and auto-save bookmark
    loggedInView.style.display = 'block';

    // Immediately save the bookmark
    const url = currentTab.url;
    const title = currentTab.title;

    if (!url || !title) {
      showError('Cannot save bookmark: URL and title are required');
      return;
    }

    try {
      const response = await makeAuthenticatedRequest('/api/bookmarks/', {
        method: 'POST',
        body: JSON.stringify({
          url,
          title,
          notes: null
        })
      });

      if (response.ok) {
        statusMessage.style.display = 'none';
        showSuccess('✓ Bookmark saved successfully!');

        // Close popup after 1.5 seconds
        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        const error = await response.json();
        statusMessage.style.display = 'none';
        showError(error.detail || 'Failed to save bookmark');
      }
    } catch (error) {
      console.error('Save bookmark error:', error);
      statusMessage.style.display = 'none';
      showError('Network error. Please check if the backend is running.');
    }
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
  }

  function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
  }
});

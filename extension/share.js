// Share handler functionality
// browserAPI is defined in config.js which is loaded first

document.addEventListener('DOMContentLoaded', async () => {
  const notLoggedInView = document.getElementById('notLoggedIn');
  const loggedInView = document.getElementById('loggedIn');
  const loginButton = document.getElementById('loginButton');
  const statusMessage = document.getElementById('statusMessage');
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');

  // Check authentication status
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    // Show login view
    notLoggedInView.style.display = 'block';

    loginButton.addEventListener('click', () => {
      browserAPI.tabs.create({ url: browserAPI.runtime.getURL('login.html') });
      window.close();
    });
  } else {
    // Show logged in view
    loggedInView.style.display = 'block';

    // Get shared data from URL parameters
    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get('url');
    const sharedTitle = params.get('title') || 'Shared Link';

    if (!sharedUrl) {
      showError('No URL was shared');
      return;
    }

    // Save the shared bookmark
    try {
      const response = await makeAuthenticatedRequest('/api/bookmarks/', {
        method: 'POST',
        body: JSON.stringify({
          url: sharedUrl,
          title: sharedTitle,
          notes: null
        })
      });

      if (response.ok) {
        statusMessage.style.display = 'none';
        showSuccess('✓ Bookmark saved successfully!');

        // Close page after 2 seconds
        setTimeout(() => {
          window.close();
        }, 2000);
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

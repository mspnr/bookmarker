// Options/Settings page functionality

document.addEventListener('DOMContentLoaded', async () => {
  const apiForm = document.getElementById('apiForm');
  const apiUrlInput = document.getElementById('apiUrl');
  const apiMessage = document.getElementById('apiMessage');
  const accountInfo = document.getElementById('accountInfo');
  const notLoggedInfo = document.getElementById('notLoggedInfo');
  const logoutButton = document.getElementById('logoutButton');

  // Set placeholder from config
  apiUrlInput.placeholder = DEFAULT_API_URL;

  // Load current API URL
  const currentApiUrl = await getApiUrl();
  apiUrlInput.value = currentApiUrl;

  // Check authentication status
  const authenticated = await isAuthenticated();
  if (authenticated) {
    accountInfo.style.display = 'block';
    notLoggedInfo.style.display = 'none';
  } else {
    accountInfo.style.display = 'none';
    notLoggedInfo.style.display = 'block';
  }

  // Handle API URL form submission
  apiForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    let apiUrl = apiUrlInput.value.trim();

    // Remove trailing slash if present
    if (apiUrl.endsWith('/')) {
      apiUrl = apiUrl.slice(0, -1);
    }

    if (!apiUrl) {
      showMessage('Please enter a valid URL', 'error');
      return;
    }

    // Save API URL
    await browser.storage.local.set({ bookmarker_api_url: apiUrl });
    showMessage('API URL saved successfully!', 'success');
  });

  // Handle logout
  logoutButton.addEventListener('click', async () => {
    await logout();
    accountInfo.style.display = 'none';
    notLoggedInfo.style.display = 'block';
  });

  function showMessage(message, type = 'success') {
    apiMessage.textContent = message;
    apiMessage.className = type;
    apiMessage.style.display = 'block';

    setTimeout(() => {
      apiMessage.style.display = 'none';
    }, 3000);
  }
});

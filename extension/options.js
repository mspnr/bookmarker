// Options/Settings page functionality
// browserAPI is defined in config.js which is loaded first

document.addEventListener('DOMContentLoaded', async () => {
  const apiForm = document.getElementById('apiForm');
  const apiUrlInput = document.getElementById('apiUrl');
  const apiMessage = document.getElementById('apiMessage');
  const accountInfo = document.getElementById('accountInfo');
  const notLoggedInfo = document.getElementById('notLoggedInfo');
  const logoutButton = document.getElementById('logoutButton');

  // Set placeholder from config
  apiUrlInput.placeholder = DEFAULT_API_URL;

  // Display extension version from manifest
  const manifest = browserAPI.runtime.getManifest();
  document.getElementById('extensionVersion').textContent = manifest.version;

  // Load current API URL
  const currentApiUrl = await getApiUrl();
  apiUrlInput.value = currentApiUrl;

  // Hide server setup help message if server is already configured
  const serverConfigured = currentApiUrl !== DEFAULT_API_URL;
  const infoMessage = document.querySelector('.info-message');
  if (serverConfigured && infoMessage) {
    infoMessage.style.display = 'none';
  }

  // Check authentication status
  const authenticated = await isAuthenticated();
  if (authenticated) {
    // Get username and update status text
    const username = await getUsername();
    const loginStatus = document.getElementById('loginStatus');
    if (username) {
      // Safe: Use innerHTML for trusted HTML, textContent for user data
      loginStatus.innerHTML = '<strong>Status:</strong> Logged in as ';
      const usernameSpan = document.createElement('span');
      usernameSpan.textContent = username; // textContent auto-escapes HTML
      loginStatus.appendChild(usernameSpan);
    } else {
      loginStatus.innerHTML = '<strong>Status:</strong> Logged in';
    }

    accountInfo.style.display = 'block';
    notLoggedInfo.style.display = 'none';
  } else {
    accountInfo.style.display = 'none';
    notLoggedInfo.style.display = 'block';

    // Setup login form handler when not logged in
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    const loginButton = document.getElementById('loginButton');
    const loginErrorMessage = document.getElementById('loginErrorMessage');

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = usernameInput.value.trim();
      const password = passwordInput.value;

      if (!username || !password) {
        showLoginError('Please enter both username and password');
        return;
      }

      // Disable form while logging in
      loginButton.disabled = true;
      loginButton.textContent = 'Logging in...';
      loginErrorMessage.style.display = 'none';

      try {
        const result = await login(username, password);

        if (result.success) {
          // Reload page to show logged in state
          location.reload();
        } else {
          showLoginError(result.error || 'Login failed. Please check your credentials.');
          loginButton.disabled = false;
          loginButton.textContent = 'Login';
        }
      } catch (error) {
        console.error('Login error:', error);
        showLoginError('Network error. Please check if the backend is running.');
        loginButton.disabled = false;
        loginButton.textContent = 'Login';
      }
    });

    function showLoginError(message) {
      // Determine which help section to link to based on error type
      const isPasswordError = message.includes('Incorrect username or password');
      const helpUrl = isPasswordError
        ? 'https://github.com/mspnr/bookmarker#db-util'
        : 'https://github.com/mspnr/bookmarker#setup';
      const helpText = isPasswordError
        ? 'Reset your password'
        : 'View setup guide';

      // Safe: Use DOM methods instead of innerHTML to prevent XSS
      loginErrorMessage.textContent = ''; // Clear previous content

      // Add error message safely
      loginErrorMessage.appendChild(document.createTextNode(message));
      loginErrorMessage.appendChild(document.createElement('br'));

      // Create help section
      const helpSmall = document.createElement('small');
      helpSmall.style.marginTop = '8px';
      helpSmall.style.display = 'inline-block';
      helpSmall.textContent = 'Need help? ';

      const helpLink = document.createElement('a');
      helpLink.href = '#';
      helpLink.id = 'loginHelpLink';
      helpLink.style.color = '#1976d2';
      helpLink.style.textDecoration = 'underline';
      helpLink.textContent = helpText; // textContent auto-escapes HTML

      helpSmall.appendChild(helpLink);
      loginErrorMessage.appendChild(helpSmall);
      loginErrorMessage.style.display = 'block';

      // Add click handler for help link
      helpLink.addEventListener('click', (e) => {
        e.preventDefault();
        browserAPI.tabs.create({ url: helpUrl });
      });
    }
  }

  // Handle setup guide link click
  const setupGuideLink = document.getElementById('setupGuideLink');
  if (setupGuideLink) {
    setupGuideLink.addEventListener('click', (e) => {
      e.preventDefault();
      browserAPI.tabs.create({ url: 'https://github.com/mspnr/bookmarker#setup' });
    });
  }

  // Handle test connection button
  const testConnectionButton = document.getElementById('testConnectionButton');
  if (testConnectionButton) {
    testConnectionButton.addEventListener('click', async () => {
      const apiUrl = apiUrlInput.value.trim() || DEFAULT_API_URL;

      // Remove trailing slash if present
      const cleanUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

      // Disable button and show loading state
      testConnectionButton.disabled = true;
      testConnectionButton.textContent = 'Testing...';

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(`${cleanUrl}/api/health`, {
          method: 'GET',
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          showMessage('✓ Connection successful! Server is healthy.', 'success');
        } else {
          showMessage('✗ Server responded but is unhealthy', 'error');
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          showMessage('✗ Connection timeout. Check URL and server.', 'error');
        } else {
          showMessage('✗ Connection failed. Check URL and server.', 'error');
        }
      } finally {
        // Re-enable button
        testConnectionButton.disabled = false;
        testConnectionButton.textContent = 'Test Connection';
      }
    });
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
    await browserAPI.storage.local.set({ bookmarker_api_url: apiUrl });
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

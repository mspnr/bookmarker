// Login page functionality

document.addEventListener('DOMContentLoaded', async () => {
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const loginButton = document.getElementById('loginButton');
  const errorMessage = document.getElementById('errorMessage');

  // Check if already logged in
  const authenticated = await isAuthenticated();
  if (authenticated) {
    window.close();
    return;
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      showError('Please enter both username and password');
      return;
    }

    // Disable form while logging in
    loginButton.disabled = true;
    loginButton.textContent = 'Logging in...';
    errorMessage.style.display = 'none';

    try {
      const result = await login(username, password);

      if (result.success) {
        // Login successful, close login page
        window.close();
      } else {
        showError(result.error || 'Login failed. Please check your credentials.');
        loginButton.disabled = false;
        loginButton.textContent = 'Login';
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('Network error. Please check if the backend is running.');
      loginButton.disabled = false;
      loginButton.textContent = 'Login';
    }
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
  }
});

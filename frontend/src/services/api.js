// API client with authentication

const API_BASE_URL = '/api';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getAuthTokens() {
    const authData = localStorage.getItem('bookmarker_auth');
    return authData ? JSON.parse(authData) : null;
  }

  setAuthTokens(accessToken, refreshToken) {
    const authData = {
      accessToken,
      refreshToken,
      timestamp: Date.now()
    };
    localStorage.setItem('bookmarker_auth', JSON.stringify(authData));
  }

  clearAuthTokens() {
    localStorage.removeItem('bookmarker_auth');
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const authData = this.getAuthTokens();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (authData && authData.accessToken && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${authData.accessToken}`;
    }

    let response = await fetch(url, {
      ...options,
      headers
    });

    // If unauthorized, try to refresh token
    if (response.status === 401 && !options.skipAuth && authData?.refreshToken) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry request with new token
        const newAuthData = this.getAuthTokens();
        headers['Authorization'] = `Bearer ${newAuthData.accessToken}`;
        response = await fetch(url, { ...options, headers });
      } else {
        // Refresh failed, clear tokens
        this.clearAuthTokens();
        throw new Error('Authentication failed');
      }
    }

    return response;
  }

  async refreshToken() {
    const authData = this.getAuthTokens();
    if (!authData || !authData.refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
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
        this.setAuthTokens(data.access_token, data.refresh_token);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  // Auth endpoints
  async login(username, password) {
    const response = await this.makeRequest('/auth/login', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({
        username,
        password
      })
    });

    if (response.ok) {
      const data = await response.json();
      this.setAuthTokens(data.access_token, data.refresh_token);
      return { success: true, data };
    } else {
      const error = await response.json();
      return { success: false, error: error.detail || 'Login failed' };
    }
  }

  async register(username, password) {
    const response = await this.makeRequest('/auth/register', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({
        username,
        password
      })
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      const error = await response.json();
      return { success: false, error: error.detail || 'Registration failed' };
    }
  }

  async logout() {
    const authData = this.getAuthTokens();
    if (authData?.refreshToken) {
      try {
        await this.makeRequest('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({
            refresh_token: authData.refreshToken
          })
        });
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
    }
    this.clearAuthTokens();
  }

  async getCurrentUser() {
    const response = await this.makeRequest('/auth/me');
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to get current user');
  }

  // Bookmark endpoints
  async getBookmarks(archived = null) {
    const params = archived !== null ? `?archived=${archived}` : '';
    const response = await this.makeRequest(`/bookmarks/${params}`);
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch bookmarks');
  }

  async createBookmark(url, title, notes = null) {
    const response = await this.makeRequest('/bookmarks/', {
      method: 'POST',
      body: JSON.stringify({ url, title, notes })
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to create bookmark');
  }

  async updateBookmark(id, updates) {
    const response = await this.makeRequest(`/bookmarks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to update bookmark');
  }

  async deleteBookmark(id) {
    const response = await this.makeRequest(`/bookmarks/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to delete bookmark');
  }

  isAuthenticated() {
    const authData = this.getAuthTokens();
    return authData && authData.accessToken;
  }
}

export default new ApiClient();

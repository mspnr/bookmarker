# Bookmarker

A simple, self-hosted bookmarking application with a browser extension for Firefox and a web interface for managing bookmarks.

## Features

- 🔖 **Save bookmarks** from Firefox with a single click
- 📝 **Add notes** to your bookmarks
- 🗂️ **Archive** read bookmarks
- 🔐 **Secure authentication** with JWT tokens
- 🐳 **Docker support** for easy deployment
- 🎨 **Clean, modern UI** built with React

## Architecture

The application consists of three main components:

1. **Backend API** - FastAPI server with SQLite database
2. **Firefox Extension** - Browser extension for saving bookmarks
3. **Web UI** - React-based frontend for managing bookmarks

## Prerequisites

### For Docker Deployment (Recommended)
- Docker
- Docker Compose

### For Manual Deployment
- Python 3.11+
- Node.js 18+
- Firefox browser

## Quick Start with Docker

1. **Clone the repository**
   ```bash
   cd bookmarker
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and change SECRET_KEY to a random string
   ```

3. **Start the services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Web UI: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Manual Setup

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment with uv**
   ```bash
   # Install uv if you haven't already: pip install uv
   uv venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   uv pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env and set your SECRET_KEY
   ```

5. **Run the backend**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

The backend will be available at http://localhost:8000

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

The frontend will be available at http://localhost:3000

### Firefox Extension Installation

1. **Open Firefox**

2. **Navigate to** `about:debugging#/runtime/this-firefox`

3. **Click "Load Temporary Add-on"**

4. **Navigate to** `extension/manifest.json` and select it

5. **The extension is now installed** and will appear in your toolbar

**Note:** Temporary extensions are removed when Firefox is closed. For permanent installation, you need to sign the extension or use Firefox Developer Edition.

## First Time Setup

### 1. Create Your Account

1. Open the web UI at http://localhost:3000
2. Click "Don't have an account? Register"
3. Enter your username, email, and password
4. Click "Register"
5. Log in with your new credentials

### 2. Configure Firefox Extension

1. Click the Bookmarker extension icon in your Firefox toolbar
2. If the backend is running on a different URL, click the gear icon to open settings
3. Log in with your credentials

### 3. Save Your First Bookmark

1. Navigate to any webpage
2. Click the Bookmarker extension icon
3. The URL and title will be pre-filled
4. Optionally add notes
5. Click "Save Bookmark"

## Usage

### Saving Bookmarks

1. Navigate to any webpage in Firefox
2. Click the Bookmarker extension icon
3. Review the auto-filled title and URL
4. Add optional notes
5. Click "Save Bookmark"

### Managing Bookmarks

1. Open the web UI at http://localhost:3000
2. View all your bookmarks (newest first)
3. Use filters to view:
   - **Active** - Unarchived bookmarks
   - **Archived** - Archived bookmarks
   - **All** - All bookmarks

### Archiving Bookmarks

- Click the 📥 icon next to a bookmark to archive it
- Click the ↩️ icon to unarchive

### Deleting Bookmarks

- Click the 🗑️ icon next to a bookmark
- Confirm the deletion

## API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation.

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (revoke refresh token)
- `GET /api/auth/me` - Get current user info

#### Bookmarks
- `POST /api/bookmarks/` - Create a bookmark
- `GET /api/bookmarks/` - Get all bookmarks (with optional filter)
- `GET /api/bookmarks/{id}` - Get specific bookmark
- `PATCH /api/bookmarks/{id}` - Update bookmark (archive/notes)
- `DELETE /api/bookmarks/{id}` - Delete bookmark

## Project Structure

```
bookmarker/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── main.py         # FastAPI application
│   │   ├── models.py       # Database models
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── auth.py         # Authentication utilities
│   │   └── security.py     # Security functions
│   ├── Dockerfile
│   └── requirements.txt
├── extension/              # Firefox extension
│   ├── manifest.json       # Extension manifest
│   ├── popup.html          # Main popup
│   ├── login.html          # Login page
│   ├── options.html        # Settings page
│   ├── auth.js             # Auth utilities
│   └── *.js                # Extension scripts
├── frontend/               # React web UI
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   └── services/       # API client
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # Docker orchestration
└── README.md              # This file
```

## Production Deployment

### Deployment Options

This application can be deployed in several ways:
- **Local Network Server** - Deploy on a server accessible via LAN (e.g., `http://myserver.lan`)
- **Internet Server** - Deploy on a public server with a domain name
- **Self-hosted VPS** - Deploy on a VPS with proper SSL/TLS certificates

### Local Network Deployment (Recommended for Home/Office)

This setup is ideal for deploying on a local network server (e.g., Raspberry Pi, home server).

#### 1. Configure Environment Variables

On your server, create a `.env` file:

```bash
# Copy the example
cp .env.example .env

# Edit with your values
nano .env
```

Update the following in `.env`:

```bash
# Generate a secure key (see Security Considerations section below)
SECRET_KEY=<your-generated-secret-key>

# Allow your local network frontend
# Replace 'myserver.lan' with your actual server hostname
ALLOWED_ORIGINS=http://myserver.lan:3000,http://myserver.lan

# Token expiration settings
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=30
```

#### 2. Update Frontend API URL

Edit `docker-compose.yml` to point the frontend to your server:

```yaml
frontend:
  environment:
    - VITE_API_URL=http://myserver.lan:8000  # Replace with your server hostname
```

#### 3. Deploy with Docker

```bash
docker-compose up -d --build
```

#### 4. Access the Application

- **Web UI**: `http://myserver.lan:3000`
- **Backend API**: `http://myserver.lan:8000`
- **API Docs**: `http://myserver.lan:8000/docs`

#### 5. Configure Firefox Extension on Client Machines

On each client machine where you want to use the extension:

1. Install the Firefox extension (load temporary add-on)
2. Click the Bookmarker extension icon
3. Click the gear icon (settings)
4. Set API URL to: `http://myserver.lan:8000` (replace with your server hostname)
5. Login with your credentials

**Note:** The Firefox extension works seamlessly across your local network. The backend's CORS configuration automatically allows `moz-extension://` origins.

### Internet Deployment

For deploying on a public server with a domain name:

#### 1. Obtain SSL/TLS Certificate

**Option A: Let's Encrypt (Free)**
```bash
# Using Certbot
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

**Option B: Use Caddy as Reverse Proxy**

Caddy automatically handles SSL certificates:

```caddyfile
# Caddyfile
yourdomain.com {
    reverse_proxy localhost:3000
}

api.yourdomain.com {
    reverse_proxy localhost:8000
}
```

#### 2. Configure Environment Variables

Update `.env` for production:

```bash
SECRET_KEY=<your-generated-secret-key>
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=30
```

#### 3. Update Docker Compose

```yaml
frontend:
  environment:
    - VITE_API_URL=https://api.yourdomain.com
```

#### 4. Deploy Behind Reverse Proxy

Use nginx or Caddy to handle HTTPS and proxy to Docker containers.

**Example nginx configuration:**

```nginx
# Frontend
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Backend API
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### CORS Configuration Explained

The backend uses the `ALLOWED_ORIGINS` environment variable to control which web applications can access the API:

- **Development**: `http://localhost:3000,http://localhost:5173`
- **Local Network**: `http://myserver.lan:3000,http://myserver.lan`
- **Production**: `https://yourdomain.com,https://www.yourdomain.com`

**Important Notes:**
- Origins must be comma-separated with no spaces
- Firefox extensions work automatically via the `moz-extension://` origin pattern
- The backend configuration is in `backend/app/main.py:16-31`

### Troubleshooting Network Deployment

#### Server hostname not resolving

If `myserver.lan` doesn't resolve:
- Ensure mDNS/Bonjour is enabled on your network
- Use IP address instead: `http://192.168.1.100:8000`
- Update `.env` and `docker-compose.yml` accordingly

#### Extension can't connect from client machines

- Verify the server is accessible: `ping myserver.lan`
- Check firewall allows ports 8000 and 3000
- Ensure CORS origins include your server hostname
- Check extension settings have correct API URL

#### "Not Secure" warnings in browser

For local network deployment:
- This is normal for HTTP on `.lan` domains
- **Option 1**: Use self-signed certificates with mkcert
- **Option 2**: Accept the warning (safe on trusted local network)
- **Option 3**: Use Caddy with local CA certificates

## Security Considerations

### For Production Use

1. **Change the SECRET_KEY**
   - Generate a strong random key using one of these methods:
     ```bash
     # Using Python secrets module (recommended)
     python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

     # Or using openssl
     openssl rand -base64 64

     # Or using Python directly
     python -c 'import secrets; print(secrets.token_urlsafe(50))'
     ```
   - **Best practices:**
     - Minimum 50 characters with mix of letters, numbers, and special characters
     - Use cryptographically secure randomness (never manually create keys)
     - Use different keys for dev/staging/prod environments
     - Never commit to version control
     - Store securely (environment variables, AWS Secrets Manager, HashiCorp Vault)
     - Rotate periodically in production (note: this invalidates active sessions)

2. **Use HTTPS** (for internet deployment)
   - Configure SSL/TLS certificates (see Production Deployment section)
   - Use reverse proxy (nginx/Caddy) to handle HTTPS
   - Update `ALLOWED_ORIGINS` to use `https://` URLs

3. **Database Backups**
   - Regularly backup `bookmarks.db`
   - Consider using PostgreSQL for production

4. **Rate Limiting**
   - Add rate limiting to auth endpoints
   - Consider using nginx as reverse proxy

5. **CORS Configuration**
   - Set `ALLOWED_ORIGINS` environment variable with your production domains
   - See Production Deployment section for examples
   - Firefox extension automatically works via `moz-extension://` pattern

## Troubleshooting

### Backend won't start
- Check if port 8000 is already in use
- Verify Python dependencies are installed
- Check database file permissions

### Frontend won't start
- Check if port 3000 is already in use
- Run `npm install` to ensure dependencies are installed
- Check `VITE_API_URL` environment variable

### Extension can't connect
- Verify backend is running on http://localhost:8000
- Check extension settings (gear icon)
- Look for CORS errors in browser console
- Ensure you're logged in

### Authentication issues
- Clear browser localStorage
- Clear extension storage (uninstall/reinstall)
- Check JWT token expiration settings
- Verify SECRET_KEY matches between restarts

## Development

### Running Tests
```bash
# Backend tests (if implemented)
cd backend
pytest

# Frontend tests (if implemented)
cd frontend
npm test
```

### Building for Production

#### Backend
```bash
cd backend
docker build -t bookmarker-backend .
```

#### Frontend
```bash
cd frontend
npm run build
docker build -t bookmarker-frontend .
```

## License

This project is provided as-is for personal use.

## Contributing

This is a simple personal bookmarking application. Feel free to fork and modify for your own needs.

## Support

For issues or questions, please check the troubleshooting section above.

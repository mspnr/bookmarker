# Bookmarker

A simple, self-hosted bookmarking application with a cross-platform browser extension and a web interface for managing bookmarks.

## Features

- 🔖 **Save bookmarks** from your browser with a single click
- 📱 **Mobile support** works on Firefox Android
- 🎨 **List** saved bookmarkds
- 🗂️ **Archive** read bookmarks
- 🔐 **Secure authentication** with JWT tokens
- 🐳 **Docker support** for easy deployment

## Architecture

The application consists of three main components:

1. **Backend API** - FastAPI server with SQLite database
2. **Web UI** - React-based frontend for managing bookmarks
3. **Browser Extension** - Cross-browser extension (Firefox Desktop/Android, Chrome)

## Prerequisites

- Production
   - Docker
- Development
   - Python 3.11+
   - Node.js 18+
   - Firefox browser

## Setup

```sh
cp .env.example .env
# Edit .env and change SECRET_KEY to a random string, also see details below
# Optionally change EXTERNAL_PORT (default: 3001)
```

## Run in production via Docker

```sh
# Start and stop container
docker compose build
docker compose up -d
docker compose down
```

## DB util
Interactive CLI tool for resetting user passwords when you have backend access.

```sh
docker compose exec -it backend uv run python db_util.py
```

## Run in development - manually

### Backend

```bash
cd backend
uv venv
uv sync
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## URLs
- Production - http://localhost:3002
- Development
   - Frontend - http://localhost:3000
   - Backend API - http://localhost:8000, also proxied to http://localhost:3000/api
   - API Documentation: http://localhost:8000/docs


## First Time Setup

### Create Your Account

1. Open the web UI
2. Click "Don't have an account? Register"
3. Enter your username, email, and password
4. Click "Register"
5. Log in with your new credentials

### Configure Firefox Extension

1. Install the extension
2. Click the Bookmarker extension icon in your Firefox toolbar
3. Click the gear icon to open settings
4. Set frontend URL
5. Click the Bookmarker extension icon in your Firefox toolbar again
6. Log in with your credentials


## Usage

### Saving Bookmarks

1. Navigate to any webpage
2. Click/tap the Bookmarker extension icon
3. Confirmation message will appear, displaying that the page has been saved as a bookmark

### Managing Bookmarks

1. Open the web UI
2. View all your bookmarks (newest first)
3. Use filters to view:
   - **Active** - Unarchived bookmarks
   - **Archived** - Archived bookmarks

### Archiving Bookmarks

- Click the 📥 icon next to a bookmark to archive it
- Click the ↩️ icon to unarchive

### Deleting Bookmarks

- Click the 🗑️ icon next to a bookmark
- Confirm the deletion


## Additional notes

### Change the SECRET_KEY**
 Generate a strong random key using one of these methods:
```sh
# Or using openssl
openssl rand -base64 64

# Or using Python directly
python -c 'import secrets; print(secrets.token_urlsafe(50))'
```


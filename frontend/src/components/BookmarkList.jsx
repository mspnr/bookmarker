import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import BookmarkItem from './BookmarkItem';

export default function BookmarkList() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('active'); // 'all', 'active', 'archived'
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadBookmarks();
  }, [filter]);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      setError('');
      const archivedParam = filter === 'all' ? null : filter === 'archived';
      const data = await api.getBookmarks(archivedParam);
      setBookmarks(data);
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
      setError('Failed to load bookmarks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id, archived) => {
    // Store the previous bookmarks state for rollback on error
    const previousBookmarks = [...bookmarks];

    // Optimistically update the UI immediately
    setBookmarks((currentBookmarks) =>
      currentBookmarks.map((bookmark) =>
        bookmark.id === id
          ? { ...bookmark, archived, archived_at: archived ? new Date().toISOString() : null }
          : bookmark
      )
    );

    try {
      // Make the API call in the background
      await api.updateBookmark(id, { archived });
    } catch (err) {
      console.error('Failed to update bookmark:', err);
      // Rollback to previous state on error
      setBookmarks(previousBookmarks);
      alert('Failed to update bookmark. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    // Store the previous bookmarks state for rollback on error
    const previousBookmarks = [...bookmarks];

    // Optimistically remove the bookmark from the UI immediately
    setBookmarks((currentBookmarks) =>
      currentBookmarks.filter((bookmark) => bookmark.id !== id)
    );

    try {
      // Make the API call in the background
      await api.deleteBookmark(id);
    } catch (err) {
      console.error('Failed to delete bookmark:', err);
      // Rollback to previous state on error
      setBookmarks(previousBookmarks);
      alert('Failed to delete bookmark. Please try again.');
    }
  };

  const handleUndoLastArchive = async () => {
    try {
      // Get all archived bookmarks
      const archivedBookmarks = await api.getBookmarks(true);
      if (archivedBookmarks.length === 0) {
        alert('No archived bookmarks to restore.');
        return;
      }

      // Sort by archived_at descending to get the most recent
      const sortedBookmarks = archivedBookmarks.sort((a, b) => {
        return new Date(b.archived_at) - new Date(a.archived_at);
      });

      const lastArchivedBookmark = sortedBookmarks[0];

      // Unarchive it
      await api.updateBookmark(lastArchivedBookmark.id, { archived: false });
      await loadBookmarks();
    } catch (err) {
      console.error('Failed to undo last archive:', err);
      alert('Failed to undo last archive. Please try again.');
    }
  };

  const handleDeleteOldArchived = async () => {
    try {
      // Get all archived bookmarks
      const archivedBookmarks = await api.getBookmarks(true);
      if (archivedBookmarks.length === 0) {
        alert('No archived bookmarks found.');
        return;
      }

      // Calculate date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Filter bookmarks archived more than 30 days ago
      const oldBookmarks = archivedBookmarks.filter(bookmark => {
        return bookmark.archived_at && new Date(bookmark.archived_at) < thirtyDaysAgo;
      });

      if (oldBookmarks.length === 0) {
        alert('No archived bookmarks older than 30 days found.');
        return;
      }

      // Confirm deletion
      const message = `This will permanently delete ${oldBookmarks.length} bookmark(s) archived more than 30 days ago. Are you sure?`;
      if (!window.confirm(message)) {
        return;
      }

      // Delete each old bookmark
      for (const bookmark of oldBookmarks) {
        await api.deleteBookmark(bookmark.id);
      }

      await loadBookmarks();
      alert(`Successfully deleted ${oldBookmarks.length} old bookmark(s).`);
    } catch (err) {
      console.error('Failed to delete old archived bookmarks:', err);
      alert('Failed to delete old bookmarks. Please try again.');
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/login');
    }
  };

  return (
    <div className="bookmarks-container">
      <header className="bookmarks-header">
        <div>
          <h1>My Bookmarks</h1>
          {user && <p className="user-info">Logged in as: {user.username}</p>}
        </div>
        <div className="header-actions">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button
              className={`filter-btn ${filter === 'archived' ? 'active' : ''}`}
              onClick={() => setFilter('archived')}
            >
              Archived
            </button>
          </div>
          {filter === 'active' && (
            <button
              className="btn-icon action-btn"
              onClick={handleUndoLastArchive}
              title="Undo last archive"
            >
              ↩️
            </button>
          )}
          {filter === 'archived' && (
            <button
              className="btn-icon action-btn"
              onClick={handleDeleteOldArchived}
              title="Delete bookmarks archived more than 30 days ago"
            >
              🗑️
            </button>
          )}
          <button className="btn-icon" onClick={handleLogout} title="Logout">
            🚪
          </button>
        </div>
      </header>

      {loading && <div className="loading">Loading bookmarks...</div>}

      {error && <div className="error-message">{error}</div>}

      {!loading && !error && bookmarks.length === 0 && (
        <div className="empty-state">
          <p>No bookmarks found.</p>
          <p>Use the browser extension to save your first bookmark!</p>
        </div>
      )}

      {!loading && !error && bookmarks.length > 0 && (
        <div className="bookmarks-list">
          {bookmarks.map((bookmark) => (
            <BookmarkItem
              key={bookmark.id}
              bookmark={bookmark}
              filter={filter}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

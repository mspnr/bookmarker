export default function BookmarkItem({ bookmark, filter, onArchive, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleOpenUrl = () => {
    window.open(bookmark.url, '_blank');
  };

  return (
    <div className={`bookmark-item ${bookmark.archived ? 'archived' : ''}`}>
      <div className="bookmark-header">
        <h3 className="bookmark-title" onClick={handleOpenUrl} style={{ cursor: 'pointer' }}>
          {bookmark.title}
        </h3>
        <div className="bookmark-actions">
          <button
            className="btn-icon"
            onClick={() => onArchive(bookmark.id, !bookmark.archived)}
            title={bookmark.archived ? 'Unarchive' : 'Archive'}
          >
            {bookmark.archived ? '↩️' : '📥'}
          </button>
          {filter !== 'active' && (
            <button
              className="btn-icon btn-danger"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this bookmark?')) {
                  onDelete(bookmark.id);
                }
              }}
              title="Delete"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <a
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        className="bookmark-url"
      >
        {bookmark.url}
      </a>

      {bookmark.notes && (
        <p className="bookmark-notes">{bookmark.notes}</p>
      )}

      {filter !== 'active' && (
        <div className="bookmark-meta">
          <span className="bookmark-date">
            Saved: {formatDate(bookmark.created_at)}
          </span>
          {bookmark.archived && bookmark.archived_at && (
            <span className="bookmark-date">
              Archived: {formatDate(bookmark.archived_at)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

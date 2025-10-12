from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_active_user

router = APIRouter()


@router.post("/", response_model=schemas.Bookmark)
def create_bookmark(
    bookmark: schemas.BookmarkCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new bookmark."""
    db_bookmark = models.Bookmark(
        **bookmark.dict(),
        user_id=current_user.id
    )
    db.add(db_bookmark)
    db.commit()
    db.refresh(db_bookmark)
    return db_bookmark


@router.get("/", response_model=List[schemas.Bookmark])
def get_bookmarks(
    archived: bool = None,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all bookmarks for the current user, optionally filtered by archived status."""
    query = db.query(models.Bookmark).filter(models.Bookmark.user_id == current_user.id)

    # Filter by archived status if specified
    if archived is not None:
        query = query.filter(models.Bookmark.archived == archived)

    # Order by created_at descending (newest first)
    bookmarks = query.order_by(models.Bookmark.created_at.desc()).all()
    return bookmarks


@router.get("/{bookmark_id}", response_model=schemas.Bookmark)
def get_bookmark(
    bookmark_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific bookmark by ID."""
    bookmark = db.query(models.Bookmark).filter(
        models.Bookmark.id == bookmark_id,
        models.Bookmark.user_id == current_user.id
    ).first()

    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    return bookmark


@router.patch("/{bookmark_id}", response_model=schemas.Bookmark)
def update_bookmark(
    bookmark_id: int,
    bookmark_update: schemas.BookmarkUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a bookmark (archive/unarchive or update notes)."""
    db_bookmark = db.query(models.Bookmark).filter(
        models.Bookmark.id == bookmark_id,
        models.Bookmark.user_id == current_user.id
    ).first()

    if not db_bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    # Update fields if provided
    update_data = bookmark_update.dict(exclude_unset=True)

    # If archiving, set archived_at timestamp
    if "archived" in update_data:
        if update_data["archived"]:
            db_bookmark.archived_at = datetime.utcnow()
        else:
            db_bookmark.archived_at = None
        db_bookmark.archived = update_data["archived"]

    # Update notes if provided
    if "notes" in update_data:
        db_bookmark.notes = update_data["notes"]

    db.commit()
    db.refresh(db_bookmark)
    return db_bookmark


@router.delete("/{bookmark_id}")
def delete_bookmark(
    bookmark_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a bookmark."""
    db_bookmark = db.query(models.Bookmark).filter(
        models.Bookmark.id == bookmark_id,
        models.Bookmark.user_id == current_user.id
    ).first()

    if not db_bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    db.delete(db_bookmark)
    db.commit()
    return {"message": "Bookmark deleted successfully"}

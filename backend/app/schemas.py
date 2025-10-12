from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# User schemas
class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


# Token schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# Bookmark schemas
class BookmarkBase(BaseModel):
    url: str
    title: str
    notes: Optional[str] = None


class BookmarkCreate(BookmarkBase):
    pass


class BookmarkUpdate(BaseModel):
    archived: Optional[bool] = None
    notes: Optional[str] = None


class Bookmark(BookmarkBase):
    id: int
    user_id: int
    created_at: datetime
    archived: bool
    archived_at: Optional[datetime] = None

    class Config:
        from_attributes = True

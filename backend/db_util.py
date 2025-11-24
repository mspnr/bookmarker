#!/usr/bin/env python3
"""
Interactive CLI tool for resetting user passwords.
Usage: python reset_password.py
"""
import sys
import getpass
from pathlib import Path

# Add the backend directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import User
from app.security import get_password_hash


def reset_user_password():
    """Interactive password reset tool."""
    print("=" * 50)
    print("Password Reset Tool")
    print("=" * 50)
    print()

    # Get username
    username = input("Enter username: ").strip()
    if not username:
        print("Error: Username cannot be empty")
        return False

    # Connect to database
    db: Session = SessionLocal()
    try:
        # Find user
        user = db.query(User).filter(User.username == username).first()
        if not user:
            print(f"Error: User '{username}' not found")
            return False

        print(f"Found user: {username}")
        print(f"User ID: {user.id}")
        print(f"Created: {user.created_at}")
        print(f"Active: {user.is_active}")
        print()

        # Get new password
        while True:
            password = getpass.getpass("Enter new password: ")
            if len(password) < 6:
                print("Error: Password must be at least 6 characters long")
                continue

            password_confirm = getpass.getpass("Confirm new password: ")
            if password != password_confirm:
                print("Error: Passwords do not match. Please try again.")
                continue

            break

        # Confirm action
        print()
        confirm = input(f"Reset password for user '{username}'? (yes/no): ").strip().lower()
        if confirm not in ['yes', 'y']:
            print("Password reset cancelled")
            return False

        # Hash and update password
        hashed_password = get_password_hash(password)
        user.hashed_password = hashed_password
        db.commit()

        print()
        print("✓ Password successfully reset!")
        return True

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        return False
    finally:
        db.close()


def main():
    """Main entry point."""
    try:
        success = reset_user_password()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\nUnexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

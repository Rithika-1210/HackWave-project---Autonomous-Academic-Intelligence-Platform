from typing import Generator, Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.config import settings
from app.core.security import decode_access_token
from app.models.models import User, AuditLog

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> User:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        user = db.query(User).filter(User.id == int(user_id)).first()
    except Exception:
        user = None

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Authenticated user account does not exist"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated"
        )
    
    return user

def require_roles(allowed_roles: List[str]):
    """
    Enforce backend Role-Based Access Control (RBAC).
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: Role '{current_user.role}' lacks permission for this resource."
            )
        return current_user
    return role_checker

def log_audit_action(
    db: Session,
    user: Optional[User],
    action: str,
    resource: str,
    details: Optional[str] = None,
    ip_address: Optional[str] = None
):
    try:
        audit = AuditLog(
            user_id=user.id if user else None,
            user_email=user.email if user else "anonymous",
            action=action,
            resource=resource,
            details=details,
            ip_address=ip_address
        )
        db.add(audit)
        db.commit()
    except Exception as e:
        db.rollback()

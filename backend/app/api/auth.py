from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.config import settings
from app.models.models import User
from app.schemas.schemas import LoginRequest, TokenResponse, UserOut
from app.api.deps import get_current_user, log_audit_action

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower().strip()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        log_audit_action(
            db, None, "LOGIN_FAILED", "User",
            f"Failed login attempt for {login_data.email}",
            request.client.host if request.client else None
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect institutional email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Institutional account has been suspended or deactivated"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        subject=user.id,
        role=user.role,
        expires_delta=access_token_expires
    )

    log_audit_action(
        db, user, "LOGIN_SUCCESS", "User",
        f"User logged in with role {user.role}",
        request.client.host if request.client else None
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log_audit_action(db, current_user, "LOGOUT", "User", "User logged out")
    return {"message": "Logged out successfully"}

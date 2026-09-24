from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database.session import get_db
from app.models.models import Notification, User
from app.schemas.schemas import NotificationOut, NotificationCreate
from app.api.deps import get_current_user, require_roles

router = APIRouter(prefix="/notifications", tags=["Academic Notifications"])

@router.get("", response_model=List[NotificationOut])
def get_user_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notifications = db.query(Notification).filter(
        or_(
            Notification.user_id == current_user.id,
            Notification.role_target == current_user.role,
            Notification.role_target == "all"
        )
    ).order_by(Notification.created_at.desc()).limit(50).all()
    
    return notifications

@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = db.query(Notification).filter(
        or_(
            Notification.user_id == current_user.id,
            Notification.role_target == current_user.role,
            Notification.role_target == "all"
        ),
        Notification.is_read == False
    ).count()
    return {"unread_count": count}

@router.put("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notif.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}

@router.put("/read-all")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(Notification).filter(
        or_(
            Notification.user_id == current_user.id,
            Notification.role_target == current_user.role,
            Notification.role_target == "all"
        )
    ).update({"is_read": True}, synchronize_session=False)
    db.commit()
    return {"message": "All notifications marked as read"}

@router.post("", response_model=NotificationOut, status_code=status.HTTP_201_CREATED)
def create_notification(
    notif_in: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "hod", "exam_cell"]))
):
    notif = Notification(
        user_id=notif_in.user_id,
        role_target=notif_in.role_target,
        title=notif_in.title,
        message=notif_in.message,
        notification_type=notif_in.notification_type,
        is_read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif

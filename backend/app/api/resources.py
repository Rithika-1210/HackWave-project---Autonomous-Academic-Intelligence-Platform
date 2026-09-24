from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Classroom, User
from app.schemas.schemas import ClassroomOut, ClassroomCreate, ClassroomUpdate
from app.api.deps import get_current_user, require_roles, log_audit_action

router = APIRouter(prefix="/resources", tags=["Classroom & Laboratory Management"])

@router.get("", response_model=List[ClassroomOut])
def list_resources(
    resource_type: Optional[str] = None,
    availability_status: Optional[str] = None,
    building: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Classroom)
    if resource_type:
        query = query.filter(Classroom.resource_type == resource_type)
    if availability_status:
        query = query.filter(Classroom.availability_status == availability_status)
    if building:
        query = query.filter(Classroom.building == building)
    if search:
        query = query.filter(
            (Classroom.name.ilike(f"%{search}%")) |
            (Classroom.room_number.ilike(f"%{search}%")) |
            (Classroom.equipment.ilike(f"%{search}%"))
        )
    return query.order_by(Classroom.room_number.asc()).all()

@router.get("/{resource_id}", response_model=ClassroomOut)
def get_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resource = db.query(Classroom).filter(Classroom.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource

@router.post("", response_model=ClassroomOut, status_code=status.HTTP_201_CREATED)
def create_resource(
    r_in: ClassroomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "exam_cell"]))
):
    existing = db.query(Classroom).filter(Classroom.room_number == r_in.room_number.strip().upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Room with this number already exists. Duplicate rooms not permitted.")
    
    resource = Classroom(
        name=r_in.name.strip(),
        resource_type=r_in.resource_type,
        building=r_in.building.strip(),
        room_number=r_in.room_number.strip().upper(),
        capacity=r_in.capacity,
        equipment=r_in.equipment,
        availability_status=r_in.availability_status
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)
    
    log_audit_action(db, current_user, "CREATE_RESOURCE", "Classroom", f"Added resource {resource.room_number} ({resource.resource_type})")
    return resource

@router.put("/{resource_id}", response_model=ClassroomOut)
def update_resource(
    resource_id: int,
    r_in: ClassroomUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "exam_cell"]))
):
    resource = db.query(Classroom).filter(Classroom.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    if r_in.room_number and r_in.room_number.strip().upper() != resource.room_number:
        existing = db.query(Classroom).filter(Classroom.room_number == r_in.room_number.strip().upper()).first()
        if existing:
            raise HTTPException(status_code=400, detail="Room number is already taken by another resource")
        resource.room_number = r_in.room_number.strip().upper()

    if r_in.name is not None:
        resource.name = r_in.name.strip()
    if r_in.resource_type is not None:
        resource.resource_type = r_in.resource_type
    if r_in.building is not None:
        resource.building = r_in.building.strip()
    if r_in.capacity is not None:
        resource.capacity = r_in.capacity
    if r_in.equipment is not None:
        resource.equipment = r_in.equipment
    if r_in.availability_status is not None:
        resource.availability_status = r_in.availability_status

    db.commit()
    db.refresh(resource)
    log_audit_action(db, current_user, "UPDATE_RESOURCE", "Classroom", f"Updated resource {resource.room_number}")
    return resource

@router.delete("/{resource_id}")
def delete_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"]))
):
    resource = db.query(Classroom).filter(Classroom.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    room_number = resource.room_number
    db.delete(resource)
    db.commit()
    log_audit_action(db, current_user, "DELETE_RESOURCE", "Classroom", f"Deleted resource {room_number}")
    return {"message": f"Resource '{room_number}' successfully deleted"}

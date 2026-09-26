from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.models import Department, Faculty, Student, User
from app.schemas.schemas import DepartmentOut, DepartmentCreate, DepartmentUpdate
from app.api.deps import get_current_user, require_roles, log_audit_action

router = APIRouter(prefix="/departments", tags=["Department Management"])

@router.get("", response_model=List[DepartmentOut])
def list_departments(
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Department)
    if status_filter:
        query = query.filter(Department.status == status_filter)
    if search:
        query = query.filter(
            (Department.name.ilike(f"%{search}%")) | (Department.code.ilike(f"%{search}%"))
        )
    
    # All roles except admin and exam_cell are strictly scoped to their own assigned department
    if current_user.role in ["faculty", "hod", "student"] and current_user.department_id:
        query = query.filter(Department.id == current_user.department_id)
    
    departments = query.order_by(Department.name.asc()).all()
    
    # Enrich with counts
    result = []
    for dept in departments:
        f_count = db.query(func.count(Faculty.id)).filter(Faculty.department_id == dept.id).scalar() or 0
        s_count = db.query(func.count(Student.id)).filter(Student.department_id == dept.id).scalar() or 0
        
        dept_dict = {
            "id": dept.id,
            "name": dept.name,
            "code": dept.code,
            "hod_name": dept.hod_name,
            "description": dept.description,
            "status": dept.status,
            "created_at": dept.created_at,
            "faculty_count": f_count,
            "student_count": s_count
        }
        result.append(DepartmentOut(**dept_dict))
    
    return result

@router.get("/{dept_id}", response_model=DepartmentOut)
def get_department(
    dept_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    
    f_count = db.query(func.count(Faculty.id)).filter(Faculty.department_id == dept.id).scalar() or 0
    s_count = db.query(func.count(Student.id)).filter(Student.department_id == dept.id).scalar() or 0
    
    return DepartmentOut(
        id=dept.id,
        name=dept.name,
        code=dept.code,
        hod_name=dept.hod_name,
        description=dept.description,
        status=dept.status,
        created_at=dept.created_at,
        faculty_count=f_count,
        student_count=s_count
    )

@router.post("", response_model=DepartmentOut, status_code=status.HTTP_201_CREATED)
def create_department(
    dept_in: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"]))
):
    existing = db.query(Department).filter(
        (Department.name.ilike(dept_in.name)) | (Department.code.ilike(dept_in.code))
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department with this name or code already exists")
    
    dept = Department(
        name=dept_in.name.strip(),
        code=dept_in.code.strip().upper(),
        hod_name=dept_in.hod_name,
        description=dept_in.description,
        status=dept_in.status
    )
    db.add(dept)
    db.commit()
    db.refresh(dept)
    
    log_audit_action(db, current_user, "CREATE_DEPARTMENT", "Department", f"Created department {dept.name} ({dept.code})")
    
    return DepartmentOut(
        id=dept.id,
        name=dept.name,
        code=dept.code,
        hod_name=dept.hod_name,
        description=dept.description,
        status=dept.status,
        created_at=dept.created_at,
        faculty_count=0,
        student_count=0
    )

@router.put("/{dept_id}", response_model=DepartmentOut)
def update_department(
    dept_id: int,
    dept_in: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"]))
):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    
    if dept_in.name is not None:
        dept.name = dept_in.name.strip()
    if dept_in.code is not None:
        dept.code = dept_in.code.strip().upper()
    if dept_in.hod_name is not None:
        dept.hod_name = dept_in.hod_name
    if dept_in.description is not None:
        dept.description = dept_in.description
    if dept_in.status is not None:
        dept.status = dept_in.status
    
    db.commit()
    db.refresh(dept)
    log_audit_action(db, current_user, "UPDATE_DEPARTMENT", "Department", f"Updated department {dept.code}")
    
    f_count = db.query(func.count(Faculty.id)).filter(Faculty.department_id == dept.id).scalar() or 0
    s_count = db.query(func.count(Student.id)).filter(Student.department_id == dept.id).scalar() or 0
    return DepartmentOut(
        id=dept.id,
        name=dept.name,
        code=dept.code,
        hod_name=dept.hod_name,
        description=dept.description,
        status=dept.status,
        created_at=dept.created_at,
        faculty_count=f_count,
        student_count=s_count
    )

@router.delete("/{dept_id}")
def delete_department(
    dept_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"]))
):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    
    name = dept.name
    db.delete(dept)
    db.commit()
    log_audit_action(db, current_user, "DELETE_DEPARTMENT", "Department", f"Deleted department {name}")
    return {"message": f"Department '{name}' successfully deleted"}

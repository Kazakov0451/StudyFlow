from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models, schemas
from typing import Optional

def get_tasks(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    order: Optional[str] = None
):
    query = db.query(models.Task)
    if status:
        query = query.filter(models.Task.status == status)
    if search:
        query = query.filter(models.Task.title.ilike(f"%{search}%"))
    if sort_by:
        sort_column = getattr(models.Task, sort_by, None)
        if sort_column:
            if order and order.lower() == "desc":
                query = query.order_by(sort_column.desc())
            else:
                query = query.order_by(sort_column.asc())
    return query.offset(skip).limit(limit).all()

def get_task_stats(db: Session):
    stats = db.query(
        models.Task.status,
        func.count(models.Task.id).label("count")
    ).group_by(models.Task.status).all()
    return {status.value: count for status, count in stats}

def get_task(db: Session, task_id: int):
    return db.query(models.Task).filter(models.Task.id == task_id).first()

def create_task(db: Session, task: schemas.TaskCreate):
    db_task = models.Task(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: int, task_update: schemas.TaskUpdate):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task:
        update_data = task_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_task, key, value)
        db.commit()
        db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task:
        db.delete(db_task)
        db.commit()
    return db_task
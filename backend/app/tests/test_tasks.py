import pytest
from fastapi.testclient import TestClient
from app import models
from datetime import datetime

def test_read_root(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Welcome to StudyFlow API"

def test_create_task(client):
    task_data = {
        "title": "Test Task",
        "description": "Test description",
        "deadline": "2026-06-15T10:00:00",
        "status": "pending"
    }
    response = client.post("/tasks", json=task_data)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Task"
    assert data["description"] == "Test description"
    assert data["status"] == "pending"
    assert "id" in data

def test_get_tasks(client):
    # Создаём тестовые задачи
    task1 = {"title": "Task 1", "status": "pending"}
    task2 = {"title": "Task 2", "status": "completed"}
    client.post("/tasks", json=task1)
    client.post("/tasks", json=task2)
    
    response = client.get("/tasks")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

def test_get_task_by_id(client):
    # Создаём задачу
    create_resp = client.post("/tasks", json={"title": "Get by ID Test"})
    task_id = create_resp.json()["id"]
    
    response = client.get(f"/tasks/{task_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == task_id
    assert data["title"] == "Get by ID Test"

def test_get_task_not_found(client):
    response = client.get("/tasks/9999")
    assert response.status_code == 404

def test_update_task(client):
    # Создаём задачу
    create_resp = client.post("/tasks", json={"title": "Update Test"})
    task_id = create_resp.json()["id"]
    
    update_data = {"title": "Updated Title", "status": "in_progress"}
    response = client.put(f"/tasks/{task_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["status"] == "in_progress"

def test_update_task_not_found(client):
    response = client.put("/tasks/9999", json={"title": "Test"})
    assert response.status_code == 404

def test_delete_task(client):
    # Создаём задачу
    create_resp = client.post("/tasks", json={"title": "Delete Test"})
    task_id = create_resp.json()["id"]
    
    response = client.delete(f"/tasks/{task_id}")
    assert response.status_code == 200
    
    # Проверяем, что задача удалена
    get_resp = client.get(f"/tasks/{task_id}")
    assert get_resp.status_code == 404

def test_delete_task_not_found(client):
    response = client.delete("/tasks/9999")
    assert response.status_code == 404

def test_filter_by_status(client):
    # Создаём задачи с разными статусами
    client.post("/tasks", json={"title": "Pending Task", "status": "pending"})
    client.post("/tasks", json={"title": "Completed Task", "status": "completed"})
    
    response = client.get("/tasks?status=pending")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Pending Task"

def test_search_by_title(client):
    # Создаём задачи
    client.post("/tasks", json={"title": "Math Homework"})
    client.post("/tasks", json={"title": "Physics Lab"})
    
    response = client.get("/tasks?search=Math")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Math Homework"

def test_sort_tasks(client):
    # Создаём задачи
    client.post("/tasks", json={"title": "Task A"})
    client.post("/tasks", json={"title": "Task B"})
    
    response = client.get("/tasks?sort_by=title&order=asc")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["title"] == "Task A"
    assert data[1]["title"] == "Task B"

def test_sort_tasks_desc(client):
    # Создаём задачи
    client.post("/tasks", json={"title": "Task A"})
    client.post("/tasks", json={"title": "Task B"})
    
    response = client.get("/tasks?sort_by=title&order=desc")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["title"] == "Task B"
    assert data[1]["title"] == "Task A"

def test_get_tasks_stats(client):
    # Создаём задачи с разными статусами
    client.post("/tasks", json={"title": "Task 1", "status": "pending"})
    client.post("/tasks", json={"title": "Task 2", "status": "pending"})
    client.post("/tasks", json={"title": "Task 3", "status": "completed"})
    
    response = client.get("/tasks/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["pending"] == 2
    assert data["completed"] == 1

def test_validation_error(client):
    # Пытаемся создать задачу без обязательного поля title
    response = client.post("/tasks", json={"description": "No title"})
    assert response.status_code == 422

def test_pagination(client):
    # Создаём 5 задач
    for i in range(5):
        client.post("/tasks", json={"title": f"Task {i}"})
    
    response = client.get("/tasks?skip=0&limit=2")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    
    response = client.get("/tasks?skip=2&limit=2")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
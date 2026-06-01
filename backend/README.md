# StudyFlow Backend

Backend для приложения StudyFlow — веб-приложения для управления учебными задачами.

## Технологии

- **Python 3** — язык программирования
- **FastAPI** — современный веб-фреймворк для создания API
- **SQLAlchemy** — ORM для работы с базой данных
- **PostgreSQL** — реляционная база данных
- **Pydantic** — валидация данных
- **Uvicorn** — ASGI сервер

## Быстрый старт

1. Установите зависимости:
```bash
pip install -r requirements.txt
```

2. Запустите сервер:
```bash
uvicorn app.main:app --reload
```

3. Откройте в браузере: http://localhost:8000

## API Endpoints

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/` | Приветственное сообщение |
| GET | `/tasks` | Получить список задач (с фильтрацией по статусу) |
| GET | `/tasks/{id}` | Получить задачу по ID |
| POST | `/tasks` | Создать новую задачу |
| PUT | `/tasks/{id}` | Обновить задачу |
| DELETE | `/tasks/{id}` | Удалить задачу |

## Документация API

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
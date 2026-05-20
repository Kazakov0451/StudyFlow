# StudyFlow Backend

Backend для приложения StudyFlow — веб-приложения для управления учебными задачами.

## Технологии

- **FastAPI** — современный веб-фреймворк для Python
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
| GET | `/` | Hello World |

## Документация API

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
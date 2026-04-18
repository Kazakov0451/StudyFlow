# StudyFlow Backend

Backend для приложения StudyFlow — веб-приложения для управления учебными задачами.

## Технологии

- **FastAPI** — современный веб-фреймворк для Python
- **SQLAlchemy** — ORM для работы с базой данных
- **PostgreSQL** — реляционная база данных
- **Pydantic** — валидация данных
- **Uvicorn** — ASGI сервер

## Установка

1. Создайте виртуальное окружение:
```bash
python -m venv venv
```

2. Активируйте окружение:
```bash
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

3. Установите зависимости:
```bash
pip install -r requirements.txt
```

4. Создайте файл `.env` на основе `.env.example` и настройте подключение к PostgreSQL:
```bash
cp .env.example .env
```

5. Запустите сервер:
```bash
uvicorn app.main:app --reload
```

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

После запуска сервера доступна автоматическая документация:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
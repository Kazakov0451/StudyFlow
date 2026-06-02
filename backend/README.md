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
| GET | `/tasks` | Получить список задач (с фильтрацией, поиском, сортировкой) |
| GET | `/tasks/stats` | Получить статистику по статусам задач |
| GET | `/tasks/{id}` | Получить задачу по ID |
| POST | `/tasks` | Создать новую задачу |
| PUT | `/tasks/{id}` | Обновить задачу |
| DELETE | `/tasks/{id}` | Удалить задачу |

### Параметры GET /tasks

| Параметр | Тип | Описание |
|----------|-----|----------|
| `skip` | int | Пропустить N задач (пагинация) |
| `limit` | int | Максимальное количество задач |
| `status` | str | Фильтр по статусу (pending/in_progress/completed) |
| `search` | str | Поиск по названию задачи |
| `sort_by` | str | Сортировка по полю (deadline/created_at/status/title) |
| `order` | str | Порядок сортировки (asc/desc) |

## Тестирование

Запуск тестов:
```bash
pip install pytest
pytest app/tests/
```

## Docker

Запуск с помощью docker-compose:
```bash
docker-compose up -d
```

Backend будет доступен по адресу: http://localhost:8000

## Документация API

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
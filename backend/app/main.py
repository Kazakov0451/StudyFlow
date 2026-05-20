from fastapi import FastAPI

app = FastAPI(
    title="StudyFlow API",
    description="API для управления учебными задачами и дедлайнами",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}
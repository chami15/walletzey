from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.v1 import transactions, categories, recurring, import_extract

app = FastAPI(
    title="Walletzey API",
    description="Backend da carteira digital Walletzey",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router, prefix="/api/v1")
app.include_router(categories.router, prefix="/api/v1")
app.include_router(recurring.router, prefix="/api/v1")
app.include_router(import_extract.router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok", "service": "walletzey-api"}

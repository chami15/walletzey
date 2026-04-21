from fastapi import APIRouter, HTTPException
from db.supabase_client import get_supabase
from models.schemas import CategoryCreate, CategoryOut

router = APIRouter(prefix="/categories", tags=["categories"])

DEFAULT_CATEGORIES = [
    {"nome": "Alimentação", "cor": "#f97316", "icone": "🍔"},
    {"nome": "Transporte", "cor": "#3b82f6", "icone": "🚗"},
    {"nome": "Moradia", "cor": "#8b5cf6", "icone": "🏠"},
    {"nome": "Saúde", "cor": "#10b981", "icone": "❤️"},
    {"nome": "Lazer", "cor": "#f59e0b", "icone": "🎮"},
    {"nome": "Streaming", "cor": "#ef4444", "icone": "📺"},
    {"nome": "Salário", "cor": "#22c55e", "icone": "💼"},
    {"nome": "Investimentos", "cor": "#06b6d4", "icone": "📈"},
    {"nome": "Educação", "cor": "#a855f7", "icone": "📚"},
    {"nome": "Outros", "cor": "#6b7280", "icone": "📦"},
]


@router.get("/", response_model=list[CategoryOut])
def listar_categorias():
    supabase = get_supabase()
    response = supabase.table("categorias").select("*").order("nome").execute()

    # Se não houver categorias, seed com as padrão
    if not response.data:
        supabase.table("categorias").insert(DEFAULT_CATEGORIES).execute()
        response = supabase.table("categorias").select("*").order("nome").execute()

    return response.data


@router.post("/", response_model=CategoryOut, status_code=201)
def criar_categoria(payload: CategoryCreate):
    supabase = get_supabase()
    response = supabase.table("categorias").insert(payload.model_dump()).execute()
    if not response.data:
        raise HTTPException(status_code=500, detail="Erro ao criar categoria")
    return response.data[0]


@router.put("/{category_id}", response_model=CategoryOut)
def atualizar_categoria(category_id: int, payload: CategoryCreate):
    supabase = get_supabase()
    response = (
        supabase.table("categorias")
        .update(payload.model_dump())
        .eq("id", category_id)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    return response.data[0]


@router.delete("/{category_id}", status_code=204)
def deletar_categoria(category_id: int):
    supabase = get_supabase()
    response = supabase.table("categorias").delete().eq("id", category_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")

from fastapi import APIRouter, HTTPException
from db.supabase_client import get_supabase
from models.schemas import RecurringCreate, RecurringOut

router = APIRouter(prefix="/recurring", tags=["recurring"])


@router.get("/", response_model=list[RecurringOut])
def listar_recorrentes():
    supabase = get_supabase()
    response = (
        supabase.table("recorrentes")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )
    return response.data


@router.post("/", response_model=RecurringOut, status_code=201)
def criar_recorrente(payload: RecurringCreate):
    supabase = get_supabase()
    data = payload.model_dump()
    response = supabase.table("recorrentes").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=500, detail="Erro ao criar recorrente")
    return response.data[0]


@router.put("/{recurring_id}", response_model=RecurringOut)
def atualizar_recorrente(recurring_id: int, payload: RecurringCreate):
    supabase = get_supabase()
    response = (
        supabase.table("recorrentes")
        .update(payload.model_dump())
        .eq("id", recurring_id)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Recorrente não encontrado")
    return response.data[0]


@router.patch("/{recurring_id}/toggle", response_model=RecurringOut)
def alternar_ativo(recurring_id: int):
    supabase = get_supabase()
    resp = supabase.table("recorrentes").select("ativo").eq("id", recurring_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Recorrente não encontrado")
    novo_estado = not resp.data[0]["ativo"]
    response = (
        supabase.table("recorrentes")
        .update({"ativo": novo_estado})
        .eq("id", recurring_id)
        .execute()
    )
    return response.data[0]


@router.delete("/{recurring_id}", status_code=204)
def deletar_recorrente(recurring_id: int):
    supabase = get_supabase()
    response = supabase.table("recorrentes").delete().eq("id", recurring_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Recorrente não encontrado")

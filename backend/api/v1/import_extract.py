from fastapi import APIRouter, UploadFile, File, HTTPException
from db.supabase_client import get_supabase
from models.schemas import ImportPreview, ImportConfirm, TransactionCreate
from services.deduplication import gerar_hash, extrato_ja_importado, registrar_extrato
from services.parser import processar_extrato
from services.agent import analisar_extrato

router = APIRouter(prefix="/import", tags=["import"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/preview", response_model=ImportPreview)
async def preview_extrato(file: UploadFile = File(...)):
    """
    Recebe o arquivo, verifica duplicata, processa com o agente e retorna
    um preview das transações para o usuário confirmar antes de salvar.
    """
    if file.content_type not in ("application/pdf", "text/csv", "application/octet-stream"):
        nome = (file.filename or "").lower()
        if not (nome.endswith(".pdf") or nome.endswith(".csv")):
            raise HTTPException(
                status_code=415,
                detail="Formato não suportado. Envie um arquivo PDF ou CSV.",
            )

    conteudo = await file.read()

    if len(conteudo) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Arquivo muito grande (máx 10 MB).")

    hash_arquivo = gerar_hash(conteudo)

    if extrato_ja_importado(hash_arquivo):
        raise HTTPException(
            status_code=409,
            detail="Este extrato já foi importado anteriormente.",
        )

    # Busca categorias do usuário para guiar o agente
    supabase = get_supabase()
    resp_cats = supabase.table("categorias").select("nome").execute()
    categorias = [r["nome"] for r in resp_cats.data]

    texto = processar_extrato(conteudo, file.filename or "extrato.pdf")
    transacoes = analisar_extrato(texto, categorias)

    return ImportPreview(
        hash=hash_arquivo,
        total=len(transacoes),
        transacoes=transacoes,
    )


@router.post("/confirm", status_code=201)
def confirmar_importacao(payload: ImportConfirm):
    """
    Salva as transações confirmadas pelo usuário e registra o hash para evitar duplicatas.
    """
    if extrato_ja_importado(payload.hash):
        raise HTTPException(
            status_code=409,
            detail="Este extrato já foi importado.",
        )

    supabase = get_supabase()

    registros = []
    for tx in payload.transacoes:
        data = tx.model_dump()
        if hasattr(data["data"], "isoformat"):
            data["data"] = data["data"].isoformat()
        registros.append(data)

    if registros:
        supabase.table("walletzey").insert(registros).execute()

    registrar_extrato(payload.hash, "extrato_importado")

    return {"importadas": len(registros)}

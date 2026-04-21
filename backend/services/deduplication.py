import hashlib
from db.supabase_client import get_supabase


def gerar_hash(conteudo: bytes) -> str:
    """Gera SHA-256 do conteúdo binário do arquivo."""
    return hashlib.sha256(conteudo).hexdigest()


def extrato_ja_importado(hash_arquivo: str) -> bool:
    """Retorna True se o hash já existe em extratos_importados."""
    supabase = get_supabase()
    response = (
        supabase.table("extratos_importados")
        .select("id")
        .eq("hash", hash_arquivo)
        .execute()
    )
    return len(response.data) > 0


def registrar_extrato(hash_arquivo: str, nome_arquivo: str) -> None:
    """Registra o hash do extrato importado para evitar duplicatas futuras."""
    supabase = get_supabase()
    supabase.table("extratos_importados").insert(
        {"hash": hash_arquivo, "nome_arquivo": nome_arquivo}
    ).execute()

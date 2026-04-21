import io
import tempfile
import os
import pandas as pd
from docling.document_converter import DocumentConverter


def pdf_para_markdown(conteudo: bytes) -> str:
    """Converte bytes de um PDF para Markdown usando docling."""
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(conteudo)
        tmp_path = tmp.name

    try:
        converter = DocumentConverter()
        result = converter.convert(tmp_path)
        return result.document.export_to_markdown()
    finally:
        os.unlink(tmp_path)


def csv_para_texto(conteudo: bytes) -> str:
    """Lê CSV e retorna uma representação textual estruturada para o agente."""
    try:
        df = pd.read_csv(io.BytesIO(conteudo), encoding="utf-8")
    except UnicodeDecodeError:
        df = pd.read_csv(io.BytesIO(conteudo), encoding="latin-1")

    # Remove colunas totalmente vazias
    df.dropna(axis=1, how="all", inplace=True)

    # Limita a 500 linhas para não explodir o contexto do agente
    if len(df) > 500:
        df = df.head(500)

    return df.to_string(index=False)


def processar_extrato(conteudo: bytes, nome_arquivo: str) -> str:
    """Detecta o tipo do arquivo e retorna texto processado para o agente."""
    nome_lower = nome_arquivo.lower()

    if nome_lower.endswith(".pdf"):
        return pdf_para_markdown(conteudo)
    elif nome_lower.endswith(".csv"):
        return csv_para_texto(conteudo)
    else:
        raise ValueError(f"Formato não suportado: {nome_arquivo}. Use PDF ou CSV.")

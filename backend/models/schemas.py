from datetime import date, datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field


# ── Categorias ────────────────────────────────────────────────────────────────

class CategoryCreate(BaseModel):
    nome: str
    cor: Optional[str] = None   # ex: "#6366f1"
    icone: Optional[str] = None  # emoji


class CategoryOut(CategoryCreate):
    id: int
    created_at: datetime


# ── Recorrentes ───────────────────────────────────────────────────────────────

class RecurringCreate(BaseModel):
    descricao: str
    valor: float
    tipo_recorrencia: Literal["parcelado", "subscription"]
    parcelas_total: Optional[int] = None
    parcela_atual: Optional[int] = None
    dia_cobranca: Optional[int] = None
    categoria: Optional[str] = None


class RecurringOut(RecurringCreate):
    id: int
    ativo: bool
    created_at: datetime


# ── Transações ────────────────────────────────────────────────────────────────

class TransactionCreate(BaseModel):
    data: date
    descricao: Optional[str] = None
    debito: Optional[float] = None
    credito: Optional[float] = None
    categoria: Optional[str] = None
    recorrente: bool = False
    tipo_recorrencia: Optional[Literal["parcelado", "subscription"]] = None
    parcelas_total: Optional[int] = None
    parcela_atual: Optional[int] = None
    dia_cobranca: Optional[int] = None
    fonte: Optional[Literal["extrato_pdf", "extrato_csv", "manual"]] = "manual"


class TransactionOut(TransactionCreate):
    id: int
    created_at: datetime


class TransactionFilter(BaseModel):
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    categoria: Optional[str] = None


# ── Agente IA — saída estruturada ─────────────────────────────────────────────

class TransactionFromAgent(BaseModel):
    data: str = Field(description="Data no formato YYYY-MM-DD")
    descricao: str = Field(description="Descrição da transação")
    debito: Optional[float] = Field(None, description="Valor debitado (positivo)")
    credito: Optional[float] = Field(None, description="Valor creditado (positivo)")
    categoria: str = Field(description="Categoria da transação")
    tipo_recorrencia: Optional[Literal["parcelado", "subscription"]] = Field(
        None, description="'parcelado' se for compra parcelada, 'subscription' se for assinatura mensal"
    )
    parcela_atual: Optional[int] = Field(None, description="Número da parcela atual")
    parcelas_total: Optional[int] = Field(None, description="Total de parcelas")
    dia_cobranca: Optional[int] = Field(None, description="Dia do mês de cobrança (subscriptions)")


class AgentAnalysisResult(BaseModel):
    transacoes: list[TransactionFromAgent]


# ── Importação ────────────────────────────────────────────────────────────────

class ImportPreview(BaseModel):
    hash: str
    total: int
    transacoes: list[TransactionFromAgent]


class ImportConfirm(BaseModel):
    hash: str
    transacoes: list[TransactionCreate]


class BatchDeleteRequest(BaseModel):
    ids: list[int]


# ── Dashboard KPIs ────────────────────────────────────────────────────────────

class DashboardKPIs(BaseModel):
    saldo_conta: float
    gastos_previstos: float
    total_gasto_mes: float
    total_ganho_mes: float
    mes_referencia: str  # ex: "2026-04"


class ChartPoint(BaseModel):
    dia: str
    entradas: float
    saidas: float


class CategoryChartPoint(BaseModel):
    categoria: str
    valor: float


class DashboardCharts(BaseModel):
    evolucao_mensal: list[ChartPoint]
    gastos_por_categoria: list[CategoryChartPoint]

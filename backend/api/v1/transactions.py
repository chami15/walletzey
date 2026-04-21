from datetime import date
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from db.supabase_client import get_supabase
from models.schemas import TransactionCreate, TransactionOut, DashboardKPIs, DashboardCharts, ChartPoint, CategoryChartPoint, BatchDeleteRequest
from calendar import month_abbr
import datetime

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/", response_model=list[TransactionOut])
def listar_transacoes(
    data_inicio: Optional[date] = Query(None),
    data_fim: Optional[date] = Query(None),
    categoria: Optional[str] = Query(None),
):
    supabase = get_supabase()
    query = supabase.table("walletzey").select("*").order("data", desc=True)

    if data_inicio:
        query = query.gte("data", data_inicio.isoformat())
    if data_fim:
        query = query.lte("data", data_fim.isoformat())
    if categoria:
        query = query.eq("categoria", categoria)

    response = query.execute()
    return response.data


@router.get("/dashboard/kpis", response_model=DashboardKPIs)
def kpis_dashboard(
    data_inicio: Optional[date] = Query(None),
    data_fim: Optional[date] = Query(None),
):
    supabase = get_supabase()
    hoje = datetime.date.today()

    # Define o período para gasto/ganho — se não filtrado, usa o mês atual
    if data_inicio and data_fim:
        periodo_inicio = data_inicio.isoformat()
        periodo_fim = data_fim.isoformat()
        mes_referencia = f"{data_inicio.strftime('%Y-%m')}"
    else:
        periodo_inicio = hoje.replace(day=1).isoformat()
        if hoje.month == 12:
            fim = hoje.replace(year=hoje.year + 1, month=1, day=1)
        else:
            fim = hoje.replace(month=hoje.month + 1, day=1)
        periodo_fim = (fim - datetime.timedelta(days=1)).isoformat()
        mes_referencia = hoje.strftime("%Y-%m")

    # Gasto e ganho do período filtrado
    resp_mes = (
        supabase.table("walletzey")
        .select("debito, credito")
        .gte("data", periodo_inicio)
        .lte("data", periodo_fim)
        .execute()
    )
    total_gasto = sum(float(r["debito"] or 0) for r in resp_mes.data)
    total_ganho = sum(float(r["credito"] or 0) for r in resp_mes.data)

    # Saldo ACUMULATIVO: sempre todos os registros, nunca filtrado
    resp_todos = supabase.table("walletzey").select("debito, credito").execute()
    saldo = sum(float(r["credito"] or 0) - float(r["debito"] or 0) for r in resp_todos.data)

    # Gastos previstos: recorrentes ativos
    resp_rec = (
        supabase.table("recorrentes")
        .select("valor, tipo_recorrencia, parcelas_total, parcela_atual, ativo")
        .eq("ativo", True)
        .execute()
    )
    gastos_previstos = 0.0
    for rec in resp_rec.data:
        if rec["tipo_recorrencia"] == "subscription":
            gastos_previstos += float(rec["valor"])
        elif rec["tipo_recorrencia"] == "parcelado":
            if rec.get("parcela_atual") and rec.get("parcelas_total"):
                if rec["parcela_atual"] <= rec["parcelas_total"]:
                    gastos_previstos += float(rec["valor"])

    return DashboardKPIs(
        saldo_conta=saldo,
        gastos_previstos=gastos_previstos,
        total_gasto_mes=total_gasto,
        total_ganho_mes=total_ganho,
        mes_referencia=mes_referencia,
    )


@router.get("/dashboard/charts", response_model=DashboardCharts)
def charts_dashboard(
    data_inicio: Optional[date] = Query(None),
    data_fim: Optional[date] = Query(None),
):
    supabase = get_supabase()
    hoje = datetime.date.today()

    if data_inicio and data_fim:
        mes_inicio = data_inicio.isoformat()
        mes_fim = data_fim.isoformat()
    else:
        mes_inicio = hoje.replace(day=1).isoformat()
        if hoje.month == 12:
            mes_fim = hoje.replace(year=hoje.year + 1, month=1, day=1)
        else:
            mes_fim = hoje.replace(month=hoje.month + 1, day=1)
        mes_fim = (mes_fim - datetime.timedelta(days=1)).isoformat()

    resp = (
        supabase.table("walletzey")
        .select("data, debito, credito, categoria")
        .gte("data", mes_inicio)
        .lte("data", mes_fim)
        .order("data")
        .execute()
    )

    # Evolução diária
    por_dia: dict[str, dict] = {}
    por_categoria: dict[str, float] = {}

    for row in resp.data:
        dia = row["data"]
        if dia not in por_dia:
            por_dia[dia] = {"entradas": 0.0, "saidas": 0.0}
        por_dia[dia]["entradas"] += float(row["credito"] or 0)
        por_dia[dia]["saidas"] += float(row["debito"] or 0)

        cat = row["categoria"] or "Outros"
        por_categoria[cat] = por_categoria.get(cat, 0.0) + float(row["debito"] or 0)

    evolucao = [
        ChartPoint(dia=dia, entradas=vals["entradas"], saidas=vals["saidas"])
        for dia, vals in sorted(por_dia.items())
    ]
    categorias = [
        CategoryChartPoint(categoria=cat, valor=val)
        for cat, val in sorted(por_categoria.items(), key=lambda x: x[1], reverse=True)
    ]

    return DashboardCharts(evolucao_mensal=evolucao, gastos_por_categoria=categorias)


@router.post("/", response_model=TransactionOut, status_code=201)
def criar_transacao(payload: TransactionCreate):
    supabase = get_supabase()
    data = payload.model_dump()
    data["data"] = data["data"].isoformat()
    response = supabase.table("walletzey").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=500, detail="Erro ao inserir transação")
    return response.data[0]


@router.delete("/batch", status_code=204)
def deletar_transacoes_batch(payload: BatchDeleteRequest):
    """Exclui múltiplas transações de uma vez."""
    if not payload.ids:
        return
    supabase = get_supabase()
    supabase.table("walletzey").delete().in_("id", payload.ids).execute()


@router.delete("/{transaction_id}", status_code=204)
def deletar_transacao(transaction_id: int):
    supabase = get_supabase()
    response = supabase.table("walletzey").delete().eq("id", transaction_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Transação não encontrada")

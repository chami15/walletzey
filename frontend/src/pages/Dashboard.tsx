import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Wallet, TrendingDown, TrendingUp, CalendarClock,
  ArrowRight, Plus, Filter, X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import KPICard from '@/components/KPICard';
import TransactionList from '@/components/TransactionList';
import { getDashboardKPIs, getDashboardCharts, getTransactions, deleteTransaction } from '@/services/api';
import { formatMonth, formatCurrency } from '@/lib/utils';

const CHART_COLORS = [
  '#f97316', '#3b82f6', '#8b5cf6', '#10b981',
  '#f59e0b', '#ef4444', '#06b6d4', '#a855f7',
];

export default function Dashboard() {
  const qc = useQueryClient();
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filterParams = dataInicio && dataFim
    ? { data_inicio: dataInicio, data_fim: dataFim }
    : undefined;

  const hasFilters = !!(dataInicio && dataFim);

  const clearFilters = () => {
    setDataInicio('');
    setDataFim('');
  };

  const { data: kpis, isLoading: loadingKPIs } = useQuery({
    queryKey: ['dashboard-kpis', dataInicio, dataFim],
    queryFn: () => getDashboardKPIs(filterParams),
  });

  const { data: charts } = useQuery({
    queryKey: ['dashboard-charts', dataInicio, dataFim],
    queryFn: () => getDashboardCharts(filterParams),
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions-recent'],
    queryFn: () => getTransactions(),
  });

  const handleDelete = async (id: number) => {
    await deleteTransaction(id);
    qc.invalidateQueries({ queryKey: ['transactions-recent'] });
    qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    qc.invalidateQueries({ queryKey: ['dashboard-charts'] });
  };

  const recentTransactions = transactions.slice(0, 5);

  const periodoLabel = hasFilters
    ? `${new Date(dataInicio + 'T00:00:00').toLocaleDateString('pt-BR')} – ${new Date(dataFim + 'T00:00:00').toLocaleDateString('pt-BR')}`
    : kpis ? formatMonth(kpis.mes_referencia) : '';

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          {periodoLabel && (
            <p className="text-sm text-muted-foreground mt-0.5">{periodoLabel}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
              hasFilters
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-card border-border hover:bg-accent'
            }`}
          >
            <Filter className="w-4 h-4" />
            {hasFilters ? 'Filtrado' : 'Filtrar'}
            {hasFilters && <span className="w-2 h-2 bg-primary rounded-full" />}
          </button>
          <Link
            to="/importar"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity beautiful-shadow"
          >
            <Plus className="w-4 h-4" />
            Importar
          </Link>
        </div>
      </div>

      {/* Filtro de período */}
      {showFilters && (
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3 animate-slide-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Data início</label>
              <input
                type="date"
                value={dataInicio}
                onChange={e => setDataInicio(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Data fim</label>
              <input
                type="date"
                value={dataFim}
                onChange={e => setDataFim(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            O saldo em conta é sempre acumulativo e não é afetado pelo filtro.
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Limpar filtro
            </button>
          )}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loadingKPIs ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
          ))
        ) : kpis ? (
          <>
            <KPICard
              label="Saldo em conta"
              value={kpis.saldo_conta}
              icon={Wallet}
              variant={kpis.saldo_conta >= 0 ? 'positive' : 'negative'}
            />
            <KPICard
              label="Gastos previstos"
              value={kpis.gastos_previstos}
              icon={CalendarClock}
              variant="warning"
            />
            <KPICard
              label="Gasto no mês"
              value={kpis.total_gasto_mes}
              icon={TrendingDown}
              variant="negative"
            />
            <KPICard
              label="Ganho no mês"
              value={kpis.total_ganho_mes}
              icon={TrendingUp}
              variant="positive"
            />
          </>
        ) : null}
      </div>

      {/* Gráficos */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Evolução mensal */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5 shadow-card">
            <h2 className="text-sm font-semibold text-foreground mb-4">Evolução do mês</h2>
            {charts.evolucao_mensal.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={charts.evolucao_mensal}>
                  <defs>
                    <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="dia"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(v) => v.split('-')[2]}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                    width={48}
                  />
                  <Tooltip
                    formatter={(val: number) => formatCurrency(val)}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid hsl(var(--border))',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="entradas" stroke="#10b981" fill="url(#colorEntradas)" strokeWidth={2} name="Entradas" />
                  <Area type="monotone" dataKey="saidas" stroke="#f97316" fill="url(#colorSaidas)" strokeWidth={2} name="Saídas" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                Sem dados no mês atual
              </div>
            )}
          </div>

          {/* Gastos por categoria */}
          <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
            <h2 className="text-sm font-semibold text-foreground mb-4">Por categoria</h2>
            {charts.gastos_por_categoria.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={charts.gastos_por_categoria}
                    dataKey="valor"
                    nameKey="categoria"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {charts.gastos_por_categoria.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => formatCurrency(val)}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid hsl(var(--border))',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(v) => <span style={{ fontSize: '11px' }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                Sem dados
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transações recentes */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Transações recentes</h2>
          <Link
            to="/transacoes"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Ver todas
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <TransactionList transactions={recentTransactions} onDelete={handleDelete} />
      </div>
    </div>
  );
}

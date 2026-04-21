export interface Transaction {
  id: number;
  data: string;
  descricao?: string;
  debito?: number;
  credito?: number;
  categoria?: string;
  recorrente: boolean;
  tipo_recorrencia?: 'parcelado' | 'subscription';
  parcelas_total?: number;
  parcela_atual?: number;
  dia_cobranca?: number;
  fonte?: 'extrato_pdf' | 'extrato_csv' | 'manual';
  created_at: string;
}

export interface Category {
  id: number;
  nome: string;
  cor?: string;
  icone?: string;
  created_at: string;
}

export interface Recurring {
  id: number;
  descricao: string;
  valor: number;
  tipo_recorrencia: 'parcelado' | 'subscription';
  parcelas_total?: number;
  parcela_atual?: number;
  dia_cobranca?: number;
  categoria?: string;
  ativo: boolean;
  created_at: string;
}

export interface DashboardKPIs {
  saldo_conta: number;
  gastos_previstos: number;
  total_gasto_mes: number;
  total_ganho_mes: number;
  mes_referencia: string;
}

export interface ChartPoint {
  dia: string;
  entradas: number;
  saidas: number;
}

export interface CategoryChartPoint {
  categoria: string;
  valor: number;
}

export interface DashboardCharts {
  evolucao_mensal: ChartPoint[];
  gastos_por_categoria: CategoryChartPoint[];
}

export interface TransactionFromAgent {
  data: string;
  descricao: string;
  debito?: number;
  credito?: number;
  categoria: string;
  tipo_recorrencia?: 'parcelado' | 'subscription';
  parcela_atual?: number;
  parcelas_total?: number;
  dia_cobranca?: number;
}

export interface ImportPreview {
  hash: string;
  total: number;
  transacoes: TransactionFromAgent[];
}

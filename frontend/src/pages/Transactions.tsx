import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Filter, X, Trash2, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';
import TransactionList from '@/components/TransactionList';
import { getTransactions, getCategories, deleteTransaction, deleteTransactions } from '@/services/api';

export default function Transactions() {
  const qc = useQueryClient();
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [categoria, setCategoria] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', dataInicio, dataFim, categoria],
    queryFn: () => getTransactions({
      data_inicio: dataInicio || undefined,
      data_fim: dataFim || undefined,
      categoria: categoria || undefined,
    }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const handleDelete = async (id: number) => {
    await deleteTransaction(id);
    qc.invalidateQueries({ queryKey: ['transactions'] });
    qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    qc.invalidateQueries({ queryKey: ['dashboard-charts'] });
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === transactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(transactions.map(t => t.id)));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    setDeleting(true);
    try {
      await deleteTransactions(Array.from(selectedIds));
      toast.success(`${selectedIds.size} transação(ões) excluída(s).`);
      setSelectedIds(new Set());
      setSelectMode(false);
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      qc.invalidateQueries({ queryKey: ['dashboard-charts'] });
    } catch {
      toast.error('Erro ao excluir transações.');
    } finally {
      setDeleting(false);
    }
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const hasFilters = dataInicio || dataFim || categoria;

  const clearFilters = () => {
    setDataInicio('');
    setDataFim('');
    setCategoria('');
  };

  const allSelected = transactions.length > 0 && selectedIds.size === transactions.length;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Transações</h1>
        <div className="flex items-center gap-2">
          {!selectMode ? (
            <>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-card border border-border hover:bg-accent transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filtros
                {hasFilters && <span className="w-2 h-2 bg-primary rounded-full" />}
              </button>
              <button
                onClick={() => setSelectMode(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-card border border-border hover:bg-accent transition-colors"
              >
                <CheckSquare className="w-4 h-4" />
                Selecionar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-card border border-border hover:bg-accent transition-colors"
              >
                {allSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}
                {allSelected ? 'Desmarcar' : 'Todos'}
              </button>
              {selectedIds.size > 0 && (
                <button
                  onClick={handleBatchDelete}
                  disabled={deleting}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-destructive text-destructive-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir ({selectedIds.size})
                </button>
              )}
              <button
                onClick={exitSelectMode}
                className="p-2 rounded-xl border border-border hover:bg-accent transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filtros */}
      {showFilters && !selectMode && (
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3 animate-slide-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Categoria</label>
              <select
                value={categoria}
                onChange={e => setCategoria(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Todas</option>
                {categories.map(c => (
                  <option key={c.id} value={c.nome}>{c.nome}</option>
                ))}
              </select>
            </div>
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* Lista */}
      <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              {transactions.length} transação(ões) encontrada(s)
              {selectMode && selectedIds.size > 0 && ` · ${selectedIds.size} selecionada(s)`}
            </p>
            <TransactionList
              transactions={transactions}
              onDelete={!selectMode ? handleDelete : undefined}
              selectable={selectMode}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
            />
          </>
        )}
      </div>
    </div>
  );
}

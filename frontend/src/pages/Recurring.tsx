import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, ToggleLeft, ToggleRight, RefreshCw, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { getRecurring, createRecurring, deleteRecurring, toggleRecurring, getCategories } from '@/services/api';
import type { Recurring } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function RecurringPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Recurring>>({
    tipo_recorrencia: 'subscription',
    ativo: true,
  });

  const { data: recorrentes = [] } = useQuery({
    queryKey: ['recurring'],
    queryFn: getRecurring,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRecurring(form);
      toast.success('Recorrente criado!');
      setShowForm(false);
      setForm({ tipo_recorrencia: 'subscription', ativo: true });
      qc.invalidateQueries({ queryKey: ['recurring'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    } catch {
      toast.error('Erro ao criar recorrente.');
    }
  };

  const handleDelete = async (id: number) => {
    await deleteRecurring(id);
    qc.invalidateQueries({ queryKey: ['recurring'] });
    qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
  };

  const handleToggle = async (id: number) => {
    await toggleRecurring(id);
    qc.invalidateQueries({ queryKey: ['recurring'] });
    qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
  };

  const parcelados = recorrentes.filter(r => r.tipo_recorrencia === 'parcelado');
  const subscriptions = recorrentes.filter(r => r.tipo_recorrencia === 'subscription');

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Recorrentes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Parcelas e assinaturas mensais
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity beautiful-shadow"
        >
          <Plus className="w-4 h-4" />
          Novo
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-2xl border border-border p-5 space-y-4 animate-slide-in"
        >
          <h2 className="text-sm font-semibold text-foreground">Novo recorrente</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Descrição</label>
              <input
                required
                value={form.descricao ?? ''}
                onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                placeholder="Ex: Netflix, Parcela TV..."
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Valor (R$)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={form.valor ?? ''}
                onChange={e => setForm(f => ({ ...f, valor: parseFloat(e.target.value) }))}
                placeholder="0,00"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tipo</label>
              <select
                value={form.tipo_recorrencia}
                onChange={e => setForm(f => ({ ...f, tipo_recorrencia: e.target.value as 'parcelado' | 'subscription' }))}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="subscription">Assinatura (mensal)</option>
                <option value="parcelado">Parcelado</option>
              </select>
            </div>

            {form.tipo_recorrencia === 'parcelado' && (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Parcela atual</label>
                  <input
                    type="number" min="1"
                    value={form.parcela_atual ?? ''}
                    onChange={e => setForm(f => ({ ...f, parcela_atual: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Total de parcelas</label>
                  <input
                    type="number" min="1"
                    value={form.parcelas_total ?? ''}
                    onChange={e => setForm(f => ({ ...f, parcelas_total: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </>
            )}

            {form.tipo_recorrencia === 'subscription' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Dia de cobrança</label>
                <input
                  type="number" min="1" max="31"
                  value={form.dia_cobranca ?? ''}
                  onChange={e => setForm(f => ({ ...f, dia_cobranca: parseInt(e.target.value) }))}
                  placeholder="Ex: 1, 15, 28..."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Categoria</label>
              <select
                value={form.categoria ?? ''}
                onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Selecione...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.nome}>{c.icone} {c.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors">
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              Salvar
            </button>
          </div>
        </form>
      )}

      {/* Subscriptions */}
      {subscriptions.length > 0 && (
        <RecurringSection
          title="Assinaturas"
          icon={<RefreshCw className="w-4 h-4" />}
          items={subscriptions}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />
      )}

      {/* Parcelados */}
      {parcelados.length > 0 && (
        <RecurringSection
          title="Parcelados"
          icon={<CreditCard className="w-4 h-4" />}
          items={parcelados}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />
      )}

      {recorrentes.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <RefreshCw className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">Nenhum recorrente cadastrado</p>
          <p className="text-xs text-muted-foreground">Adicione suas assinaturas e parcelas</p>
        </div>
      )}
    </div>
  );
}

function RecurringSection({
  title, icon, items, onDelete, onToggle,
}: {
  title: string;
  icon: React.ReactNode;
  items: Recurring[];
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className="text-muted-foreground">{icon}</span>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h2>
      </div>
      <ul className="space-y-2">
        {items.map(r => (
          <li key={r.id} className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-2xl border transition-colors',
            r.ativo ? 'bg-card border-border' : 'bg-muted/50 border-border opacity-60',
          )}>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{r.descricao}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {r.categoria && <span className="text-xs text-muted-foreground">{r.categoria}</span>}
                {r.tipo_recorrencia === 'subscription' && r.dia_cobranca && (
                  <span className="text-xs text-muted-foreground">· dia {r.dia_cobranca}</span>
                )}
                {r.tipo_recorrencia === 'parcelado' && r.parcela_atual && r.parcelas_total && (
                  <span className="text-xs bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 px-1.5 py-0.5 rounded-full">
                    {r.parcela_atual}/{r.parcelas_total}
                  </span>
                )}
              </div>
            </div>
            <span className="text-sm font-semibold text-foreground shrink-0">
              {formatCurrency(r.valor)}
            </span>
            <button onClick={() => onToggle(r.id)} className="text-muted-foreground hover:text-foreground transition-colors">
              {r.ativo ? <ToggleRight className="w-5 h-5 text-primary" /> : <ToggleLeft className="w-5 h-5" />}
            </button>
            <button onClick={() => onDelete(r.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

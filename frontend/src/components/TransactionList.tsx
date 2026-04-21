import { Trash2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import type { Transaction } from '@/types';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete?: (id: number) => void;
  selectable?: boolean;
  selectedIds?: Set<number>;
  onToggleSelect?: (id: number) => void;
}

export default function TransactionList({
  transactions,
  onDelete,
  selectable,
  selectedIds,
  onToggleSelect,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <ArrowDownLeft className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">Nenhuma transação</p>
        <p className="text-xs text-muted-foreground">Importe um extrato ou adicione manualmente</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {transactions.map((tx) => {
        const isCredito = (tx.credito ?? 0) > 0;
        const valor = isCredito ? tx.credito! : tx.debito!;
        const isSelected = selectedIds?.has(tx.id) ?? false;

        return (
          <li
            key={tx.id}
            onClick={selectable ? () => onToggleSelect?.(tx.id) : undefined}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-2xl border transition-colors group',
              selectable ? 'cursor-pointer' : '',
              isSelected
                ? 'bg-primary/5 border-primary/30'
                : 'bg-card border-border hover:bg-accent/40',
            )}
          >
            {/* Checkbox (modo seleção) */}
            {selectable && (
              <div className={cn(
                'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
                isSelected ? 'bg-primary border-primary' : 'border-border',
              )}>
                {isSelected && (
                  <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            )}

            {/* Ícone tipo */}
            <div
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                isCredito
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                  : 'bg-red-50 text-red-500 dark:bg-red-950/50 dark:text-red-400',
              )}
            >
              {isCredito
                ? <ArrowDownLeft className="w-4 h-4" />
                : <ArrowUpRight className="w-4 h-4" />}
            </div>

            {/* Descrição + data */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {tx.descricao || '—'}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">{formatDate(tx.data)}</span>
                {tx.categoria && (
                  <>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{tx.categoria}</span>
                  </>
                )}
                {tx.tipo_recorrencia === 'parcelado' && tx.parcela_atual && tx.parcelas_total && (
                  <>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 px-1.5 py-0.5 rounded-full">
                      {tx.parcela_atual}/{tx.parcelas_total}
                    </span>
                  </>
                )}
                {tx.tipo_recorrencia === 'subscription' && (
                  <>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 px-1.5 py-0.5 rounded-full">
                      Sub
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Valor */}
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={cn(
                  'text-sm font-semibold',
                  isCredito ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground',
                )}
              >
                {isCredito ? '+' : '-'} {formatCurrency(valor)}
              </span>

              {onDelete && !selectable && (
                <button
                  onClick={() => onDelete(tx.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                  aria-label="Excluir transação"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

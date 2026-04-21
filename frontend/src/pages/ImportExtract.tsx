import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, ArrowRight, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { previewExtract, confirmImport } from '@/services/api';
import type { ImportPreview } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

type Step = 'upload' | 'preview' | 'success';

export default function ImportExtract() {
  const qc = useQueryClient();
  const [step, setStep] = useState<Step>('upload');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setLoading(true);
    try {
      const data = await previewExtract(file);
      setPreview(data);
      setStep('preview');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      if (msg?.includes('já foi importado')) {
        toast.error('Este extrato já foi importado anteriormente.');
      } else {
        toast.error(msg || 'Erro ao processar o extrato.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      await confirmImport(preview.hash, preview.transacoes);
      setStep('success');
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      qc.invalidateQueries({ queryKey: ['dashboard-charts'] });
      toast.success(`${preview.total} transações importadas com sucesso!`);
    } catch {
      toast.error('Erro ao confirmar importação.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('upload');
    setPreview(null);
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Importar Extrato</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Suporta arquivos PDF e CSV. O agente IA irá classificar as transações automaticamente.
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {(['upload', 'preview', 'success'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span className={cn(
              'w-5 h-5 rounded-full flex items-center justify-center font-medium text-xs',
              step === s ? 'bg-primary text-primary-foreground' : 'bg-muted',
            )}>
              {i + 1}
            </span>
            <span className={step === s ? 'text-foreground font-medium' : ''}>
              {s === 'upload' ? 'Upload' : s === 'preview' ? 'Revisão' : 'Concluído'}
            </span>
            {i < 2 && <ArrowRight className="w-3 h-3" />}
          </div>
        ))}
      </div>

      {/* Step: Upload */}
      {step === 'upload' && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'relative flex flex-col items-center justify-center gap-4 p-12',
            'rounded-2xl border-2 border-dashed cursor-pointer transition-all',
            dragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-muted-foreground hover:bg-accent/30',
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Processando com IA...</p>
                <p className="text-xs text-muted-foreground mt-1">Isso pode levar alguns segundos</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <Upload className="w-7 h-7 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Arraste o arquivo ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground mt-1">PDF ou CSV · máx. 10 MB</p>
              </div>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.csv"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      )}

      {/* Step: Preview */}
      {step === 'preview' && preview && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {preview.total} transações detectadas
                </p>
                <p className="text-xs text-muted-foreground">Revise antes de confirmar</p>
              </div>
            </div>
            <button onClick={reset} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Lista preview */}
          <div className="bg-card rounded-2xl border border-border divide-y divide-border max-h-96 overflow-y-auto scroll-hide">
            {preview.transacoes.map((tx, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">{tx.descricao}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{formatDate(tx.data)}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{tx.categoria}</span>
                  </div>
                </div>
                <span className={cn(
                  'ml-4 font-semibold shrink-0',
                  (tx.credito ?? 0) > 0 ? 'text-emerald-600' : 'text-foreground',
                )}>
                  {(tx.credito ?? 0) > 0 ? '+' : '-'} {formatCurrency((tx.credito ?? tx.debito) ?? 0)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 py-3 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Confirmar importação
            </button>
          </div>
        </div>
      )}

      {/* Step: Success */}
      {step === 'success' && (
        <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">Extrato importado!</p>
            <p className="text-sm text-muted-foreground mt-1">
              {preview?.total} transações foram salvas com sucesso.
            </p>
          </div>
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Importar outro
          </button>
        </div>
      )}
    </div>
  );
}

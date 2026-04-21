import { useState } from 'react';
import { Save, Moon, Sun, Monitor, TrendingUp, Download } from 'lucide-react';
import { toast } from 'sonner';
import { getTransactions } from '@/services/api';

type Theme = 'light' | 'dark' | 'system';

function getTheme(): Theme {
  return (localStorage.getItem('walletzey_theme') as Theme) || 'system';
}

function getGrafanaUrl(): string {
  return localStorage.getItem('walletzey_grafana_url') || '';
}

export default function Settings() {
  const [theme, setTheme] = useState<Theme>(getTheme);
  const [grafanaUrl, setGrafanaUrl] = useState(getGrafanaUrl);

  const handleSaveTheme = (t: Theme) => {
    setTheme(t);
    localStorage.setItem('walletzey_theme', t);
    const root = document.documentElement;
    if (t === 'dark') root.classList.add('dark');
    else if (t === 'light') root.classList.remove('dark');
    else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
    toast.success('Tema atualizado!');
  };

  const handleSaveGrafana = () => {
    localStorage.setItem('walletzey_grafana_url', grafanaUrl);
    toast.success('URL do Grafana salva!');
  };

  const handleExportCSV = async () => {
    try {
      const transactions = await getTransactions();
      const headers = ['id', 'data', 'descricao', 'debito', 'credito', 'categoria', 'tipo_recorrencia'];
      const rows = transactions.map(t =>
        headers.map(h => ((t as unknown) as Record<string, unknown>)[h] ?? '').join(',')
      );
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `walletzey-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exportação concluída!');
    } catch {
      toast.error('Erro ao exportar dados.');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-xl">
      <h1 className="text-xl font-semibold text-foreground">Configurações</h1>

      {/* Tema */}
      <section className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Aparência</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'light', label: 'Claro', icon: Sun },
            { value: 'dark', label: 'Escuro', icon: Moon },
            { value: 'system', label: 'Sistema', icon: Monitor },
          ] as { value: Theme; label: string; icon: typeof Sun }[]).map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => handleSaveTheme(value)}
              className={`flex flex-col items-center gap-2 py-3 rounded-xl border text-xs font-medium transition-all ${
                theme === value
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border text-muted-foreground hover:bg-accent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Grafana */}
      <section className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Dashboard Grafana</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Cole aqui a URL do seu dashboard Grafana de investimentos. Ela será exibida na aba Investimentos.
        </p>
        <div className="flex gap-2">
          <input
            type="url"
            value={grafanaUrl}
            onChange={e => setGrafanaUrl(e.target.value)}
            placeholder="https://grafana.exemplo.com/d/..."
            className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleSaveGrafana}
            className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Exportar */}
      <section className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Exportar dados</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Exporta todas as transações em formato CSV.
        </p>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </section>

      {/* Sobre */}
      <section className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Walletzey</p>
            <p className="text-xs text-muted-foreground mt-0.5">Versão 1.0.0</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
            <span className="text-zinc-100 dark:text-zinc-900 text-sm font-bold">W</span>
          </div>
        </div>
      </section>
    </div>
  );
}

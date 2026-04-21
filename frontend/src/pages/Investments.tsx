import { TrendingUp, ExternalLink, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const GRAFANA_URL = localStorage.getItem('walletzey_grafana_url') || '';

export default function Investments() {
  if (!GRAFANA_URL) {
    return (
      <div className="space-y-5 animate-fade-in">
        <h1 className="text-xl font-semibold text-foreground">Investimentos</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-2xl border border-border">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">Dashboard Grafana não configurado</p>
          <p className="text-xs text-muted-foreground mb-6 max-w-xs">
            Configure a URL do seu dashboard Grafana nas configurações para visualizar seus investimentos.
          </p>
          <Link
            to="/configuracoes"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Settings className="w-4 h-4" />
            Ir para configurações
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Investimentos</h1>
        <a
          href={GRAFANA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Abrir no Grafana
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card">
        <iframe
          src={GRAFANA_URL}
          className="w-full"
          style={{ height: 'calc(100vh - 200px)', minHeight: '400px' }}
          frameBorder="0"
          title="Dashboard de investimentos"
        />
      </div>
    </div>
  );
}

import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  List,
  Upload,
  RefreshCw,
  TrendingUp,
  Tag,
  Settings,
  Wallet,
  X,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transacoes', icon: List, label: 'Transações' },
  { to: '/importar', icon: Upload, label: 'Importar Extrato' },
  { to: '/recorrentes', icon: RefreshCw, label: 'Recorrentes' },
  { to: '/investimentos', icon: TrendingUp, label: 'Investimentos' },
];

const BOTTOM_ITEMS = [
  { to: '/categorias', icon: Tag, label: 'Categorias' },
  { to: '/configuracoes', icon: Settings, label: 'Configurações' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-72 flex flex-col',
          'bg-sidebar border-r border-sidebar-border',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center beautiful-shadow">
              <Wallet className="w-5 h-5 text-zinc-100 dark:text-zinc-900" />
            </div>
            <span className="text-base font-semibold text-sidebar-foreground tracking-tight">
              walletzey
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav principal */}
        <nav className="flex-1 overflow-y-auto scroll-hide px-3 pt-4 space-y-0.5">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
            const isActive = to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(to);

            return (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-sidebar-active text-sidebar-active-foreground beautiful-shadow'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </NavLink>
            );
          })}
        </nav>

        {/* Nav inferior */}
        <div className="px-3 pb-4 pt-2 border-t border-sidebar-border space-y-0.5 safe-bottom">
          {BOTTOM_ITEMS.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-sidebar-active text-sidebar-active-foreground beautiful-shadow'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </NavLink>
            );
          })}
        </div>
      </aside>
    </>
  );
}

export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground"
      aria-label="Abrir menu"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}

import { Suspense, lazy, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Sidebar, { SidebarToggle } from '@/components/Sidebar';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Transactions = lazy(() => import('@/pages/Transactions'));
const ImportExtract = lazy(() => import('@/pages/ImportExtract'));
const Recurring = lazy(() => import('@/pages/Recurring'));
const Investments = lazy(() => import('@/pages/Investments'));
const Categories = lazy(() => import('@/pages/Categories'));
const Settings = lazy(() => import('@/pages/Settings'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 30 }, // 30s
  },
});

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <div className="w-8 h-8 rounded-xl bg-muted animate-pulse" />
  </div>
);

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex h-full bg-background">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Conteúdo principal */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Topbar mobile */}
            <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-20 safe-top">
              <SidebarToggle onClick={() => setSidebarOpen(true)} />
              <span className="text-base font-semibold text-foreground">walletzey</span>
            </header>

            {/* Página */}
            <main className="flex-1 overflow-y-auto">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/transacoes" element={<Transactions />} />
                    <Route path="/importar" element={<ImportExtract />} />
                    <Route path="/recorrentes" element={<Recurring />} />
                    <Route path="/investimentos" element={<Investments />} />
                    <Route path="/categorias" element={<Categories />} />
                    <Route path="/configuracoes" element={<Settings />} />
                  </Routes>
                </Suspense>
              </div>
            </main>
          </div>
        </div>

        <Toaster
          position="top-center"
          expand={false}
          richColors
          toastOptions={{
            style: { borderRadius: '12px', fontSize: '13px' },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

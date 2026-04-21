import axios from 'axios';
import type {
  Transaction,
  Category,
  Recurring,
  DashboardKPIs,
  DashboardCharts,
  ImportPreview,
  TransactionFromAgent,
} from '@/types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
});

// ── Transações ────────────────────────────────────────────────────────────────

export const getTransactions = (params?: {
  data_inicio?: string;
  data_fim?: string;
  categoria?: string;
}) => api.get<Transaction[]>('/transactions', { params }).then(r => r.data);

export const createTransaction = (data: Partial<Transaction>) =>
  api.post<Transaction>('/transactions', data).then(r => r.data);

export const deleteTransaction = (id: number) =>
  api.delete(`/transactions/${id}`);

export const deleteTransactions = (ids: number[]) =>
  api.delete('/transactions/batch', { data: { ids } });

export const getDashboardKPIs = (params?: { data_inicio?: string; data_fim?: string }) =>
  api.get<DashboardKPIs>('/transactions/dashboard/kpis', { params }).then(r => r.data);

export const getDashboardCharts = (params?: { data_inicio?: string; data_fim?: string }) =>
  api.get<DashboardCharts>('/transactions/dashboard/charts', { params }).then(r => r.data);

// ── Categorias ────────────────────────────────────────────────────────────────

export const getCategories = () =>
  api.get<Category[]>('/categories').then(r => r.data);

export const createCategory = (data: Partial<Category>) =>
  api.post<Category>('/categories', data).then(r => r.data);

export const updateCategory = (id: number, data: Partial<Category>) =>
  api.put<Category>(`/categories/${id}`, data).then(r => r.data);

export const deleteCategory = (id: number) =>
  api.delete(`/categories/${id}`);

// ── Recorrentes ───────────────────────────────────────────────────────────────

export const getRecurring = () =>
  api.get<Recurring[]>('/recurring').then(r => r.data);

export const createRecurring = (data: Partial<Recurring>) =>
  api.post<Recurring>('/recurring', data).then(r => r.data);

export const updateRecurring = (id: number, data: Partial<Recurring>) =>
  api.put<Recurring>(`/recurring/${id}`, data).then(r => r.data);

export const toggleRecurring = (id: number) =>
  api.patch<Recurring>(`/recurring/${id}/toggle`).then(r => r.data);

export const deleteRecurring = (id: number) =>
  api.delete(`/recurring/${id}`);

// ── Importação ────────────────────────────────────────────────────────────────

export const previewExtract = (file: File): Promise<ImportPreview> => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post<ImportPreview>('/import/preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};

export const confirmImport = (hash: string, transacoes: TransactionFromAgent[]) =>
  api.post('/import/confirm', { hash, transacoes }).then(r => r.data);

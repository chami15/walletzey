import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/services/api';
import type { Category } from '@/types';

const EMOJI_SUGESTOES = ['🍔','🚗','🏠','❤️','🎮','📺','💼','📈','📚','📦','✈️','👔','💊','🎵','🛒'];

export default function Categories() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ nome: '', cor: '#6b7280', icone: '📦' });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCategory(editingId, form);
        toast.success('Categoria atualizada!');
        setEditingId(null);
      } else {
        await createCategory(form);
        toast.success('Categoria criada!');
      }
      setShowForm(false);
      setForm({ nome: '', cor: '#6b7280', icone: '📦' });
      qc.invalidateQueries({ queryKey: ['categories'] });
    } catch {
      toast.error('Erro ao salvar categoria.');
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ nome: cat.nome, cor: cat.cor ?? '#6b7280', icone: cat.icone ?? '📦' });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    await deleteCategory(id);
    qc.invalidateQueries({ queryKey: ['categories'] });
    toast.success('Categoria removida.');
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Categorias</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Base de conhecimento do agente IA
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ nome: '', cor: '#6b7280', icone: '📦' }); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity beautiful-shadow"
        >
          <Plus className="w-4 h-4" />
          Nova
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-5 space-y-4 animate-slide-in">
          <h2 className="text-sm font-semibold text-foreground">
            {editingId ? 'Editar categoria' : 'Nova categoria'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nome</label>
              <input
                required
                value={form.nome}
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                placeholder="Ex: Alimentação"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Cor</label>
              <input
                type="color"
                value={form.cor}
                onChange={e => setForm(f => ({ ...f, cor: e.target.value }))}
                className="w-full h-10 rounded-xl border border-border bg-background cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Ícone</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_SUGESTOES.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, icone: e }))}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                    form.icone === e ? 'bg-primary/10 ring-2 ring-primary' : 'hover:bg-accent'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors">
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              {editingId ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      )}

      {/* Lista */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center gap-3 px-4 py-3 bg-card rounded-2xl border border-border group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
              style={{ backgroundColor: cat.cor ? `${cat.cor}20` : undefined }}
            >
              {cat.icone || '📦'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{cat.nome}</p>
              {cat.cor && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.cor }} />
                  <span className="text-xs text-muted-foreground">{cat.cor}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(cat)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-all">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import api, { errorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Field from '../components/Field';

const empty = { title: '', isbn: '', year: '', totalCopies: 1, categoryId: '', authorIds: [] };

export default function Books() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [filters, setFilters] = useState({ title: '', categoryId: '', authorId: '', available: false });
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    try {
      const params = { title: filters.title, categoryId: filters.categoryId, authorId: filters.authorId, available: filters.available ? 'true' : '' };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await api.get('/books', { params });
      setBooks(data);
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/authors')])
      .then(([c, a]) => { setCategories(c.data); setAuthors(a.data); })
      .catch((e) => setError(errorMessage(e)));
  }, []);

  const openForm = (book) => {
    setForm(book ? {
      title: book.title, isbn: book.isbn, year: book.year ?? '', totalCopies: book.totalCopies,
      categoryId: book.categoryId, authorIds: (book.Authors || []).map((a) => a.id),
    } : empty);
    setFormError('');
    setEditing(book || {});
  };

  const toggleAuthor = (id) =>
    setForm((f) => ({ ...f, authorIds: f.authorIds.includes(id) ? f.authorIds.filter((x) => x !== id) : [...f.authorIds, id] }));

  const save = async (e) => {
    e.preventDefault();
    setFormError('');
    const payload = { ...form, year: form.year === '' ? null : Number(form.year), totalCopies: Number(form.totalCopies), categoryId: Number(form.categoryId) };
    try {
      if (editing.id) await api.put(`/books/${editing.id}`, payload);
      else await api.post('/books', payload);
      setEditing(null);
      load();
    } catch (err) {
      setFormError(errorMessage(err));
    }
  };

  const remove = async (book) => {
    if (!window.confirm(`Excluir o livro "${book.title}"?`)) return;
    try {
      await api.delete(`/books/${book.id}`);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <section>
      <div className="page-head">
        <h1>Livros</h1>
        {user.isAdmin && <button className="btn btn-primary" onClick={() => openForm(null)}>Novo livro</button>}
      </div>

      <div className="filters">
        <input className="search" placeholder="Buscar por título" value={filters.title} onChange={(e) => setFilters({ ...filters, title: e.target.value })} />
        <select value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })} aria-label="Categoria">
          <option value="">Todas as categorias</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filters.authorId} onChange={(e) => setFilters({ ...filters, authorId: e.target.value })} aria-label="Autor">
          <option value="">Todos os autores</option>
          {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <label className="check">
          <input type="checkbox" checked={filters.available} onChange={(e) => setFilters({ ...filters, available: e.target.checked })} />
          Só disponíveis
        </label>
      </div>

      {error && <p className="alert" role="alert">{error}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Título</th><th>Autores</th><th>Categoria</th><th>Ano</th><th>Exemplares</th>{user.isAdmin && <th className="actions-col">Ações</th>}</tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.id}>
                <td><strong>{b.title}</strong><br /><span className="muted">ISBN {b.isbn}</span></td>
                <td>{b.Authors?.map((a) => a.name).join(', ') || '—'}</td>
                <td>{b.Category?.name}</td>
                <td>{b.year ?? '—'}</td>
                <td>
                  <span className={b.availableCopies > 0 ? 'tag tag-ok' : 'tag tag-danger'}>
                    {b.availableCopies > 0 ? `${b.availableCopies} de ${b.totalCopies} disponíveis` : 'Indisponível'}
                  </span>
                </td>
                {user.isAdmin && (
                  <td className="actions">
                    <button className="btn btn-small" onClick={() => openForm(b)}>Editar</button>
                    <button className="btn btn-small btn-danger" onClick={() => remove(b)}>Excluir</button>
                  </td>
                )}
              </tr>
            ))}
            {books.length === 0 && <tr><td colSpan={6} className="empty">Nenhum livro encontrado com esses filtros.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={editing.id ? 'Editar livro' : 'Novo livro'} onClose={() => setEditing(null)} wide>
          <form onSubmit={save} className="form">
            <div className="grid-2">
              <Field label="Título" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
              <Field label="ISBN" value={form.isbn} onChange={(v) => setForm({ ...form, isbn: v })} required />
              <Field label="Ano" type="number" value={form.year} onChange={(v) => setForm({ ...form, year: v })} />
              <Field label="Total de exemplares" type="number" min="0" value={form.totalCopies} onChange={(v) => setForm({ ...form, totalCopies: v })} required />
            </div>
            <Field
              label="Categoria"
              type="select"
              value={form.categoryId}
              onChange={(v) => setForm({ ...form, categoryId: v })}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              required
            />
            <fieldset className="authors-pick">
              <legend>Autores</legend>
              {authors.length === 0 && <p className="muted">Cadastre autores antes de criar o livro.</p>}
              {authors.map((a) => (
                <label key={a.id} className="check">
                  <input type="checkbox" checked={form.authorIds.includes(a.id)} onChange={() => toggleAuthor(a.id)} />
                  {a.name}
                </label>
              ))}
            </fieldset>
            {formError && <p className="alert" role="alert">{formError}</p>}
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancelar</button>
              <button className="btn btn-primary">Salvar</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}

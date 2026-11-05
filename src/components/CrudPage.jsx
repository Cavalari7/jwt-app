import { useCallback, useEffect, useState } from 'react';
import api, { errorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import Field from './Field';

/**
 * Página de listagem + cadastro + edição + exclusão reaproveitada por
 * Categorias, Autores, Leitores e Atendentes.
 *
 * props: title, singular, endpoint, columns[{key,label,render?}], fields[{key,label,type,required,createOnly}],
 *        adminWrite (escrita só admin), allowDelete, rowActions(row, reload), canEdit(row), emptyText
 */
export default function CrudPage({ title, singular, endpoint, columns, fields, adminWrite = false, allowDelete = true, rowActions, searchParam, emptyText }) {
  const { user } = useAuth();
  const canWrite = !adminWrite || user.isAdmin;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // null | {} (novo) | registro
  const [form, setForm] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(endpoint, { params: searchParam && search ? { [searchParam]: search } : undefined });
      setRows(data);
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [endpoint, search, searchParam]);

  useEffect(() => {
    const t = setTimeout(load, searchParam ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, searchParam]);

  const openForm = (row) => {
    const initial = {};
    fields.forEach((f) => {
      initial[f.key] = row?.id && f.type !== 'password' ? row[f.key] ?? '' : f.type === 'checkbox' ? false : '';
    });
    setForm(initial);
    setFormError('');
    setEditing(row || {});
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = { ...form };
      if (editing.id && !payload.password) delete payload.password; // senha em branco = manter a atual
      if (editing.id) await api.put(`${endpoint}/${editing.id}`, payload);
      else await api.post(endpoint, payload);
      setEditing(null);
      load();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Excluir ${singular} "${row.name}"?`)) return;
    try {
      await api.delete(`${endpoint}/${row.id}`);
      load();
    } catch (err) {
      setError(errorMessage(err)); // ex.: 409 com vínculos
    }
  };

  return (
    <section>
      <div className="page-head">
        <h1>{title}</h1>
        <div className="page-tools">
          {searchParam && (
            <input className="search" placeholder="Buscar por nome ou CPF" value={search} onChange={(e) => setSearch(e.target.value)} />
          )}
          {canWrite && <button className="btn btn-primary" onClick={() => openForm(null)}>Novo {singular}</button>}
        </div>
      </div>

      {error && <p className="alert" role="alert">{error}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((c) => <th key={c.key}>{c.label}</th>)}
              <th className="actions-col">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {columns.map((c) => <td key={c.key}>{c.render ? c.render(row) : row[c.key] ?? '—'}</td>)}
                <td className="actions">
                  {rowActions?.(row, load)}
                  {canWrite && <button className="btn btn-small" onClick={() => openForm(row)}>Editar</button>}
                  {canWrite && allowDelete && <button className="btn btn-small btn-danger" onClick={() => remove(row)}>Excluir</button>}
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={columns.length + 1} className="empty">{emptyText || `Nenhum registro ainda. Use “Novo ${singular}” para cadastrar.`}</td></tr>
            )}
            {loading && rows.length === 0 && <tr><td colSpan={columns.length + 1} className="empty">Carregando…</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={editing.id ? `Editar ${singular}` : `Novo ${singular}`} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="form">
            {fields.map((f) => (
              <Field
                key={f.key}
                label={f.label}
                type={f.type}
                value={form[f.key]}
                onChange={(v) => setForm({ ...form, [f.key]: v })}
                required={f.required && !(f.type === 'password' && editing.id)}
                placeholder={f.type === 'password' && editing.id ? 'Deixe em branco para manter' : f.placeholder}
              />
            ))}
            {formError && <p className="alert" role="alert">{formError}</p>}
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancelar</button>
              <button className="btn btn-primary" disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}

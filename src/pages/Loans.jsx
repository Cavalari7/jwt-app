import { useCallback, useEffect, useState } from 'react';
import api, { errorMessage } from '../services/api';
import Modal from '../components/Modal';
import { formatDate, money } from '../utils';

const statusClass = { ATIVO: 'tag tag-info', ATRASADO: 'tag tag-danger', DEVOLVIDO: 'tag' };
const tabs = [
  { value: '', label: 'Todos' },
  { value: 'ATIVO', label: 'Ativos' },
  { value: 'ATRASADO', label: 'Atrasados' },
  { value: 'DEVOLVIDO', label: 'Devolvidos' },
];

function NewLoan({ onClose, onCreated }) {
  const [readerQ, setReaderQ] = useState('');
  const [readers, setReaders] = useState([]);
  const [reader, setReader] = useState(null);
  const [bookQ, setBookQ] = useState('');
  const [books, setBooks] = useState([]);
  const [book, setBook] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (readerQ.length < 2) return setReaders([]);
    const t = setTimeout(() => api.get('/readers', { params: { q: readerQ } }).then(({ data }) => setReaders(data.slice(0, 5))).catch(() => {}), 250);
    return () => clearTimeout(t);
  }, [readerQ]);

  useEffect(() => {
    if (bookQ.length < 2) return setBooks([]);
    const t = setTimeout(() => api.get('/books', { params: { title: bookQ, available: 'true' } }).then(({ data }) => setBooks(data.slice(0, 5))).catch(() => {}), 250);
    return () => clearTimeout(t);
  }, [bookQ]);

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await api.post('/loans', { bookId: book.id, readerId: reader.id });
      onCreated();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="Novo empréstimo" onClose={onClose}>
      <div className="form">
        <div className="field">
          <label htmlFor="reader-q">Leitor</label>
          {reader ? (
            <div className="picked"><span>{reader.name}</span><button className="btn btn-small" onClick={() => setReader(null)}>Trocar</button></div>
          ) : (
            <>
              <input id="reader-q" placeholder="Digite o nome ou CPF (mín. 2 letras)" value={readerQ} onChange={(e) => setReaderQ(e.target.value)} />
              <ul className="results">{readers.map((r) => <li key={r.id}><button type="button" onClick={() => setReader(r)}>{r.name}</button></li>)}</ul>
            </>
          )}
        </div>
        <div className="field">
          <label htmlFor="book-q">Livro (só aparecem os disponíveis)</label>
          {book ? (
            <div className="picked"><span>{book.title}</span><button className="btn btn-small" onClick={() => setBook(null)}>Trocar</button></div>
          ) : (
            <>
              <input id="book-q" placeholder="Digite o título (mín. 2 letras)" value={bookQ} onChange={(e) => setBookQ(e.target.value)} />
              <ul className="results">{books.map((b) => <li key={b.id}><button type="button" onClick={() => setBook(b)}>{b.title} <span className="muted">({b.availableCopies} disp.)</span></button></li>)}</ul>
            </>
          )}
        </div>
        <p className="muted">O prazo de devolução é de 7 dias.</p>
        {error && <p className="alert" role="alert">{error}</p>}
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={!reader || !book || busy} onClick={submit}>{busy ? 'Registrando…' : 'Registrar empréstimo'}</button>
        </div>
      </div>
    </Modal>
  );
}

export default function Loans() {
  const [status, setStatus] = useState('');
  const [loans, setLoans] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/loans', { params: status ? { status } : undefined });
      setLoans(data);
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const giveBack = async (loan) => {
    const multa = loan.status === 'ATRASADO' ? ` Multa a cobrar: ${money(loan.currentFine)} (${loan.daysLate} dia(s) de atraso).` : '';
    if (!window.confirm(`Registrar a devolução de "${loan.Book?.title}"?${multa}`)) return;
    try {
      const { data } = await api.put(`/loans/${loan.id}/return`);
      setNotice(data.fine > 0 ? `Devolvido. Multa cobrada: ${money(data.fine)}.` : 'Devolvido sem multa.');
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <section>
      <div className="page-head">
        <h1>Empréstimos</h1>
        <button className="btn btn-primary" onClick={() => { setNotice(''); setCreating(true); }}>Novo empréstimo</button>
      </div>

      <div className="tabs" role="tablist">
        {tabs.map((t) => (
          <button key={t.value} role="tab" aria-selected={status === t.value} className={status === t.value ? 'tab active' : 'tab'} onClick={() => setStatus(t.value)}>{t.label}</button>
        ))}
      </div>

      {error && <p className="alert" role="alert">{error}</p>}
      {notice && <p className="notice" role="status">{notice}</p>}

      <div className="table-wrap">
        <table>
          <thead><tr><th>Livro</th><th>Leitor</th><th>Retirada</th><th>Vencimento</th><th>Status</th><th>Multa</th><th className="actions-col">Ações</th></tr></thead>
          <tbody>
            {loans.map((l) => (
              <tr key={l.id}>
                <td>{l.Book?.title}</td>
                <td>{l.Reader?.name}</td>
                <td>{formatDate(l.loanDate)}</td>
                <td>{formatDate(l.dueDate)}</td>
                <td><span className={statusClass[l.status]}>{l.status}</span></td>
                <td>{l.status === 'ATRASADO' ? <strong className="danger-text">{money(l.currentFine)}</strong> : money(l.fine)}</td>
                <td className="actions">
                  {l.status !== 'DEVOLVIDO' && <button className="btn btn-small btn-primary" onClick={() => giveBack(l)}>Devolver</button>}
                </td>
              </tr>
            ))}
            {loans.length === 0 && <tr><td colSpan={7} className="empty">Nenhum empréstimo nesta lista.</td></tr>}
          </tbody>
        </table>
      </div>

      {creating && <NewLoan onClose={() => setCreating(false)} onCreated={() => { setCreating(false); setNotice('Empréstimo registrado. Devolução em 7 dias.'); load(); }} />}
    </section>
  );
}

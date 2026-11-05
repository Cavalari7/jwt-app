import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

const money = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user.isAdmin) return; // o relatório é exclusivo do administrador (a API também bloqueia)
    api.get('/reports/dashboard').then(({ data }) => setData(data)).catch((e) => setError(errorMessage(e)));
  }, [user.isAdmin]);

  const cards = data && [
    { label: 'Livros cadastrados', value: data.totalBooks, note: `${data.availableCopies} de ${data.totalCopies} exemplares disponíveis` },
    { label: 'Empréstimos ativos', value: data.activeLoans, note: `${data.returnedLoans} já devolvidos` },
    { label: 'Empréstimos atrasados', value: data.overdueLoans, note: `${money(data.pendingFines)} em multas correndo`, alert: data.overdueLoans > 0 },
    { label: 'Multas cobradas', value: money(data.totalFines), note: `${data.totalReaders} leitores cadastrados` },
  ];

  return (
    <section>
      <div className="page-head">
        <h1>Olá, {user.name.split(' ')[0]}</h1>
      </div>
      {!user.isAdmin && (
        <div className="quick">
          <p className="muted">O que você precisa fazer agora?</p>
          <div className="quick-links">
            <Link className="btn btn-primary" to="/emprestimos">Registrar empréstimo</Link>
            <Link className="btn" to="/leitores">Cadastrar leitor</Link>
            <Link className="btn" to="/livros">Consultar acervo</Link>
          </div>
        </div>
      )}
      {error && <p className="alert" role="alert">{error}</p>}
      {cards && (
        <div className="cards">
          {cards.map((c) => (
            <article key={c.label} className={c.alert ? 'card card-alert' : 'card'}>
              <p className="card-label">{c.label}</p>
              <p className="card-value">{c.value}</p>
              <p className="muted">{c.note}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

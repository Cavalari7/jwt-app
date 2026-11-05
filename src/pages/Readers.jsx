import { useEffect, useState } from 'react';
import CrudPage from '../components/CrudPage';
import Modal from '../components/Modal';
import api, { errorMessage } from '../services/api';
import { formatCpf, formatDate, money } from '../utils';

const statusClass = { ATIVO: 'tag tag-info', ATRASADO: 'tag tag-danger', DEVOLVIDO: 'tag' };

function History({ reader, onClose }) {
  const [loans, setLoans] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get(`/readers/${reader.id}/loans`).then(({ data }) => setLoans(data)).catch((e) => setError(errorMessage(e)));
  }, [reader.id]);
  return (
    <Modal title={`Histórico de ${reader.name}`} onClose={onClose} wide>
      {error && <p className="alert">{error}</p>}
      {loans && loans.length === 0 && <p className="muted">Este leitor ainda não pegou nenhum livro.</p>}
      {loans && loans.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Livro</th><th>Retirada</th><th>Vencimento</th><th>Devolução</th><th>Status</th><th>Multa</th></tr></thead>
            <tbody>
              {loans.map((l) => (
                <tr key={l.id}>
                  <td>{l.Book?.title}</td>
                  <td>{formatDate(l.loanDate)}</td>
                  <td>{formatDate(l.dueDate)}</td>
                  <td>{formatDate(l.returnDate)}</td>
                  <td><span className={statusClass[l.status]}>{l.status}</span></td>
                  <td>{money(l.status === 'ATRASADO' ? l.currentFine : l.fine)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}

export default function Readers() {
  const [history, setHistory] = useState(null);
  return (
    <>
      <CrudPage
        title="Leitores"
        singular="leitor"
        endpoint="/readers"
        searchParam="q"
        allowDelete={false}
        columns={[
          { key: 'name', label: 'Nome' },
          { key: 'cpf', label: 'CPF', render: (r) => formatCpf(r.cpf) },
          { key: 'email', label: 'E-mail' },
          { key: 'phone', label: 'Telefone' },
        ]}
        fields={[
          { key: 'name', label: 'Nome', required: true },
          { key: 'cpf', label: 'CPF', required: true, placeholder: '000.000.000-00' },
          { key: 'email', label: 'E-mail', type: 'email' },
          { key: 'phone', label: 'Telefone' },
        ]}
        rowActions={(row) => <button className="btn btn-small" onClick={() => setHistory(row)}>Histórico</button>}
      />
      {history && <History reader={history} onClose={() => setHistory(null)} />}
    </>
  );
}

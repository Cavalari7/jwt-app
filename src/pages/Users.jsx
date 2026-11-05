import CrudPage from '../components/CrudPage';
import api, { errorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Users() {
  const { user: me } = useAuth();
  const toggle = async (row, reload) => {
    try {
      await api.patch(`/user/${row.id}/active`, { active: !row.active });
      reload();
    } catch (err) {
      window.alert(errorMessage(err));
    }
  };

  return (
    <CrudPage
      title="Atendentes"
      singular="atendente"
      endpoint="/user"
      allowDelete={false}
      columns={[
        { key: 'name', label: 'Nome' },
        { key: 'email', label: 'E-mail' },
        { key: 'isAdmin', label: 'Perfil', render: (r) => (r.isAdmin ? 'Administrador' : 'Atendente') },
        { key: 'active', label: 'Situação', render: (r) => <span className={r.active ? 'tag tag-ok' : 'tag tag-danger'}>{r.active ? 'Ativo' : 'Desativado'}</span> },
      ]}
      fields={[
        { key: 'name', label: 'Nome', required: true },
        { key: 'username', label: 'Nome de usuário', required: true },
        { key: 'email', label: 'E-mail', type: 'email', required: true },
        { key: 'password', label: 'Senha', type: 'password', required: true },
        { key: 'isAdmin', label: 'Administrador', type: 'checkbox' },
      ]}
      rowActions={(row, reload) =>
        row.id !== me.id && (
          <button className="btn btn-small" onClick={() => toggle(row, reload)}>{row.active ? 'Desativar' : 'Ativar'}</button>
        )
      }
    />
  );
}

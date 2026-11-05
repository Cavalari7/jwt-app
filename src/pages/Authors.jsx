import CrudPage from '../components/CrudPage';
import { formatDate } from '../utils';

export default function Authors() {
  return (
    <CrudPage
      title="Autores"
      singular="autor"
      endpoint="/authors"
      adminWrite
      columns={[
        { key: 'name', label: 'Nome' },
        { key: 'nationality', label: 'Nacionalidade' },
        { key: 'birthDate', label: 'Nascimento', render: (r) => formatDate(r.birthDate) },
      ]}
      fields={[
        { key: 'name', label: 'Nome', required: true },
        { key: 'nationality', label: 'Nacionalidade' },
        { key: 'birthDate', label: 'Data de nascimento', type: 'date' },
      ]}
    />
  );
}

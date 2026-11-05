import CrudPage from '../components/CrudPage';

export default function Categories() {
  return (
    <CrudPage
      title="Categorias"
      singular="categoria"
      endpoint="/categories"
      adminWrite
      columns={[{ key: 'name', label: 'Nome' }, { key: 'description', label: 'Descrição' }]}
      fields={[
        { key: 'name', label: 'Nome', required: true },
        { key: 'description', label: 'Descrição', type: 'textarea' },
      ]}
    />
  );
}

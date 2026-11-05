import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Authors from './pages/Authors';
import Books from './pages/Books';
import Readers from './pages/Readers';
import Loans from './pages/Loans';
import Users from './pages/Users';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="livros" element={<Books />} />
          <Route path="emprestimos" element={<Loans />} />
          <Route path="leitores" element={<Readers />} />
          <Route path="categorias" element={<Categories />} />
          <Route path="autores" element={<Authors />} />
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="atendentes" element={<Users />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

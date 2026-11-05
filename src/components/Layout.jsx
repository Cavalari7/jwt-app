import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Início', end: true },
  { to: '/livros', label: 'Livros' },
  { to: '/emprestimos', label: 'Empréstimos' },
  { to: '/leitores', label: 'Leitores' },
  { to: '/categorias', label: 'Categorias' },
  { to: '/autores', label: 'Autores' },
  { to: '/atendentes', label: 'Atendentes', admin: true },
];

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="shell">
      <aside className="sidebar">
        <img className="sidebar-logo" src="/logo-unipar.png" alt="Unipar" />
        <p className="sidebar-title">Biblioteca</p>
        <nav>
          {links
            .filter((l) => !l.admin || user.isAdmin)
            .map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                {l.label}
              </NavLink>
            ))}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="who">
            <strong>{user.name}</strong>
            <span className="muted">{user.isAdmin ? 'Administrador' : 'Atendente'}</span>
          </div>
          <button className="btn btn-ghost" onClick={logout}>Sair</button>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

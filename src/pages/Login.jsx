import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/api';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Digite um e-mail válido.');
    if (password.length < 6) return setError('A senha tem pelo menos 6 caracteres.');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível entrar.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <div className="login-form-side">
        <img src="/logo-unipar.png" alt="Unipar" className="login-logo" />
        <h1>Biblioteca</h1>
        <p className="muted">Entre com a sua conta de atendente ou administrador.</p>
        <form onSubmit={submit} className="form" noValidate>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="password">Senha</label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="alert" role="alert">{error}</p>}
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
        </form>
      </div>
      <div className="login-art" aria-hidden="true">
        <div className="stripes" />
        <p className="login-art-text">Acervo, leitores e empréstimos num só lugar.</p>
      </div>
    </div>
  );
}

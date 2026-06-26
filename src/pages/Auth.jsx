import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const TIPOS_PERFIL = [
  { value: 'embarcador', label: 'Embarcador (tenho cargas)' },
  { value: 'caminhoneiro', label: 'Caminhoneiro (tenho caminhão)' },
];

export default function Auth() {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [tab, setTab] = useState(tabParam === 'cadastrar' ? 'cadastrar' : 'entrar');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form
  const [loginForm, setLoginForm] = useState({ email: '', senha: '' });

  // Register form
  const [registerForm, setRegisterForm] = useState({
    tipo_perfil: 'embarcador',
    nome_completo: '',
    email: '',
    telefone: '',
    senha: '',
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setError('');
    setSuccess('');
  }, [tab]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.senha) {
      setError('Preencha email e senha.');
      return;
    }
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.senha);
      setError('');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Email ou senha inválidos.';
      setError(typeof msg === 'string' ? msg : 'Erro ao entrar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { nome_completo, email, senha, telefone, tipo_perfil } = registerForm;
    if (!nome_completo || !email || !senha || !tipo_perfil) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register({ nome_completo, email, senha, telefone, tipo_perfil });
      setSuccess('Conta criada com sucesso! Faça login para continuar.');
      setTab('entrar');
      setLoginForm({ email, senha: '' });
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Erro ao criar conta.';
      setError(typeof msg === 'string' ? msg : 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="2"/>
              <path d="M16 8h5l3 3v5h-8V8z"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          </div>
          <div>
            <div className="auth-title">Bem-vindo ao FreteAmigo</div>
            <div className="auth-subtitle">Acesse sua conta ou cadastre-se grátis.</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            id="tab-entrar"
            className={`auth-tab${tab === 'entrar' ? ' active' : ''}`}
            onClick={() => setTab('entrar')}
          >
            Entrar
          </button>
          <button
            id="tab-cadastrar"
            className={`auth-tab${tab === 'cadastrar' ? ' active' : ''}`}
            onClick={() => setTab('cadastrar')}
          >
            Cadastrar
          </button>
        </div>

        {/* Alerts */}
        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>{success}</div>}

        {/* Login Form */}
        {tab === 'entrar' && (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="seu@email.com"
                value={loginForm.email}
                onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="login-senha">Senha</label>
              <input
                id="login-senha"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={loginForm.senha}
                onChange={e => setLoginForm(f => ({ ...f, senha: e.target.value }))}
                autoComplete="current-password"
              />
              <div style={{ textAlign: 'right', marginTop: 6 }}>
                <Link
                  to="/esqueci-senha"
                  style={{ fontSize: '0.8rem', color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 500 }}
                >
                  Esqueci minha senha
                </Link>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><div className="spinner" />Entrando...</> : 'Entrar'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === 'cadastrar' && (
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-tipo">Eu sou</label>
              <select
                id="reg-tipo"
                className="form-select"
                value={registerForm.tipo_perfil}
                onChange={e => setRegisterForm(f => ({ ...f, tipo_perfil: e.target.value }))}
              >
                {TIPOS_PERFIL.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-nome">Nome completo *</label>
              <input
                id="reg-nome"
                type="text"
                className="form-input"
                placeholder="João Silva"
                value={registerForm.nome_completo}
                onChange={e => setRegisterForm(f => ({ ...f, nome_completo: e.target.value }))}
                autoComplete="name"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Email *</label>
                <input
                  id="reg-email"
                  type="email"
                  className="form-input"
                  placeholder="seu@email.com"
                  value={registerForm.email}
                  onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))}
                  autoComplete="email"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-tel">Telefone</label>
                <input
                  id="reg-tel"
                  type="tel"
                  className="form-input"
                  placeholder="(11) 99999-9999"
                  value={registerForm.telefone}
                  onChange={e => setRegisterForm(f => ({ ...f, telefone: e.target.value }))}
                  autoComplete="tel"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-senha">Senha (mín. 6 caracteres) *</label>
              <input
                id="reg-senha"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={registerForm.senha}
                onChange={e => setRegisterForm(f => ({ ...f, senha: e.target.value }))}
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="btn btn-accent btn-full btn-lg" disabled={loading}>
              {loading ? <><div className="spinner" />Criando conta...</> : 'Criar conta grátis'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 20 }}>
          Ao se cadastrar, você concorda com nossos{' '}
          <span style={{ color: 'var(--color-accent)', cursor: 'pointer' }}>Termos de Uso</span>
          {' '}e{' '}
          <span style={{ color: 'var(--color-accent)', cursor: 'pointer' }}>Política de Privacidade</span>.
        </p>
      </div>
    </div>
  );
}

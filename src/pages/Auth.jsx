import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/errorHandler';
import { validateCPF, validateCNPJ } from '../utils/validators';
import { ESTADOS } from '../components/SearchBar';

const TIPOS_PERFIL = [
  { value: 'embarcador', label: 'Embarcador (tenho cargas)' },
  { value: 'caminhoneiro', label: 'Caminhoneiro (tenho caminhão)' },
];

function formatCPF(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatCNPJ(value) {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

export default function Auth() {
  const { login, register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const perfilParam = searchParams.get('perfil') || searchParams.get('tipo');

  const [tab, setTab] = useState(tabParam === 'cadastrar' ? 'cadastrar' : 'entrar');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form
  const [loginForm, setLoginForm] = useState({ email: '', senha: '' });

  // Register form
  const [registerForm, setRegisterForm] = useState({
    tipo_perfil: (perfilParam === 'caminhoneiro' || perfilParam === 'motorista') ? 'caminhoneiro' : 'embarcador',
    nome_completo: '',
    email: '',
    telefone: '',
    senha: '',
    cpf: '',
    cnpj: '',
    estado: '',
    cidade: '',
  });

  useEffect(() => {
    if (tabParam === 'cadastrar') {
      setTab('cadastrar');
    } else if (tabParam === 'entrar') {
      setTab('entrar');
    }
  }, [tabParam]);

  useEffect(() => {
    const perfil = searchParams.get('perfil') || searchParams.get('tipo');
    if (perfil === 'caminhoneiro' || perfil === 'motorista') {
      setRegisterForm(f => ({ ...f, tipo_perfil: 'caminhoneiro' }));
    } else if (perfil === 'embarcador') {
      setRegisterForm(f => ({ ...f, tipo_perfil: 'embarcador' }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      const destino = user?.tipo_perfil === 'caminhoneiro' ? '/buscar-cargas' : '/dashboard';
      navigate(destino);
    }
  }, [isAuthenticated, user, navigate]);

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
      const data = await login(loginForm.email, loginForm.senha);
      setError('');
      const perfil = data?.user?.tipo_perfil || data?.data?.tipo_perfil || data?.tipo_perfil;
      const destino = perfil === 'caminhoneiro' ? '/buscar-cargas' : '/dashboard';
      navigate(destino);
    } catch (err) {
      setError(getErrorMessage(err, 'Email ou senha inválidos.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { nome_completo, email, senha, telefone, tipo_perfil, cpf, cnpj, estado, cidade } = registerForm;
    if (!nome_completo || !email || !senha || !tipo_perfil) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (tipo_perfil === 'embarcador') {
      if (!cnpj.trim()) {
        setError('O campo CNPJ é obrigatório para o perfil Embarcador.');
        return;
      }
      if (!validateCNPJ(cnpj)) {
        setError('CNPJ inválido. Verifique os números digitados.');
        return;
      }
    }
    if (tipo_perfil === 'caminhoneiro') {
      if (!cpf.trim()) {
        setError('O campo CPF é obrigatório para o perfil Caminhoneiro.');
        return;
      }
      if (!validateCPF(cpf)) {
        setError('CPF inválido. Verifique os números digitados.');
        return;
      }
      if (!estado) {
        setError('Selecione o Estado (UF) no cadastro de motorista.');
        return;
      }
      if (!cidade.trim()) {
        setError('Informe a Cidade no cadastro de motorista.');
        return;
      }
    }
    if (senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register({
        nome_completo,
        email,
        senha,
        telefone,
        tipo_perfil,
        cnpj: tipo_perfil === 'embarcador' ? cnpj : undefined,
        cpf: tipo_perfil === 'caminhoneiro' ? cpf : undefined,
        estado: tipo_perfil === 'caminhoneiro' ? estado : registerForm.estado || undefined,
        cidade: tipo_perfil === 'caminhoneiro' ? cidade : registerForm.cidade || undefined,
      });
      setSuccess('Conta criada com sucesso! Faça login para continuar.');
      setTab('entrar');
      setLoginForm({ email, senha: '' });
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao criar conta. Tente novamente.'));
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
            <div className="auth-title">Bem-vindo ao Frete Amigo</div>
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

            {registerForm.tipo_perfil === 'embarcador' ? (
              <div className="form-group">
                <label className="form-label" htmlFor="reg-cnpj">CNPJ *</label>
                <input
                  id="reg-cnpj"
                  type="text"
                  className="form-input"
                  placeholder="00.000.000/0000-00"
                  value={registerForm.cnpj}
                  onChange={e => setRegisterForm(f => ({ ...f, cnpj: formatCNPJ(e.target.value) }))}
                  maxLength={18}
                />
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-cpf">CPF *</label>
                  <input
                    id="reg-cpf"
                    type="text"
                    className="form-input"
                    placeholder="000.000.000-00"
                    value={registerForm.cpf}
                    onChange={e => setRegisterForm(f => ({ ...f, cpf: formatCPF(e.target.value) }))}
                    maxLength={14}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-estado">Estado (UF) *</label>
                    <select
                      id="reg-estado"
                      className="form-select"
                      value={registerForm.estado}
                      onChange={e => setRegisterForm(f => ({ ...f, estado: e.target.value }))}
                    >
                      <option value="">Selecione</option>
                      {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-cidade">Cidade *</label>
                    <input
                      id="reg-cidade"
                      type="text"
                      className="form-input"
                      placeholder="Sua cidade base"
                      value={registerForm.cidade}
                      onChange={e => setRegisterForm(f => ({ ...f, cidade: e.target.value }))}
                    />
                  </div>
                </div>
              </>
            )}

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

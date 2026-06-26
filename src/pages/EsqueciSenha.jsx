import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../api/auth';

export default function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Informe seu email.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Não foi possível enviar o email. Tente novamente.';
      setError(typeof msg === 'string' ? msg : 'Erro inesperado. Tente novamente.');
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
            <div className="auth-title">Recuperar senha</div>
            <div className="auth-subtitle">
              {sent
                ? 'Verifique sua caixa de entrada.'
                : 'Enviaremos um link para redefinir sua senha.'}
            </div>
          </div>
        </div>

        {sent ? (
          /* ── Estado: email enviado ── */
          <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, #22c55e22, #16a34a22)',
              border: '2px solid #22c55e55',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
                stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l1.09-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                <path d="m16 2 6 6-6 6" style={{display:'none'}}/>
              </svg>
            </div>

            <div className="alert alert-success" style={{ marginBottom: 20, textAlign: 'left' }}>
              <strong>Email enviado!</strong><br />
              Se <strong>{email}</strong> está cadastrado, você receberá as instruções em breve.
              Verifique também sua pasta de spam.
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={() => { setSent(false); setEmail(''); }}
            >
              Tentar com outro email
            </button>
          </div>
        ) : (
          /* ── Formulário ── */
          <>
            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">Email cadastrado</label>
                <input
                  id="forgot-email"
                  type="email"
                  className="form-input"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                id="btn-enviar-link"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading}
              >
                {loading
                  ? <><div className="spinner" />Enviando...</>
                  : 'Enviar link de recuperação'}
              </button>
            </form>
          </>
        )}

        <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 20 }}>
          Lembrou a senha?{' '}
          <Link to="/auth" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}>
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}

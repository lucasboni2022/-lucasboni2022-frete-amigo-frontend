import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../api/auth';

export default function RedefinirSenha() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token] = useState(searchParams.get('token') || '');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Link de recuperação inválido ou expirado. Solicite um novo link.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!novaSenha || !confirmarSenha) {
      setError('Preencha todos os campos.');
      return;
    }
    if (novaSenha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!token) {
      setError('Token inválido. Solicite um novo link de recuperação.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authAPI.resetPassword({ token, nova_senha: novaSenha });
      setSuccess(true);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Não foi possível redefinir a senha. O link pode ter expirado.';
      setError(typeof msg === 'string' ? msg : 'Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const strengthLevel = (senha) => {
    if (!senha) return 0;
    let score = 0;
    if (senha.length >= 6) score++;
    if (senha.length >= 10) score++;
    if (/[A-Z]/.test(senha)) score++;
    if (/[0-9]/.test(senha)) score++;
    if (/[^a-zA-Z0-9]/.test(senha)) score++;
    return score;
  };

  const strength = strengthLevel(novaSenha);
  const strengthLabel = ['', 'Muito fraca', 'Fraca', 'Razoável', 'Forte', 'Muito forte'][strength] || '';
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'][strength] || '';

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
            <div className="auth-title">Nova senha</div>
            <div className="auth-subtitle">
              {success ? 'Senha redefinida com sucesso!' : 'Escolha uma senha segura para sua conta.'}
            </div>
          </div>
        </div>

        {success ? (
          /* ── Sucesso ── */
          <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, #22c55e22, #16a34a22)',
              border: '2px solid #22c55e55',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>

            <div className="alert alert-success" style={{ marginBottom: 20, textAlign: 'left' }}>
              <strong>Senha redefinida!</strong><br />
              Sua senha foi alterada com sucesso. Faça login com sua nova senha.
            </div>

            <button
              id="btn-ir-login"
              className="btn btn-primary btn-full btn-lg"
              onClick={() => navigate('/auth')}
            >
              Ir para o login
            </button>
          </div>
        ) : (
          /* ── Formulário ── */
          <>
            {error && (
              <div className="alert alert-error" style={{ marginBottom: 16 }}>
                {error}
                {!token && (
                  <div style={{ marginTop: 8 }}>
                    <Link to="/esqueci-senha" style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 600 }}>
                      Solicitar novo link
                    </Link>
                  </div>
                )}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              {/* Nova senha */}
              <div className="form-group">
                <label className="form-label" htmlFor="nova-senha">Nova senha</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="nova-senha"
                    type={showSenha ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Mínimo 6 caracteres"
                    value={novaSenha}
                    onChange={e => setNovaSenha(e.target.value)}
                    autoComplete="new-password"
                    autoFocus
                    style={{ paddingRight: 44 }}
                    disabled={!token}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha(v => !v)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--color-text-muted)', padding: 0, display: 'flex',
                    }}
                    tabIndex={-1}
                    aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showSenha ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>

                {/* Barra de força da senha */}
                {novaSenha && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 4, borderRadius: 2,
                          background: i <= strength ? strengthColor : 'var(--color-border)',
                          transition: 'background 0.3s',
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: strengthColor, fontWeight: 500 }}>
                      {strengthLabel}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirmar senha */}
              <div className="form-group">
                <label className="form-label" htmlFor="confirmar-senha">Confirmar nova senha</label>
                <input
                  id="confirmar-senha"
                  type={showSenha ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Repita a senha"
                  value={confirmarSenha}
                  onChange={e => setConfirmarSenha(e.target.value)}
                  autoComplete="new-password"
                  disabled={!token}
                  style={{
                    borderColor: confirmarSenha && novaSenha !== confirmarSenha
                      ? '#ef4444'
                      : confirmarSenha && novaSenha === confirmarSenha
                      ? '#22c55e'
                      : undefined,
                  }}
                />
                {confirmarSenha && novaSenha !== confirmarSenha && (
                  <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: 4, display: 'block' }}>
                    As senhas não coincidem
                  </span>
                )}
                {confirmarSenha && novaSenha === confirmarSenha && (
                  <span style={{ fontSize: '0.75rem', color: '#22c55e', marginTop: 4, display: 'block' }}>
                    ✓ Senhas conferem
                  </span>
                )}
              </div>

              <button
                type="submit"
                id="btn-redefinir-senha"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading || !token}
              >
                {loading
                  ? <><div className="spinner" />Salvando...</>
                  : 'Redefinir senha'}
              </button>
            </form>
          </>
        )}

        <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 20 }}>
          <Link to="/auth" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}>
            ← Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}

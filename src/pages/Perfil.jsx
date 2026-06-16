import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api/auth';
import { ESTADOS } from '../components/SearchBar';

export default function Perfil() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    nome_completo: '',
    telefone: '',
    empresa: '',
    cidade: '',
    estado: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        nome_completo: user.nome_completo || user.nome || '',
        telefone: user.telefone || '',
        empresa: user.empresa || '',
        cidade: user.cidade || '',
        estado: user.estado || '',
      });
    }
  }, [user]);

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome_completo.trim()) {
      setError('O nome completo é obrigatório.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.updateProfile(form);
      const updatedData = res.data?.data || res.data || form;
      updateUser({ ...form, ...updatedData });
      setSuccess('Perfil atualizado com sucesso!');
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Erro ao atualizar perfil.';
      setError(typeof msg === 'string' ? msg : 'Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  function getInitials(name) {
    if (!name) return 'U';
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1 className="page-header-title">Meu Perfil</h1>
          <p className="page-header-desc">Mantenha seus dados atualizados para melhor experiência.</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 64, maxWidth: 680 }}>
        {/* Profile card */}
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary), #1a3550)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginBottom: 28,
          color: 'white',
        }}>
          <div style={{
            width: 72, height: 72,
            background: 'var(--color-accent)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 800,
            flexShrink: 0,
          }}>
            {getInitials(user?.nome_completo || user?.nome)}
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 4 }}>
              {user?.nome_completo || user?.nome || 'Usuário'}
            </div>
            <div style={{ opacity: 0.75, fontSize: '0.9rem' }}>{user?.email}</div>
            <div style={{ marginTop: 8 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(0,137,123,0.3)', border: '1px solid rgba(0,137,123,0.5)',
                padding: '3px 10px', borderRadius: '999px',
                fontSize: '0.8rem', fontWeight: 600,
              }}>
                {user?.tipo_perfil === 'embarcador' ? '📦 Embarcador' : '🚛 Caminhoneiro'}
              </span>
            </div>
          </div>
        </div>

        {success && <div className="alert alert-success" style={{ marginBottom: 20 }}>{success}</div>}
        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

        <form onSubmit={handleSubmit} className="card">
          <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 20 }}>
            Dados Pessoais
          </h3>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label" htmlFor="perfil-nome">Nome completo *</label>
            <input
              id="perfil-nome"
              type="text"
              className="form-input"
              value={form.nome_completo}
              onChange={e => handleChange('nome_completo', e.target.value)}
            />
          </div>

          <div className="form-row" style={{ marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="perfil-email">Email</label>
              <input
                id="perfil-email"
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="perfil-tel">Telefone</label>
              <input
                id="perfil-tel"
                type="tel"
                className="form-input"
                placeholder="(11) 99999-9999"
                value={form.telefone}
                onChange={e => handleChange('telefone', e.target.value)}
              />
            </div>
          </div>

          <hr className="divider" />

          <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 20, marginTop: 24 }}>
            Dados da Empresa / Localização
          </h3>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label" htmlFor="perfil-empresa">Empresa / Razão Social</label>
            <input
              id="perfil-empresa"
              type="text"
              className="form-input"
              placeholder="Nome da sua empresa"
              value={form.empresa}
              onChange={e => handleChange('empresa', e.target.value)}
            />
          </div>

          <div className="form-row" style={{ marginBottom: 28 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="perfil-cidade">Cidade</label>
              <input
                id="perfil-cidade"
                type="text"
                className="form-input"
                placeholder="Sua cidade"
                value={form.cidade}
                onChange={e => handleChange('cidade', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="perfil-estado">Estado</label>
              <select
                id="perfil-estado"
                className="form-select"
                value={form.estado}
                onChange={e => handleChange('estado', e.target.value)}
              >
                <option value="">Selecione</option>
                {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-accent btn-lg" disabled={loading}>
            {loading ? <><div className="spinner" />Salvando...</> : '💾 Salvar alterações'}
          </button>
        </form>
      </div>
    </>
  );
}

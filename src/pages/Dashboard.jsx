import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cargasAPI } from '../api/cargas';
import { useAuth } from '../contexts/AuthContext';
import CargaCard from '../components/CargaCard';

function getInitials(name) {
  if (!name) return 'U';
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function getStatusClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'ativa' || s === 'ativo') return 'badge-active';
  if (s === 'negociando') return 'badge-pending';
  return 'badge-inactive';
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cargas, setCargas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchMyCargas = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page: 1, limit: 50 };
      if (statusFilter) params.status = statusFilter;
      const res = await cargasAPI.myCargas(params);
      const data = res.data;
      setCargas(Array.isArray(data) ? data : (data.cargas || data.data || data.items || []));
    } catch (err) {
      setError('Não foi possível carregar suas cargas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCargas();
  }, [statusFilter]);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!window.confirm('Excluir esta carga?')) return;
    try {
      await cargasAPI.delete(id);
      setCargas(cs => cs.filter(c => c.id !== id));
    } catch {
      alert('Erro ao excluir carga.');
    }
  };

  const stats = {
    total: cargas.length,
    ativas: cargas.filter(c => (c.status || '').toLowerCase() === 'ativa').length,
    negociando: cargas.filter(c => (c.status || '').toLowerCase() === 'negociando').length,
  };

  return (
    <>
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 52, height: 52,
                background: 'var(--color-accent)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem', fontWeight: 800, color: 'white',
              }}>
                {getInitials(user?.nome_completo || user?.nome)}
              </div>
              <div>
                <div className="dashboard-title">
                  Olá, {user?.nome_completo?.split(' ')[0] || user?.nome?.split(' ')[0] || 'Usuário'}! 👋
                </div>
                <div className="dashboard-subtitle">
                  {user?.tipo_perfil === 'embarcador' ? '📦 Embarcador' : '🚛 Caminhoneiro'} • {user?.email}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/publicar-carga" className="btn btn-accent">
                + Publicar Nova Carga
              </Link>
              <Link to="/perfil" className="btn" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1.5px solid rgba(255,255,255,0.25)' }}>
                Meu Perfil
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
        {/* Stats */}
        <div className="dashboard-stats">
          {[
            { label: 'Total de Cargas', value: stats.total, icon: '📦' },
            { label: 'Cargas Ativas', value: stats.ativas, icon: '✅' },
            { label: 'Em Negociação', value: stats.negociando, icon: '🤝' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.icon} {s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filter + actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            Minhas cargas publicadas
          </h2>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select
              className="form-select"
              style={{ width: 'auto', height: 40 }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">Todos os status</option>
              <option value="ativa">Ativas</option>
              <option value="negociando">Em negociação</option>
              <option value="concluida">Concluídas</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

        {/* Loading */}
        {loading ? (
          <div className="loading-page">
            <div className="spinner spinner-dark" />
            <span>Carregando suas cargas...</span>
          </div>
        ) : cargas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3 className="empty-title">Nenhuma carga publicada ainda</h3>
            <p className="empty-desc">
              Publique sua primeira carga e encontre caminhoneiros em todo o Brasil!
            </p>
            <Link to="/publicar-carga" className="btn btn-accent btn-lg">
              Publicar primeira carga
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {cargas.map((carga) => (
              <div key={carga.id} style={{ position: 'relative' }}>
                <CargaCard carga={carga} />
                {/* Quick actions overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: 20,
                  right: 24,
                  display: 'flex',
                  gap: 8,
                }}>
                  <Link
                    to={`/cargas/${carga.id}/editar`}
                    className="btn btn-sm btn-outline"
                    style={{ fontSize: '0.8125rem', padding: '5px 12px' }}
                    onClick={e => e.stopPropagation()}
                  >
                    ✏️ Editar
                  </Link>
                  <button
                    className="btn btn-sm"
                    style={{ fontSize: '0.8125rem', padding: '5px 12px', background: '#fef2f2', color: 'var(--color-error)', border: '1.5px solid #fecaca' }}
                    onClick={(e) => handleDelete(carga.id, e)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

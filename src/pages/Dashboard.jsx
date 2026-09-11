import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cargasAPI } from '../api/cargas';
import { useAuth } from '../contexts/AuthContext';
import CargaCard from '../components/CargaCard';
import { getErrorMessage } from '../utils/errorHandler';
import { checkCargasLimit } from '../utils/planoLimits';
import ModalLimiteExcedido from '../components/ModalLimiteExcedido';

function getInitials(name) {
  if (!name) return 'U';
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function getStatusClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'aguardando_motorista') return 'badge-pending';
  if (s === 'contato_liberado') return 'badge-active';
  return 'badge-inactive';
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cargas, setCargas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitData, setLimitData] = useState(null);

  const handleGoToPublicar = (e) => {
    e.preventDefault();
    const check = checkCargasLimit(cargas, user);
    if (check.excedeu) {
      setLimitData(check);
      setShowLimitModal(true);
    } else {
      navigate('/publicar-carga');
    }
  };

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
      setError(getErrorMessage(err, 'Não foi possível carregar suas cargas.'));
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
    } catch (err) {
      alert(getErrorMessage(err, 'Erro ao excluir carga.'));
    }
  };

  const stats = {
    total: cargas.length,
    aguardando: cargas.filter(c => c.status === 'aguardando_motorista').length,
    contato_liberado: cargas.filter(c => c.status === 'contato_liberado').length,
    finalizadas: cargas.filter(c => c.status === 'finalizada').length,
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
              {user?.tipo_perfil === 'embarcador' && (
                <button type="button" onClick={handleGoToPublicar} className="btn btn-accent">
                  + Publicar Nova Carga
                </button>
              )}
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
            { label: 'Total de Cargas',       value: stats.total,            icon: '📦' },
            { label: 'Aguardando Motorista',   value: stats.aguardando,       icon: '🟡' },
            { label: 'Finalizado',             value: stats.finalizadas,      icon: '⚫' },
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
              <option value="aguardando_motorista">🟡 Aguardando Motorista</option>
              <option value="finalizada">⚫ Finalizado</option>
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
            {user?.tipo_perfil !== 'caminhoneiro' && (
              <button type="button" onClick={handleGoToPublicar} className="btn btn-accent btn-lg">
                Publicar primeira carga
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {cargas.map((carga) => (
              <CargaCard
                key={carga.id}
                carga={carga}
                actions={carga.status === 'aguardando_motorista' ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      style={{ fontSize: '0.8125rem', padding: '5px 12px' }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/cargas/${carga.id}/editar`);
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      style={{ fontSize: '0.8125rem', padding: '5px 12px' }}
                      onClick={(e) => handleDelete(carga.id, e)}
                    >
                      🗑️ Excluir
                    </button>
                  </>
                ) : null}
              />
            ))}
          </div>
        )}
      </div>

      <ModalLimiteExcedido
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        limitData={limitData}
      />
    </>
  );
}

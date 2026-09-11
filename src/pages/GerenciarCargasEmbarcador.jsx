import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cargasAPI } from '../api/cargas';
import { useAuth } from '../contexts/AuthContext';
import { ESTADOS } from '../components/SearchBar';
import CargaCard from '../components/CargaCard';
import { getErrorMessage } from '../utils/errorHandler';
import { checkCargasLimit } from '../utils/planoLimits';
import ModalLimiteExcedido from '../components/ModalLimiteExcedido';

export default function GerenciarCargasEmbarcador() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isEmbarcador = user?.tipo_perfil === 'embarcador';

  const [cargas, setCargas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
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

  // Filtros de localidade e status
  const [filters, setFilters] = useState({
    origem_estado: '',
    origem_cidade: '',
    destino_estado: '',
    destino_cidade: '',
    visibilidade: 'TODAS', // TODAS, VIP_3H, PUBLICAS, FINALIZADAS
  });

  const fetchMyCargas = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await cargasAPI.myCargas();
      const data = res.data;
      const list = Array.isArray(data) ? data : (data.cargas || data.data || data.items || []);
      setCargas(list);
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível carregar suas cargas.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && isEmbarcador) {
      fetchMyCargas();
    }
  }, [isAuthenticated, isEmbarcador, fetchMyCargas]);

  if (!isAuthenticated || !isEmbarcador) {
    return (
      <div className="container" style={{ paddingTop: 64, paddingBottom: 64, textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: 500, margin: '0 auto', padding: 40 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔒</div>
          <h2 style={{ marginBottom: 12 }}>Acesso Restrito a Embarcadores</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>
            Esta página é exclusiva para usuários com perfil de embarcador cadastrado.
          </p>
          <Link to="/dashboard" className="btn btn-primary">
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza de que deseja excluir/cancelar esta carga?')) return;
    setDeletingId(id);
    try {
      await cargasAPI.delete(id);
      setCargas(list => list.filter(c => c.id !== id));
    } catch (err) {
      alert(getErrorMessage(err, 'Erro ao excluir carga.'));
    } finally {
      setDeletingId(null);
    }
  };

  // Aplicação dos Filtros Locais
  const filteredCargas = cargas.filter(carga => {
    // Filtro por Estado Origem
    if (filters.origem_estado && carga.origem_estado !== filters.origem_estado) {
      return false;
    }
    // Filtro por Cidade Origem (case insensitive substring)
    if (filters.origem_cidade && !carga.origem_cidade?.toLowerCase().includes(filters.origem_cidade.toLowerCase())) {
      return false;
    }
    // Filtro por Estado Destino
    if (filters.destino_estado && carga.destino_estado !== filters.destino_estado) {
      return false;
    }
    // Filtro por Cidade Destino
    if (filters.destino_cidade && !carga.destino_cidade?.toLowerCase().includes(filters.destino_cidade.toLowerCase())) {
      return false;
    }
    // Filtro por Visibilidade / Timer
    const timeRef = carga.exclusivo_ate || carga.publicado_em || carga.criado_em || carga.created_at;
    const isVipWindow = timeRef ? (new Date(carga.exclusivo_ate || (new Date(timeRef).getTime() + 3*3600*1000)).getTime() > Date.now()) : false;

    if (filters.visibilidade === 'VIP_3H' && (!isVipWindow || carga.status === 'finalizada')) return false;
    if (filters.visibilidade === 'PUBLICAS' && (isVipWindow || carga.status === 'finalizada')) return false;
    if (filters.visibilidade === 'FINALIZADAS' && carga.status !== 'finalizada') return false;

    return true;
  });

  // Métricas
  const totalCargas = cargas.length;
  const cargasVipCount = cargas.filter(c => {
    const timeRef = c.exclusivo_ate || c.publicado_em || c.criado_em || c.created_at;
    return timeRef && c.status !== 'finalizada' && (new Date(c.exclusivo_ate || (new Date(timeRef).getTime() + 3*3600*1000)).getTime() > Date.now());
  }).length;
  const cargasPublicasCount = cargas.filter(c => {
    const timeRef = c.exclusivo_ate || c.publicado_em || c.criado_em || c.created_at;
    return c.status !== 'finalizada' && (!timeRef || (new Date(c.exclusivo_ate || (new Date(timeRef).getTime() + 3*3600*1000)).getTime() <= Date.now()));
  }).length;

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 className="page-header-title">Gerenciamento de Cargas</h1>
              <p className="page-header-desc">Painel exclusivo do embarcador para controle e visibilidade por região.</p>
            </div>
            <button type="button" onClick={handleGoToPublicar} className="btn btn-accent btn-lg">
              ➕ Publicar Nova Carga
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
        {/* Metricas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
          marginBottom: 32,
        }}>
          <div className="card" style={{ padding: '20px 24px', borderLeft: '4px solid var(--color-primary)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Total de Cargas
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 4 }}>{totalCargas}</div>
          </div>

          <div className="card" style={{ padding: '20px 24px', borderLeft: '4px solid #f59e0b', background: '#fffbeb' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b45309', textTransform: 'uppercase' }}>
              ⚡ Janela VIP (0 a 3h)
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#92400e', marginTop: 4 }}>{cargasVipCount}</div>
            <div style={{ fontSize: '0.75rem', color: '#b45309', marginTop: 2 }}>Visível apenas para motoristas assinantes</div>
          </div>

          <div className="card" style={{ padding: '20px 24px', borderLeft: '4px solid #10b981' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              🔓 Liberadas para Todos
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 4 }}>{cargasPublicasCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Visíveis para todos os motoristas</div>
          </div>
        </div>

        {/* Filtros por Localidade e Status */}
        <div className="card" style={{ marginBottom: 32, padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filtros por Localidade e Visibilidade
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
          }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>UF Origem</label>
              <select
                className="form-select"
                value={filters.origem_estado}
                onChange={e => setFilters(f => ({ ...f, origem_estado: e.target.value }))}
              >
                <option value="">Todas as UFs</option>
                {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Cidade Origem</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Campinas"
                value={filters.origem_cidade}
                onChange={e => setFilters(f => ({ ...f, origem_cidade: e.target.value }))}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>UF Destino</label>
              <select
                className="form-select"
                value={filters.destino_estado}
                onChange={e => setFilters(f => ({ ...f, destino_estado: e.target.value }))}
              >
                <option value="">Todas as UFs</option>
                {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Cidade Destino</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Curitiba"
                value={filters.destino_cidade}
                onChange={e => setFilters(f => ({ ...f, destino_cidade: e.target.value }))}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Fase / Visibilidade</label>
              <select
                className="form-select"
                value={filters.visibilidade}
                onChange={e => setFilters(f => ({ ...f, visibilidade: e.target.value }))}
              >
                <option value="TODAS">Todas as Fases</option>
                <option value="VIP_3H">⚡ Exclusiva Assinantes (0-3h)</option>
                <option value="PUBLICAS">🔓 Pública (&gt; 3h)</option>
                <option value="FINALIZADAS">⚫ Finalizadas</option>
              </select>
            </div>
          </div>

          {(filters.origem_estado || filters.origem_cidade || filters.destino_estado || filters.destino_cidade || filters.visibilidade !== 'TODAS') && (
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setFilters({ origem_estado: '', origem_cidade: '', destino_estado: '', destino_cidade: '', visibilidade: 'TODAS' })}
              >
                🧹 Limpar Filtros
              </button>
            </div>
          )}
        </div>

        {/* Lista de Cargas */}
        {error && <div className="alert alert-error" style={{ marginBottom: 24 }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>Carregando suas cargas...</p>
          </div>
        ) : filteredCargas.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📦</div>
            <h3>Nenhuma carga encontrada</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 20, marginTop: 4 }}>
              Não há cargas publicadas correspondentes aos filtros selecionados.
            </p>
            <Link to="/publicar-carga" className="btn btn-primary">
              Publicar Carga Agora
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {filteredCargas.map(carga => (
              <CargaCard
                key={carga.id}
                carga={carga}
                actions={
                  <>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate('/mensagens');
                      }}
                      title="Ver conversas de motoristas"
                    >
                      💬 Conversas
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
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
                      style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(carga.id);
                      }}
                      disabled={deletingId === carga.id}
                    >
                      {deletingId === carga.id ? 'Excluindo...' : '🗑️ Excluir'}
                    </button>
                  </>
                }
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

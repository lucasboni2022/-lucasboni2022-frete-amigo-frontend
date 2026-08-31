import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cargasAPI } from '../api/cargas';
import { authAPI } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import CargaCard from '../components/CargaCard';
import { ESTADOS, VEICULOS } from '../components/SearchBar';
import { getErrorMessage } from '../utils/errorHandler';

export default function BuscarCargas() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cargas, setCargas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  // Estado da assinatura Hotmart
  const [subStatus, setSubStatus] = useState(null);
  const [subLoading, setSubLoading] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!isAuthenticated) {
      setSubStatus(null);
      return;
    }
    setSubLoading(true);
    try {
      const res = await authAPI.getSubscriptionStatus();
      setSubStatus(res.data);
    } catch (err) {
      console.warn('Não foi possível verificar a assinatura:', err);
    } finally {
      setSubLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const [filters, setFilters] = useState({
    origem: searchParams.get('origem') || '',
    destino: searchParams.get('destino') || '',
    veiculo: searchParams.get('veiculo') || '',
  });

  const fetchCargas = useCallback(async (currentPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: currentPage,
        limit: LIMIT,
      };
      if (filters.origem) params.origem_estado = filters.origem;
      if (filters.destino) params.destino_estado = filters.destino;
      if (filters.veiculo) params.tipo_veiculo = filters.veiculo;

      const res = await cargasAPI.list(params);
      const data = res.data;
      // API pode retornar { cargas, total } ou array direto ou { data: [...] }
      const list = Array.isArray(data) ? data : (data.cargas || data.data || data.items || []);
      const count = data.total || data.count || list.length;
      setCargas(list);
      setTotal(count);
    } catch (err) {
      if (err.response?.status === 503) {
        setError('O servidor de API está temporariamente indisponível (Erro 503). Tente novamente em alguns instantes.');
      } else {
        setError(getErrorMessage(err, 'Não foi possível carregar as cargas. Tente novamente.'));
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCargas(page);
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    const params = {};
    if (filters.origem) params.origem = filters.origem;
    if (filters.destino) params.destino = filters.destino;
    if (filters.veiculo) params.veiculo = filters.veiculo;
    setSearchParams(params);
    fetchCargas(1);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1 className="page-header-title">Cargas disponíveis</h1>
          <p className="page-header-desc">Filtre por origem, destino ou tipo de veículo.</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
        {/* Filters */}
        <div className="filters-card">
          <div className="filters-grid">
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Origem (UF)
              </div>
              <select
                className="form-select"
                value={filters.origem}
                onChange={e => setFilters(f => ({ ...f, origem: e.target.value }))}
              >
                <option value="">Todos os estados</option>
                {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Destino (UF)
              </div>
              <select
                className="form-select"
                value={filters.destino}
                onChange={e => setFilters(f => ({ ...f, destino: e.target.value }))}
              >
                <option value="">Todos os estados</option>
                {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h5l3 3v5h-8V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                Veículo
              </div>
              <select
                className="form-select"
                value={filters.veiculo}
                onChange={e => setFilters(f => ({ ...f, veiculo: e.target.value }))}
              >
                <option value="">Todos</option>
                {VEICULOS.filter(v => v !== 'Todos').map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn btn-primary" style={{ width: '100%', height: 48 }} onClick={handleSearch}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Buscar
              </button>
            </div>
          </div>
        </div>

        {/* Hotmart Subscription Status Analysis Banner */}
        {isAuthenticated && subStatus && (
          <div style={{
            background: subStatus.active ? '#f0fdf4' : '#fffbeb',
            border: `1.5px solid ${subStatus.active ? '#bbf7d0' : '#fde68a'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: '1.5rem' }}>
                {subStatus.active ? '✅' : '💳'}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: subStatus.active ? '#166534' : '#92400e' }}>
                  {subStatus.active
                    ? `Assinatura Ativa (Hotmart: ${subStatus.status})`
                    : `Análise de Pagamento Hotmart (${subStatus.status === 'SEM_ASSINATURA' ? 'Nenhuma assinatura encontrada' : subStatus.status})`}
                </div>
                <div style={{ fontSize: '0.85rem', color: subStatus.active ? '#15803d' : '#b45309', marginTop: 2 }}>
                  {subStatus.active
                    ? 'Seu pagamento foi confirmado via Webhook Hotmart. Acesso liberado aos contatos dos embarcadores!'
                    : 'Ainda não consta confirmação de pagamento para o e-mail ' + subStatus.email + '. O acesso aos contatos requer plano ativo.'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                className="btn btn-sm btn-outline"
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                onClick={checkSubscription}
                disabled={subLoading}
              >
                {subLoading ? 'Verificando...' : '🔄 Reanalisar'}
              </button>
              {!subStatus.active && (
                <a
                  href="https://pay.hotmart.com/E106911485K?bid=1785524650703"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-accent"
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                >
                  🛒 Assinar Agora
                </a>
              )}
            </div>
          </div>
        )}

        {/* Banner VIP: informa não-assinantes sobre o período exclusivo de 3h */}
        {isAuthenticated && subStatus && !subStatus.active && (
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            border: '1.5px solid #4f46e5',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}>
            <div style={{ fontSize: '2rem', flexShrink: 0 }}>⏳</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e0e7ff', marginBottom: 4 }}>
                Cargas VIP — Exclusivas para Assinantes por 3 horas
              </div>
              <div style={{ fontSize: '0.84rem', color: '#a5b4fc', lineHeight: 1.5 }}>
                Motoristas com assinatura ativa acessam as cargas no momento da publicação com um
                {' '}<strong style={{ color: '#c7d2fe' }}>cronômetro regressivo de 03:00:00</strong>.
                Após esse período, as cargas ficam visíveis para todos.
              </div>
            </div>
            <a
              href="https://pay.hotmart.com/E106911485K?bid=1785524650703"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 18px',
                fontWeight: 700,
                fontSize: '0.85rem',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
              }}
            >
              🚀 Assinar e Ver Primeiro
            </a>
          </div>
        )}

        {/* Results info */}
        {!loading && (
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 20 }}>
            {total > 0 ? `${total} carga(s) encontrada(s)` : 'Nenhuma carga encontrada com os filtros selecionados.'}
          </p>
        )}

        {/* Error */}
        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

        {/* Loading */}
        {loading ? (
          <div className="loading-page">
            <div className="spinner spinner-dark" />
            <span>Buscando cargas...</span>
          </div>
        ) : cargas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3 className="empty-title">Nenhuma carga encontrada</h3>
            <p className="empty-desc">
              Tente alterar os filtros ou verifique novamente mais tarde. Novas cargas são publicadas diariamente!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {cargas.map((carga, i) => (
              <div key={carga.id || i} style={{ animationDelay: `${i * 0.05}s` }}>
                <CargaCard carga={carga} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              ‹
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  className={`page-btn${page === pageNum ? ' active' : ''}`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              className="page-btn"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </>
  );
}

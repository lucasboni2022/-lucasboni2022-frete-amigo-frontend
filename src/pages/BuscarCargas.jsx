import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cargasAPI } from '../api/cargas';
import CargaCard from '../components/CargaCard';
import { ESTADOS, VEICULOS } from '../components/SearchBar';

export default function BuscarCargas() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cargas, setCargas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const LIMIT = 10;

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
      setError('Não foi possível carregar as cargas. Tente novamente.');
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

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { cargasAPI } from '../api/cargas';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/errorHandler';

function formatCurrency(val) {
  if (!val && val !== 0) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try { return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR'); } catch { return dateStr; }
}

function getStatusClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'ativa' || s === 'ativo') return 'badge-active';
  if (s === 'negociando') return 'badge-pending';
  return 'badge-inactive';
}

export default function CargaDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [carga, setCarga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  // Estado do botão de contato
  const [contato, setContato] = useState(null);         // { contato_telefone, contato_email, embarcador_nome }
  const [contatoLoading, setContatoLoading] = useState(false);
  const [contatoErro, setContatoErro] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await cargasAPI.getById(id);
        const data = res.data;
        setCarga(data.carga || data.data || data);
      } catch (err) {
        setError(getErrorMessage(err, 'Carga não encontrada.'));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir esta carga?')) return;
    setDeleting(true);
    try {
      await cargasAPI.delete(id);
      navigate('/dashboard');
    } catch (err) {
      alert(getErrorMessage(err, 'Erro ao excluir carga.'));
      setDeleting(false);
    }
  };

  const HOTMART_CHECKOUT = 'https://pay.hotmart.com/E106911485K?bid=1785524650703';

  const handleVerContato = async () => {
    // 1. Não logado → redireciona para login
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    // Evita chamadas duplas
    if (contatoLoading || contato) return;

    setContatoLoading(true);
    setContatoErro('');
    try {
      const res = await cargasAPI.getContato(id);
      setContato(res.data);
    } catch (err) {
      const data = err?.response?.data;
      if (err?.response?.status === 403 && data?.plano_required) {
        // 2. Sem plano → redireciona para Hotmart
        window.location.href = HOTMART_CHECKOUT;
      } else {
        setContatoErro(getErrorMessage(err, 'Erro ao buscar contato. Tente novamente.'));
      }
    } finally {
      setContatoLoading(false);
    }
  };

  const isOwner = isAuthenticated && carga && (
    carga.usuario_id === user?.id || carga.embarcador_id === user?.id
  );

  if (loading) return (
    <div className="page-wrapper">
      <div className="loading-page"><div className="spinner spinner-dark" /><span>Carregando carga...</span></div>
    </div>
  );

  if (error || !carga) return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 60, textAlign: 'center' }}>
        <div className="empty-icon" style={{ margin: '0 auto 16px' }}>😕</div>
        <h2 style={{ marginBottom: 10 }}>Carga não encontrada</h2>
        <p className="text-muted" style={{ marginBottom: 24 }}>{error}</p>
        <Link to="/buscar-cargas" className="btn btn-primary">← Voltar às cargas</Link>
      </div>
    </div>
  );

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Link to="/buscar-cargas" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  ← Todas as cargas
                </Link>
              </div>
              <h1 className="page-header-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {carga.origem_cidade}/{carga.origem_estado}
                <span style={{ color: 'var(--color-accent)' }}>→</span>
                {carga.destino_cidade}/{carga.destino_estado}
                <span className={`badge ${getStatusClass(carga.status)}`} style={{ fontSize: '0.875rem' }}>
                  {carga.status || 'ativa'}
                </span>
              </h1>
            </div>
            {isOwner && (
              <div style={{ display: 'flex', gap: 10 }}>
                <Link to={`/cargas/${id}/editar`} className="btn btn-outline btn-sm">✏️ Editar</Link>
                <button className="btn btn-sm" style={{ background: '#fef2f2', color: 'var(--color-error)', border: '1.5px solid #fecaca' }} onClick={handleDelete} disabled={deleting}>
                  {deleting ? '...' : '🗑️ Excluir'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
        <div className="detail-grid">
          {/* Main info */}
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="detail-section">
                <div className="detail-section-title">Informações da Carga</div>
                <div className="detail-row">
                  <span className="detail-label">Origem</span>
                  <span className="detail-value">{carga.origem_cidade} / {carga.origem_estado}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Destino</span>
                  <span className="detail-value">{carga.destino_cidade} / {carga.destino_estado}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Data de Coleta</span>
                  <span className="detail-value">{formatDate(carga.data_coleta)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tipo de Carga</span>
                  <span className="detail-value">{carga.tipo_carga || '—'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Peso</span>
                  <span className="detail-value">{carga.peso_kg ? `${carga.peso_kg} toneladas` : '—'}</span>
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-section-title">Transporte</div>
                <div className="detail-row">
                  <span className="detail-label">Tipo de Veículo</span>
                  <span className="detail-value">{carga.tipo_veiculo || '—'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tipo de Carroceria</span>
                  <span className="detail-value">{carga.tipo_carroceria || '—'}</span>
                </div>
              </div>

              {carga.observacoes && (
                <div className="detail-section">
                  <div className="detail-section-title">Observações</div>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--color-text)', lineHeight: 1.65 }}>
                    {carga.observacoes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Preço */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                VALOR DO FRETE
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-primary)', marginBottom: 4 }}>
                {formatCurrency(carga.valor_frete)}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                Valor negociável com o embarcador
              </div>
            </div>

            {/* Contato */}
            <div className="contact-card">
              <div className="contact-card-title">Interesse nesta carga?</div>
              <div className="contact-card-desc">
                {contato
                  ? 'Dados de contato do embarcador:'
                  : 'Entre em contato diretamente com o embarcador.'}
              </div>

              {/* Contato já revelado */}
              {contato ? (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {contato.embarcador_nome && (
                    <div className="contact-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <strong>{contato.embarcador_nome}</strong>
                    </div>
                  )}
                  {contato.contato_telefone && (
                    <div className="contact-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      <a href={`tel:${contato.contato_telefone}`} style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                        {contato.contato_telefone}
                      </a>
                    </div>
                  )}
                  {contato.contato_email && (
                    <div className="contact-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      <a href={`mailto:${contato.contato_email}`} style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                        {contato.contato_email}
                      </a>
                    </div>
                  )}
                  {!contato.contato_telefone && !contato.contato_email && (
                    <p style={{ opacity: 0.7, fontSize: '0.875rem' }}>O embarcador não informou contatos adicionais.</p>
                  )}
                </div>
              ) : (
                <>
                  {/* Mensagem de erro (se houver) */}
                  {contatoErro && (
                    <p style={{ color: 'var(--color-error)', fontSize: '0.85rem', marginTop: 8, marginBottom: 4 }}>
                      {contatoErro}
                    </p>
                  )}

                  {/* Botão principal */}
                  <button
                    id="btn-ver-contato-embarcador"
                    className="btn btn-accent btn-full"
                    style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    onClick={handleVerContato}
                    disabled={contatoLoading}
                  >
                    {contatoLoading ? (
                      <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Verificando plano...</>
                    ) : isAuthenticated ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        Ver Contato do Embarcador
                      </>
                    ) : (
                      'Entrar para ver contato'
                    )}
                  </button>

                  {/* Dica abaixo do botão (apenas para logados sem contato ainda) */}
                  {isAuthenticated && !contatoLoading && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 8, textAlign: 'center', lineHeight: 1.4 }}>
                      Requer plano ativo. Clique para verificar.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

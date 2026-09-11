import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { cargasAPI } from '../api/cargas';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/errorHandler';
import ChatWidget from '../components/ChatWidget';

function formatCurrency(val) {
  if (!val && val !== 0) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try { return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR'); } catch { return dateStr; }
}

function formatStatus(status) {
  if (!status) return 'Ativa';
  if (status.toLowerCase() === 'aguardando_motorista') return 'Aguardando Motorista';
  if (status.toLowerCase() === 'finalizada' || status.toLowerCase() === 'finalizado') return 'Finalizado';
  return status.replace(/_/g, ' ');
}

function getStatusClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'ativa' || s === 'ativo' || s === 'contato_liberado') return 'badge-active';
  if (s === 'negociando' || s === 'aguardando_motorista') return 'badge-pending';
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
  // Contato do embarcador
  const [contato, setContato] = useState(null); // { contato_telefone, contato_email, embarcador_nome }
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await cargasAPI.getById(id);
        const data = res.data;
        setCarga(data.carga || data.data || data);
      } catch (err) {
        setError(getErrorMessage(err, 'Carga não encontrada.'));
      } finally {
        setLoading(false);
      }

      // Busca contato do embarcador (silenciosamente)
      try {
        const res = await cargasAPI.getContato(id);
        setContato(res.data);
      } catch {
        // sem plano ou não autenticado — não exibe nada
      }
    };
    fetchAll();
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
                  {formatStatus(carga.status)}
                </span>
              </h1>
            </div>
            {isOwner && (
              <div style={{ display: 'flex', gap: 10 }}>
                <Link to={`/cargas/${id}/editar`} className="btn btn-primary btn-sm">✏️ Editar</Link>
                <button className="btn btn-primary btn-sm" onClick={handleDelete} disabled={deleting}>
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

            {/* Contato do Embarcador */}
            {(() => {
              // Resolve dados mesclando endpoint /contato (plano) com campos diretos da carga
              const nome = contato?.embarcador_nome || carga.embarcador_nome || carga.nome_embarcador;
              const telefone = contato?.contato_telefone || carga.contato_telefone || carga.embarcador_telefone || carga.telefone;
              const email = contato?.contato_email || carga.contato_email || carga.embarcador_email;
              if (!nome && !telefone && !email && !carga) return null;

              return (
                <div className="card" style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 12 }}>
                    EMBARCADOR
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {nome && (
                      <div className="contact-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <strong>{nome}</strong>
                      </div>
                    )}

                    {/* Ação Principal: Iniciar conversa no Chat */}
                    {isOwner ? (
                      <div style={{ padding: '12px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                          Você é o anunciante desta carga
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ width: '100%', justifyContent: 'center', gap: 6 }}
                          onClick={() => setChatOpen(true)}
                        >
                          💬 Ver mensagens recebidas
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn-iniciar-conversa"
                        onClick={() => {
                          if (!isAuthenticated) {
                            navigate(`/auth?redirect=/cargas/${id}`);
                          } else {
                            setChatOpen(true);
                          }
                        }}
                        title="Iniciar conversa no chat com o embarcador"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        <span>Iniciar conversa</span>
                      </button>
                    )}

                    {email && (
                      <div className="contact-item" style={{ fontSize: '0.875rem' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        <a href={`mailto:${email}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                          {email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Floating Chat Widget */}
      {carga && (
        <ChatWidget
          carga={carga}
          embarcador={{
            id: carga.usuario_id || carga.embarcador_id,
            nome: contato?.embarcador_nome || carga.embarcador_nome || carga.nome_embarcador,
            telefone: contato?.contato_telefone || carga.contato_telefone || carga.embarcador_telefone,
            email: contato?.contato_email || carga.contato_email || carga.embarcador_email,
          }}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      )}
    </>
  );
}

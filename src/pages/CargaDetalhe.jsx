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

function getWhatsAppUrl(phone, carga) {
  if (!phone) return '#';
  const cleanDigits = phone.replace(/\D/g, '');
  const phoneWithCountry = (cleanDigits.length === 10 || cleanDigits.length === 11)
    ? `55${cleanDigits}`
    : cleanDigits;

  const detalhes = [];
  if (carga?.origem_cidade || carga?.origem_estado) {
    detalhes.push(`• Origem: ${carga.origem_cidade || ''}/${carga.origem_estado || ''}`);
  }
  if (carga?.destino_cidade || carga?.destino_estado) {
    detalhes.push(`• Destino: ${carga.destino_cidade || ''}/${carga.destino_estado || ''}`);
  }
  if (carga?.data_coleta) {
    detalhes.push(`• Data de Coleta: ${formatDate(carga.data_coleta)}`);
  }
  if (carga?.tipo_carga) {
    detalhes.push(`• Tipo de Carga: ${carga.tipo_carga}`);
  }
  if (carga?.peso_kg) {
    detalhes.push(`• Peso: ${carga.peso_kg} toneladas`);
  }
  if (carga?.tipo_veiculo) {
    detalhes.push(`• Tipo de Veículo: ${carga.tipo_veiculo}`);
  }
  if (carga?.tipo_carroceria) {
    detalhes.push(`• Carroceria: ${carga.tipo_carroceria}`);
  }
  if (carga?.valor_frete) {
    detalhes.push(`• Valor do Frete: ${formatCurrency(carga.valor_frete)}`);
  }

  const linkCarga = typeof window !== 'undefined'
    ? (carga?.id ? `${window.location.origin}/cargas/${carga.id}` : window.location.href)
    : '';

  const textoCarga = detalhes.length > 0 ? `\n\nInformações da Carga:\n${detalhes.join('\n')}` : '';
  const textoLink = linkCarga ? `\n\nLink da carga:\n${linkCarga}` : '';
  const mensagem = `Oi, boa tarde! Tudo bem?\n\nVi sua carga disponível no Frete Amigo e fiquei interessado em realizar o frete. Ela ainda está disponível? Se sim, podemos conversar!${textoCarga}${textoLink}`;

  return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(mensagem)}`;
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

            {/* Contato do Embarcador */}
            {(() => {
              // Resolve dados mesclando endpoint /contato (plano) com campos diretos da carga
              const nome = contato?.embarcador_nome || carga.embarcador_nome || carga.nome_embarcador;
              const telefone = contato?.contato_telefone || carga.contato_telefone || carga.embarcador_telefone || carga.telefone;
              const email = contato?.contato_email || carga.contato_email || carga.embarcador_email;
              if (!nome && !telefone && !email) return null;
              return (
                <div className="card" style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 12 }}>
                    CONTATO DO EMBARCADOR
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {nome && (
                      <div className="contact-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <strong>{nome}</strong>
                      </div>
                    )}
                    {telefone && (
                      <a
                        href={getWhatsAppUrl(telefone, carga)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-item"
                        style={{ textDecoration: 'none', cursor: 'pointer' }}
                        title="Conversar no WhatsApp sobre esta carga"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        </svg>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '1.05rem' }}>
                            {telefone}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                            Conversar no WhatsApp →
                          </span>
                        </div>
                      </a>
                    )}
                    {email && (
                      <div className="contact-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        <a href={`mailto:${email}`} style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
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
    </>
  );
}

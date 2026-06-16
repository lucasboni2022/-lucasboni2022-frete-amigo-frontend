import { Link } from 'react-router-dom';

function formatCurrency(val) {
  if (!val && val !== 0) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
}

function getStatusClass(status) {
  if (!status) return 'badge-inactive';
  const s = status.toLowerCase();
  if (s === 'ativa' || s === 'ativo' || s === 'active') return 'badge-active';
  if (s === 'negociando') return 'badge-pending';
  return 'badge-inactive';
}

export default function CargaCard({ carga }) {
  const {
    id,
    origem_cidade, origem_estado,
    destino_cidade, destino_estado,
    data_coleta,
    tipo_carga,
    tipo_veiculo,
    peso_kg,
    valor_frete,
    status = 'ativa',
  } = carga;

  return (
    <Link to={`/cargas/${id}`} className="carga-card animate-fade-in">
      <div className="carga-card-header">
        <div className="carga-route">
          <div className="carga-city">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {origem_cidade}/{origem_estado}
          </div>
          <span className="carga-route-arrow">→</span>
          <div className="carga-city">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {destino_cidade}/{destino_estado}
          </div>
        </div>
        <span className={`badge ${getStatusClass(status)}`}>{status}</span>
      </div>

      <div className="carga-meta">
        {data_coleta && (
          <div className="carga-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {formatDate(data_coleta)}
          </div>
        )}
        {tipo_carga && (
          <div className="carga-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            {tipo_carga}
          </div>
        )}
        {tipo_veiculo && (
          <div className="carga-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13" rx="2"/>
              <path d="M16 8h5l3 3v5h-8V8z"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            {tipo_veiculo}
          </div>
        )}
        {peso_kg && (
          <div className="carga-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V11h4l2 10H4L6 11h4V9.5A4 4 0 0 1 8 6a4 4 0 0 1 4-4z"/>
            </svg>
            {peso_kg}t
          </div>
        )}
      </div>

      <div className="carga-footer">
        <div>
          <div className="carga-price-label">VALOR DO FRETE</div>
          <div className="carga-price">{formatCurrency(valor_frete)}</div>
        </div>
        <div className="carga-link">
          Ver detalhes →
        </div>
      </div>
    </Link>
  );
}

import { Link } from 'react-router-dom';

export default function ModalLimiteExcedido({ isOpen, onClose, limitData }) {
  if (!isOpen || !limitData) return null;

  const { planoInfo, limite, totalUsado, diasRestantes } = limitData;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 39, 68, 0.65)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
    }}>
      <div className="card" style={{
        maxWidth: 520,
        width: '100%',
        padding: '32px 28px',
        position: 'relative',
        boxShadow: '0 20px 45px rgba(0,0,0,0.25)',
        border: '1.5px solid #fecaca',
        animation: 'fadeIn 0.2s ease-out',
      }}>
        {/* Botão fechar topo */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            fontSize: '1.25rem',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            lineHeight: 1,
          }}
          aria-label="Fechar"
        >
          ✕
        </button>

        {/* Ícone de alerta */}
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#fef2f2',
          border: '2px solid #fca5a5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.75rem',
          margin: '0 auto 16px',
        }}>
          ⚠️
        </div>

        {/* Título */}
        <h3 style={{
          textAlign: 'center',
          color: '#991b1b',
          fontSize: '1.25rem',
          fontWeight: 800,
          marginBottom: 8,
        }}>
          Quantidade de cargas excedida para o plano atual
        </h3>

        <p style={{
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: '0.9rem',
          marginBottom: 24,
        }}>
          Você atingiu o limite máximo de publicações permitido pelo seu plano nos últimos 30 dias.
        </p>

        {/* Quadro informativo */}
        <div style={{
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)',
          padding: '16px 20px',
          marginBottom: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              Plano Atual:
            </span>
            <span style={{
              fontWeight: 700,
              fontSize: '0.9rem',
              color: 'var(--color-primary)',
              background: '#e0f2fe',
              padding: '2px 10px',
              borderRadius: '999px',
            }}>
              {planoInfo?.name || 'Gratuito'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              Limite do seu plano:
            </span>
            <strong style={{ fontSize: '0.95rem', color: 'var(--color-text)' }}>
              {limite} {limite === 1 ? 'carga' : 'cargas'} / mês
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              Cargas já postadas (últimos 30 dias):
            </span>
            <strong style={{ fontSize: '1rem', color: '#dc2626' }}>
              {totalUsado} {totalUsado === 1 ? 'carga usada' : 'cargas usadas'}
            </strong>
          </div>
        </div>

        {/* Mensagem de espera ou upgrade */}
        <div style={{
          background: '#fffbeb',
          border: '1.5px solid #fde68a',
          borderRadius: 'var(--radius)',
          padding: '14px 16px',
          marginBottom: 24,
          fontSize: '0.875rem',
          color: '#92400e',
          lineHeight: 1.5,
          textAlign: 'center',
        }}>
          ⏳ <strong>Aguarde {diasRestantes} {diasRestantes === 1 ? 'dia' : 'dias'}</strong> para voltar a publicar ou <strong>faça um upgrade do plano</strong> para liberar mais publicações imediatamente.
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Link
            to="/planos"
            className="btn btn-accent btn-full btn-lg"
            onClick={onClose}
            style={{ textDecoration: 'none', textAlign: 'center' }}
          >
            🚀 Fazer Upgrade de Plano
          </Link>
          <button
            type="button"
            className="btn btn-outline btn-lg"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

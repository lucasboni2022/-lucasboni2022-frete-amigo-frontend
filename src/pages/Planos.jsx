import { Link, useNavigate } from 'react-router-dom';
import { LISTA_PLANOS } from '../utils/planoLimits';
import { useAuth } from '../contexts/AuthContext';

export default function Planos() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handlePlanClick = (plan) => {
    if (plan.hotmartLink) {
      if (isAuthenticated) {
        window.location.href = plan.hotmartLink;
      } else {
        navigate(plan.ctaLink || '/auth?tab=cadastrar');
      }
      return;
    }

    if (plan.ctaLink?.startsWith('mailto')) {
      window.location.href = plan.ctaLink;
      return;
    }

    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate(plan.ctaLink || '/auth?tab=cadastrar');
    }
  };

  return (
    <>
      <div style={{
        background: 'linear-gradient(160deg, #dce8f5 0%, #e8f0f8 60%, #d6e5f2 100%)',
        padding: '64px 0 48px',
        textAlign: 'center',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div className="container">
          <span className="section-label">Nossos Planos</span>
          <h1 className="section-title" style={{ marginTop: 8 }}>Planos para Empresas</h1>
          <p className="section-desc">
            Embarcador escolha o plano ideal para o seu negócio
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <div className="plans-grid" style={{ maxWidth: 1200, margin: '0 auto', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {LISTA_PLANOS.map(plan => (
            <div
              key={plan.id}
              className={`plan-card${plan.featured ? ' featured' : ''}`}
              onClick={() => handlePlanClick(plan)}
              style={{ cursor: 'pointer' }}
            >
              {plan.badge && (
                <div className="plan-badge">{plan.badge}</div>
              )}
              <div className="plan-name">{plan.name}</div>
              <div className="plan-tagline">{plan.tagline}</div>
              <div className="plan-price">
                <span className="plan-currency">R$</span>
                {plan.amount !== null ? (
                  <>
                    <span className="plan-amount">{plan.amount}</span>
                    <span className="plan-period">{plan.period}</span>
                  </>
                ) : (
                  <span className="plan-amount" style={{ fontSize: '1.75rem' }}>Sob consulta</span>
                )}
              </div>
              <ul className="plan-features">
                {plan.features.map((f, i) => (
                  <li key={i} className="plan-feature">
                    <span className="plan-feature-check">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              {plan.hotmartLink && isAuthenticated ? (
                <a
                  href={plan.hotmartLink}
                  className={`btn ${plan.ctaStyle} btn-full btn-lg`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {plan.cta}
                </a>
              ) : plan.hotmartLink && !isAuthenticated ? (
                <Link
                  to={plan.ctaLink || '/auth?tab=cadastrar'}
                  className={`btn ${plan.ctaStyle} btn-full btn-lg`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {plan.cta}
                </Link>
              ) : plan.ctaLink?.startsWith('mailto') ? (
                <a
                  href={plan.ctaLink}
                  className={`btn ${plan.ctaStyle} btn-full btn-lg`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {plan.cta}
                </a>
              ) : (
                <Link
                  to={isAuthenticated ? '/dashboard' : (plan.ctaLink || '/auth?tab=cadastrar')}
                  className={`btn ${plan.ctaStyle} btn-full btn-lg`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {isAuthenticated ? 'Ir para o Painel' : plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>



        {/* FAQ de preços */}
        <div style={{ maxWidth: 640, margin: '56px auto 0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textAlign: 'center', color: 'var(--color-primary)', marginBottom: 24 }}>
            Dúvidas sobre os planos
          </h2>
          {[
            { q: 'Posso cancelar quando quiser?', a: 'Sim! Você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas.' },
            { q: 'O plano gratuito expira?', a: 'Não. O plano gratuito não expira. Você pode usá-lo por tempo indeterminado.' },
            { q: 'Aceita quais formas de pagamento?', a: 'Aceitamos cartão de crédito, boleto bancário e Pix.' },
          ].map((faq, i) => (
            <div key={i} style={{ padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
              <h4 style={{ fontWeight: 700, color: 'var(--color-primary)', marginBottom: 6 }}>{faq.q}</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

import { Link } from 'react-router-dom';

const PLANS = [
  {
    id: 'gratuito',
    name: 'Gratuito',
    tagline: 'Comece grátis',
    amount: '0',
    period: '/mês',
    featured: false,
    badge: null,
    features: [
      '3 cargas/mês',
      'Contato direto',
      'Suporte por email',
      'Perfil básico',
    ],
    cta: 'Começar',
    ctaLink: '/auth?tab=cadastrar',
    ctaStyle: 'btn-outline',
  },
  {
    id: 'profissional',
    name: 'Profissional',
    tagline: 'Para embarcadores ativos',
    amount: '99',
    period: '/mês',
    featured: true,
    badge: 'Mais popular',
    features: [
      'Cargas ilimitadas',
      'Destaque nas buscas',
      'Estatísticas detalhadas',
      'Suporte prioritário',
      'Relatórios mensais',
    ],
    cta: 'Assinar agora',
    ctaLink: '/auth?tab=cadastrar',
    ctaStyle: 'btn-accent',
  },
  {
    id: 'empresa',
    name: 'Empresa',
    tagline: 'Para grandes operações',
    amount: null,
    period: '',
    featured: false,
    badge: null,
    features: [
      'Tudo do Profissional',
      'Múltiplos usuários',
      'API de integração',
      'Gerente de conta',
      'SLA garantido',
    ],
    cta: 'Falar com vendas',
    ctaLink: 'mailto:vendas@freteamigo.com.br',
    ctaStyle: 'btn-outline',
  },
];

export default function Planos() {
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
          <h1 className="section-title" style={{ marginTop: 8 }}>Planos para todo perfil</h1>
          <p className="section-desc">
            Cadastrar-se e buscar cargas é sempre grátis. Embarcadores escolhem o plano ideal para publicar.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <div className="plans-grid">
          {PLANS.map(plan => (
            <div key={plan.id} className={`plan-card${plan.featured ? ' featured' : ''}`}>
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
              {plan.ctaLink.startsWith('mailto') ? (
                <a href={plan.ctaLink} className={`btn ${plan.ctaStyle} btn-full btn-lg`}>
                  {plan.cta}
                </a>
              ) : (
                <Link to={plan.ctaLink} className={`btn ${plan.ctaStyle} btn-full btn-lg`}>
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Nota */}
        <div style={{
          textAlign: 'center',
          marginTop: 48,
          padding: '28px 32px',
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--color-border)',
          maxWidth: 600,
          margin: '48px auto 0',
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: 10 }}>🚛</div>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 8 }}>
            Caminhoneiro? É sempre grátis!
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 20 }}>
            Caminhoneiros têm busca e cadastro 100% gratuitos, sem limite de pesquisas ou contatos.
          </p>
          <Link to="/buscar-cargas" className="btn btn-primary">
            Buscar cargas grátis
          </Link>
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

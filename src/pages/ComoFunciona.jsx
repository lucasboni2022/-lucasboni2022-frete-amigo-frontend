import { Link } from 'react-router-dom';

const STEPS_EMBARCADOR = [
  { n: 1, title: 'Cadastre-se grátis', desc: 'Crie sua conta em menos de 2 minutos. Sem burocracia.' },
  { n: 2, title: 'Publique sua carga', desc: 'Informe origem, destino, tipo de carga e valor do frete.' },
  { n: 3, title: 'Receba propostas', desc: 'Caminhoneiros entram em contato diretamente com você.' },
  { n: 4, title: 'Feche o negócio', desc: 'Negocie direto com o transportador. Sem taxas intermediárias.' },
];

const STEPS_CAMINHONEIRO = [
  { n: 1, title: 'Cadastre-se grátis', desc: 'Crie sua conta e configure seu perfil e tipo de veículo.' },
  { n: 2, title: 'Busque cargas', desc: 'Filtre por origem, destino e tipo de veículo para encontrar a carga ideal.' },
  { n: 3, title: 'Veja os detalhes', desc: 'Acesse informações completas da carga: rota, valor, contato.' },
  { n: 4, title: 'Feche o frete', desc: 'Entre em contato direto com o embarcador e feche o negócio.' },
];

const FAQS = [
  { q: 'É gratuito para caminhoneiros?', a: 'Sim! Caminhoneiros podem se cadastrar e buscar cargas completamente grátis, sem limites.' },
  { q: 'Quantas cargas posso publicar no plano gratuito?', a: 'No plano gratuito, embarcadores podem publicar até 3 cargas por mês. Para ilimitado, veja nossos planos.' },
  { q: 'Como funciona o contato?', a: 'Após o login, embarcadores e caminhoneiros se comunicam diretamente. Não há intermediação nossa.' },
  { q: 'Meus dados estão seguros?', a: 'Sim, utilizamos criptografia e as melhores práticas de segurança para proteger seus dados.' },
];

export default function ComoFunciona() {
  return (
    <>
      <div className="page-header" style={{ textAlign: 'center' }}>
        <div className="container">
          <h1 className="page-header-title" style={{ textAlign: 'center' }}>Como Funciona</h1>
          <p className="page-header-desc" style={{ textAlign: 'center' }}>
            Simples, rápido e sem taxas. Conectamos embarcadores a caminhoneiros em todo o Brasil.
          </p>
        </div>
      </div>

      {/* Para Embarcadores */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Para Embarcadores</span>
            <h2 className="section-title">Publique sua carga em 4 passos</h2>
            <p className="section-desc">Encontre o caminhoneiro ideal para sua rota em minutos.</p>
          </div>
          <div className="steps-grid">
            {STEPS_EMBARCADOR.map(step => (
              <div key={step.n} className="step-card">
                <div className="step-number">{step.n}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/publicar-carga" className="btn btn-accent btn-lg">
              Publicar carga agora →
            </Link>
          </div>
        </div>
      </section>

      {/* Divisor */}
      <div style={{ background: 'var(--color-bg-subtle)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ padding: '48px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span className="section-label">Para Caminhoneiros</span>
            <h2 className="section-title">Encontre fretes para sua rota</h2>
            <p className="section-desc">Busca gratuita e ilimitada. Sem taxa de cadastro.</p>
          </div>
          <div className="steps-grid">
            {STEPS_CAMINHONEIRO.map(step => (
              <div key={step.n} className="step-card">
                <div className="step-number">{step.n}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/buscar-cargas" className="btn btn-primary btn-lg">
              Buscar cargas agora →
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">Vantagens</span>
            <h2 className="section-title">Por que usar o FreteAmigo?</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {[
              { icon: '⚡', title: 'Rápido', desc: 'Publique uma carga em menos de 3 minutos.' },
              { icon: '🔒', title: 'Seguro', desc: 'Dados protegidos e comunicação direta entre as partes.' },
              { icon: '💰', title: 'Gratuito', desc: 'Caminhoneiros sempre grátis. Embarcadores têm plano gratuito.' },
              { icon: '🌎', title: 'Nacional', desc: 'Cobertura em todos os 27 estados do Brasil.' },
              { icon: '📱', title: 'Responsivo', desc: 'Funciona perfeitamente em qualquer dispositivo.' },
              { icon: '🤝', title: 'Direto', desc: 'Sem intermediários. Você negocia diretamente.' },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="section-header">
            <span className="section-label">Dúvidas Frequentes</span>
            <h2 className="section-title">Perguntas mais comuns</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map((faq, i) => (
              <div key={i} className="card" style={{ padding: '20px 24px' }}>
                <h3 style={{ fontSize: '0.9875rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 8 }}>
                  {faq.q}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.65 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

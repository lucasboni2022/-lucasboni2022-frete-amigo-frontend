import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2"/>
                <path d="M16 8h5l3 3v5h-8V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              FreteAmigo
            </div>
            <p className="footer-tagline">
              Conectamos embarcadores e caminhoneiros em todo o Brasil. A plataforma de fretes mais fácil e segura do país.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {/* Social icons placeholder */}
              {['facebook', 'instagram', 'linkedin'].map(s => (
                <div key={s} style={{
                  width: 32, height: 32,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* Para Caminhoneiros */}
          <div>
            <h4 className="footer-heading">Caminhoneiros</h4>
            <nav className="footer-links">
              <Link to="/buscar-cargas" className="footer-link">Buscar Cargas</Link>
              <Link to="/como-funciona" className="footer-link">Como Funciona</Link>
              <Link to="/auth?tab=cadastrar" className="footer-link">Cadastrar Grátis</Link>
              <Link to="/planos" className="footer-link">Planos</Link>
            </nav>
          </div>

          {/* Para Embarcadores */}
          <div>
            <h4 className="footer-heading">Embarcadores</h4>
            <nav className="footer-links">
              <Link to="/publicar-carga" className="footer-link">Publicar Carga</Link>
              <Link to="/planos" className="footer-link">Nossos Planos</Link>
              <Link to="/como-funciona" className="footer-link">Como Funciona</Link>
              <Link to="/auth?tab=cadastrar" className="footer-link">Criar Conta</Link>
            </nav>
          </div>

          {/* Suporte */}
          <div>
            <h4 className="footer-heading">Suporte</h4>
            <nav className="footer-links">
              <a href="mailto:contato@freteamigo.com.br" className="footer-link">Fale Conosco</a>
              <Link to="/como-funciona" className="footer-link">Dúvidas Frequentes</Link>
              <span className="footer-link" style={{ cursor: 'default' }}>Termos de Uso</span>
              <span className="footer-link" style={{ cursor: 'default' }}>Privacidade</span>
            </nav>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} FreteAmigo. Todos os direitos reservados.</span>
          <span>Feito com ❤️ para os caminhoneiros do Brasil 🇧🇷</span>
        </div>
      </div>
    </footer>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

const FEATURES = [
  {
    icon: '🔍',
    title: 'Busque cargas disponíveis',
    desc: 'Filtre por origem, destino e tipo de veículo. Encontre a carga ideal para sua rota em segundos.',
  },
  {
    icon: '📦',
    title: 'Publique sua carga',
    desc: 'Embarcadores publicam gratuitamente. Alcance milhares de caminhoneiros em todo o Brasil.',
  },
  {
    icon: '🤝',
    title: 'Conecte-se diretamente',
    desc: 'Sem intermediários. Caminhoneiro e embarcador negociam diretamente, com mais segurança.',
  },
  {
    icon: '⚡',
    title: 'Rápido e gratuito',
    desc: 'Cadastro em minutos. Busca de cargas 100% gratuita para caminhoneiros.',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState({ origem: '', destino: '', veiculo: '' });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search.origem) params.set('origem', search.origem);
    if (search.destino) params.set('destino', search.destino);
    if (search.veiculo) params.set('veiculo', search.veiculo);
    navigate(`/buscar-cargas?${params.toString()}`);
  };

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content animate-fade-in">
            <div className="hero-badge">
              <span>🇧🇷</span>
              Plataforma 100% brasileira
            </div>
            <h1 className="hero-title">
              Conectamos cargas a<br />
              <span>caminhoneiros</span><br />
              em todo o Brasil
            </h1>
            <p className="hero-subtitle">
              Embarcadores publicam cargas gratuitamente. Caminhoneiros encontram fretes para suas rotas de forma rápida e segura.
            </p>
            <div className="hero-ctas">
              <Link to="/auth?tab=cadastrar" className="btn btn-primary btn-lg">
                Sou caminhoneiro
              </Link>
              <Link to="/publicar-carga" className="btn btn-accent btn-lg">
                Publicar carga grátis →
              </Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-value">+5.000</span>
                <span className="hero-stat-label">Caminhoneiros</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">+1.200</span>
                <span className="hero-stat-label">Cargas publicadas</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">27</span>
                <span className="hero-stat-label">Estados cobertos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <div className="container" style={{ marginTop: '-32px', position: 'relative', zIndex: 10 }}>
        <SearchBar values={search} onChange={setSearch} onSearch={handleSearch} />
      </div>

      {/* Features */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">Por que usar o FreteAmigo</span>
            <h2 className="section-title">Simples, rápido e gratuito</h2>
            <p className="section-desc">
              A plataforma mais fácil de conectar quem tem carga com quem tem caminhão.
            </p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="feature-card animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{
        background: 'linear-gradient(135deg, var(--color-primary) 0%, #1a3550 100%)',
        padding: '64px 0',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: 'white', marginBottom: 14 }}>
            Pronto para começar?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.0625rem', marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
            Cadastre-se gratuitamente e acesse todas as cargas disponíveis no Brasil.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/auth?tab=cadastrar" className="btn btn-accent btn-lg">
              Criar conta grátis
            </Link>
            <Link to="/buscar-cargas" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '2px solid rgba(255,255,255,0.25)' }}>
              Ver cargas disponíveis
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

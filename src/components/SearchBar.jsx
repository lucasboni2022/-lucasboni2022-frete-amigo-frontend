import { Link } from 'react-router-dom';

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
];

const VEICULOS = [
  'Todos', 'Truck', 'Carreta', 'Bitrem', 'Vanderleia',
  'Romeu e Julieta', 'Utilitário', 'VUC',
];

export default function SearchBar({ values, onChange, onSearch, inline = false }) {
  const { origem = '', destino = '', veiculo = '' } = values || {};

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  return (
    <div className="search-card">
      <form onSubmit={handleSubmit}>
        <div className="search-grid">
          {/* Origem */}
          <div>
            <div className="search-field-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Origem (UF)
            </div>
            <select
              className="form-select"
              value={origem}
              onChange={e => onChange?.({ ...values, origem: e.target.value })}
            >
              <option value="">Todos os estados</option>
              {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>

          {/* Destino */}
          <div>
            <div className="search-field-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Destino (UF)
            </div>
            <select
              className="form-select"
              value={destino}
              onChange={e => onChange?.({ ...values, destino: e.target.value })}
            >
              <option value="">Todos os estados</option>
              {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>

          {/* Veículo */}
          <div>
            <div className="search-field-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" rx="2"/>
                <path d="M16 8h5l3 3v5h-8V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              Veículo
            </div>
            <select
              className="form-select"
              value={veiculo}
              onChange={e => onChange?.({ ...values, veiculo: e.target.value })}
            >
              {VEICULOS.map(v => <option key={v} value={v === 'Todos' ? '' : v}>{v}</option>)}
            </select>
          </div>

          {/* Button */}
          <div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', height: '48px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Buscar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export { ESTADOS, VEICULOS };

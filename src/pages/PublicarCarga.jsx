import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { cargasAPI } from '../api/cargas';
import { useAuth } from '../contexts/AuthContext';
import { ESTADOS, VEICULOS } from '../components/SearchBar';
import { getErrorMessage } from '../utils/errorHandler';
import { checkCargasLimit } from '../utils/planoLimits';
import ModalLimiteExcedido from '../components/ModalLimiteExcedido';

const TIPOS_CARGA = [
  'Eletrônicos', 'Alimentos', 'Bebidas', 'Madeira', 'Construção',
  'Móveis', 'Têxtil', 'Químicos', 'Veículos', 'Granel', 'Outros'
];

const TIPOS_CARROCERIA = [
  'Baú', 'Graneleira', 'Sider', 'Carga Seca', 'Frigorífico',
  'Tanque', 'Plataforma', 'Outros'
];

export default function PublicarCarga() {
  const { id } = useParams(); // edição
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;

  const [form, setForm] = useState({
    origem_cidade: '',
    origem_estado: '',
    destino_cidade: '',
    destino_estado: '',
    data_coleta: '',
    tipo_carga: '',
    peso_kg: '',
    valor_frete: '',
    tipo_veiculo: '',
    tipo_carroceria: '',
    observacoes: '',
    status: 'aguardando_motorista',
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  // Controle de limite de cargas por plano
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitData, setLimitData] = useState(null);

  // Verificação inicial do limite de cargas (para novas publicações)
  useEffect(() => {
    if (isEdit) return;
    const checkInitialLimit = async () => {
      try {
        const res = await cargasAPI.myCargas();
        const data = res.data;
        const list = Array.isArray(data) ? data : (data.cargas || data.data || data.items || []);
        const check = checkCargasLimit(list, user);
        setLimitData(check);
      } catch (err) {
        console.warn('Erro ao verificar limite inicial:', err);
      }
    };
    checkInitialLimit();
  }, [isEdit, user]);

  // Carregar carga para edição
  useEffect(() => {
    if (!isEdit) return;
    const fetch = async () => {
      try {
        const res = await cargasAPI.getById(id);
        const data = res.data?.carga || res.data?.data || res.data;
        setForm({
          origem_cidade: data.origem_cidade || '',
          origem_estado: data.origem_estado || '',
          destino_cidade: data.destino_cidade || '',
          destino_estado: data.destino_estado || '',
          data_coleta: data.data_coleta || '',
          tipo_carga: data.tipo_carga || '',
          peso_kg: data.peso_kg || '',
          valor_frete: data.valor_frete || '',
          tipo_veiculo: data.tipo_veiculo || '',
          tipo_carroceria: data.tipo_carroceria || '',
          observacoes: data.observacoes || '',
          status: data.status || 'aguardando_motorista',
        });
      } catch {
        setApiError('Não foi possível carregar os dados da carga.');
      } finally {
        setLoadingData(false);
      }
    };
    fetch();
  }, [id, isEdit]);

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.origem_cidade.trim()) e.origem_cidade = 'Informe a cidade de origem';
    if (!form.origem_estado) e.origem_estado = 'Selecione o estado de origem';
    if (!form.destino_cidade.trim()) e.destino_cidade = 'Informe a cidade de destino';
    if (!form.destino_estado) e.destino_estado = 'Selecione o estado de destino';
    if (!form.data_coleta) e.data_coleta = 'Informe a data de coleta';
    if (!form.tipo_carga) e.tipo_carga = 'Selecione o tipo de carga';
    if (!form.tipo_veiculo) e.tipo_veiculo = 'Selecione o tipo de veículo';
    if (form.valor_frete && isNaN(Number(form.valor_frete))) e.valor_frete = 'Valor inválido';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');

    // Se for criação de nova carga, valida o limite dos últimos 30 dias pelo plano
    if (!isEdit) {
      try {
        const res = await cargasAPI.myCargas();
        const data = res.data;
        const list = Array.isArray(data) ? data : (data.cargas || data.data || data.items || []);
        const check = checkCargasLimit(list, user);
        if (check.excedeu) {
          setLimitData(check);
          setShowLimitModal(true);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Erro ao validar limite de publicações:', err);
      }
    }

    try {
      const payload = {
        ...form,
        peso_kg: form.peso_kg ? Number(form.peso_kg) : undefined,
        valor_frete: form.valor_frete ? Number(form.valor_frete) : undefined,
      };
      if (isEdit) {
        await cargasAPI.update(id, payload);
      } else {
        await cargasAPI.create(payload);
      }
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setApiError(getErrorMessage(err, 'Erro ao salvar carga. Tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return (
    <div className="page-wrapper">
      <div className="loading-page"><div className="spinner spinner-dark" /><span>Carregando...</span></div>
    </div>
  );

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1 className="page-header-title">{isEdit ? 'Editar Carga' : 'Publicar Carga'}</h1>
          <p className="page-header-desc">
            {isEdit
              ? 'Atualize as informações da sua carga.'
              : 'Preencha os dados da carga para encontrar caminhoneiros.'}
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 64, maxWidth: 740 }}>
        {limitData && limitData.excedeu && !isEdit && (
          <div className="alert alert-error" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <strong>⚠️ Quantidade de cargas excedida para o plano atual ({limitData.planoInfo?.name})</strong>
              <div style={{ fontSize: '0.875rem', marginTop: 4 }}>
                Você já utilizou {limitData.totalUsado} de {limitData.limite} cargas permitidas nos últimos 30 dias. Aguarde {limitData.diasRestantes} {limitData.diasRestantes === 1 ? 'dia' : 'dias'} ou faça um upgrade do plano.
              </div>
            </div>
            <Link to="/planos" className="btn btn-sm btn-accent" style={{ textDecoration: 'none' }}>
              Fazer Upgrade
            </Link>
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{ marginBottom: 24 }}>
            ✅ Carga {isEdit ? 'atualizada' : 'publicada'} com sucesso! Redirecionando...
          </div>
        )}
        {apiError && (
          <div className="alert alert-error" style={{ marginBottom: 24 }}>{apiError}</div>
        )}

        <form onSubmit={handleSubmit} className="card">
          {/* Origem */}
          <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 18 }}>
            Origem
          </h3>
          <div className="form-row" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">Cidade de Origem *</label>
              <input
                className={`form-input${errors.origem_cidade ? ' error' : ''}`}
                placeholder="Ex: São Paulo"
                value={form.origem_cidade}
                onChange={e => handleChange('origem_cidade', e.target.value)}
              />
              {errors.origem_cidade && <span className="form-error">{errors.origem_cidade}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Estado *</label>
              <select
                className={`form-select${errors.origem_estado ? ' error' : ''}`}
                value={form.origem_estado}
                onChange={e => handleChange('origem_estado', e.target.value)}
              >
                <option value="">Selecione</option>
                {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
              {errors.origem_estado && <span className="form-error">{errors.origem_estado}</span>}
            </div>
          </div>

          <hr className="divider" />

          {/* Destino */}
          <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 18 }}>
            Destino
          </h3>
          <div className="form-row" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">Cidade de Destino *</label>
              <input
                className={`form-input${errors.destino_cidade ? ' error' : ''}`}
                placeholder="Ex: Rio de Janeiro"
                value={form.destino_cidade}
                onChange={e => handleChange('destino_cidade', e.target.value)}
              />
              {errors.destino_cidade && <span className="form-error">{errors.destino_cidade}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Estado *</label>
              <select
                className={`form-select${errors.destino_estado ? ' error' : ''}`}
                value={form.destino_estado}
                onChange={e => handleChange('destino_estado', e.target.value)}
              >
                <option value="">Selecione</option>
                {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
              {errors.destino_estado && <span className="form-error">{errors.destino_estado}</span>}
            </div>
          </div>

          <hr className="divider" />

          {/* Detalhes da Carga */}
          <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 18 }}>
            Detalhes da Carga
          </h3>
          <div className="form-row" style={{ marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Data de Coleta *</label>
              <input
                type="date"
                className={`form-input${errors.data_coleta ? ' error' : ''}`}
                value={form.data_coleta}
                onChange={e => handleChange('data_coleta', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.data_coleta && <span className="form-error">{errors.data_coleta}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Tipo de Carga *</label>
              <select
                className={`form-select${errors.tipo_carga ? ' error' : ''}`}
                value={form.tipo_carga}
                onChange={e => handleChange('tipo_carga', e.target.value)}
              >
                <option value="">Selecione</option>
                {TIPOS_CARGA.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.tipo_carga && <span className="form-error">{errors.tipo_carga}</span>}
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Peso (toneladas)</label>
              <input
                type="number"
                className="form-input"
                placeholder="Ex: 15"
                value={form.peso_kg}
                onChange={e => handleChange('peso_kg', e.target.value)}
                min="0"
                step="0.1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Valor do Frete (R$)</label>
              <input
                type="number"
                className={`form-input${errors.valor_frete ? ' error' : ''}`}
                placeholder="Ex: 1500"
                value={form.valor_frete}
                onChange={e => handleChange('valor_frete', e.target.value)}
                min="0"
              />
              {errors.valor_frete && <span className="form-error">{errors.valor_frete}</span>}
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">Tipo de Veículo *</label>
              <select
                className={`form-select${errors.tipo_veiculo ? ' error' : ''}`}
                value={form.tipo_veiculo}
                onChange={e => handleChange('tipo_veiculo', e.target.value)}
              >
                <option value="">Selecione</option>
                {VEICULOS.filter(v => v !== 'Todos').map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              {errors.tipo_veiculo && <span className="form-error">{errors.tipo_veiculo}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Tipo de Carroceria</label>
              <select
                className="form-select"
                value={form.tipo_carroceria}
                onChange={e => handleChange('tipo_carroceria', e.target.value)}
              >
                <option value="">Selecione</option>
                {TIPOS_CARROCERIA.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Observações</label>
            <textarea
              className="form-textarea"
              placeholder="Informações adicionais sobre a carga, cuidados especiais, etc."
              value={form.observacoes}
              onChange={e => handleChange('observacoes', e.target.value)}
              rows={4}
            />
          </div>

          {isEdit && (
            <>
              <hr className="divider" />
              <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 18 }}>
                Status da Carga
              </h3>
              <div className="form-group" style={{ marginBottom: 28, maxWidth: 360 }}>
                <label className="form-label">Status Atual</label>
                <select
                  className="form-select"
                  value={form.status || 'aguardando_motorista'}
                  onChange={e => handleChange('status', e.target.value)}
                >
                  <option value="aguardando_motorista">🟡 Aguardando Motorista</option>
                  <option value="finalizada">⚫ Finalizado</option>
                </select>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 4, display: 'block' }}>
                  Altere o status para controlar a visibilidade e o andamento do frete.
                </span>
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-accent btn-lg" disabled={loading}>
              {loading ? (
                <><div className="spinner" />{isEdit ? 'Salvando...' : 'Publicando...'}</>
              ) : (
                isEdit ? '💾 Salvar alterações' : '🚀 Publicar carga grátis'
              )}
            </button>
            <button type="button" className="btn btn-outline btn-lg" onClick={() => navigate(-1)}>
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <ModalLimiteExcedido
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        limitData={limitData}
      />
    </>
  );
}

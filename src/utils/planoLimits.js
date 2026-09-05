export const PLANOS = {
  gratuito: {
    id: 'gratuito',
    name: 'Gratuito',
    amount: '0',
    period: '/mês',
    limite: 3,
    limiteTexto: '3 cargas por mês',
    tagline: 'Comece grátis',
    featured: false,
    badge: null,
    features: [
      'Até 3 cargas por mês',
      'Contato direto com motoristas',
      'Suporte por email',
      'Painel de controle básico',
    ],
    cta: 'Começar grátis',
    ctaLink: '/auth?tab=cadastrar',
    ctaStyle: 'btn-outline',
  },
  profissional: {
    id: 'profissional',
    name: 'Profissional',
    amount: '197,00',
    period: '/mês',
    limite: 15,
    limiteTexto: '15 cargas por mês',
    tagline: 'Para pequenas e médias operações',
    featured: false,
    badge: null,
    features: [
      'Até 15 cargas por mês',
      'Destaque nas buscas de fretes',
      'Estatísticas de visualizações',
      'Suporte prioritário',
      'Relatórios mensais',
    ],
    cta: 'Assinar Profissional',
    ctaLink: '/auth?tab=cadastrar',
    ctaStyle: 'btn-primary',
  },
  premio: {
    id: 'premio',
    name: 'Prêmio',
    amount: '297,00',
    period: '/mês',
    limite: 30,
    limiteTexto: '30 cargas por mês',
    tagline: 'Para empresas em expansão',
    featured: true,
    badge: 'Mais popular',
    features: [
      'Até 30 cargas por mês',
      'Destaque máximo nas buscas',
      'Notificação prioritária para motoristas',
      'Suporte VIP via WhatsApp',
      'Gestão avançada de fretes',
    ],
    cta: 'Assinar Prêmio',
    ctaLink: '/auth?tab=cadastrar',
    ctaStyle: 'btn-accent',
  },
  ouro: {
    id: 'ouro',
    name: 'Ouro',
    amount: '1.297,00',
    period: '/mês',
    limite: Infinity,
    limiteTexto: 'Cargas ilimitadas',
    tagline: 'Para grandes transportadoras e indústrias',
    featured: false,
    badge: 'Ilimitado',
    features: [
      'Cargas ilimitadas',
      'Múltiplos operadores e usuários',
      'Gerente de conta dedicado',
      'API de integração de cargas',
      'SLA garantido de atendimento',
    ],
    cta: 'Assinar Ouro',
    ctaLink: '/auth?tab=cadastrar',
    ctaStyle: 'btn-primary',
  },
};

export const LISTA_PLANOS = Object.values(PLANOS);

/**
 * Obtém o ID do plano atual do usuário
 */
export function getUserPlanId(user) {
  if (!user) return 'gratuito';
  const rawPlan = user.plano || user.plano_atual || user.subscription?.plano || localStorage.getItem('frete_user_plano');
  if (!rawPlan) return 'gratuito';
  const clean = String(rawPlan).toLowerCase().trim();
  if (clean.includes('ouro')) return 'ouro';
  if (clean.includes('prem') || clean.includes('premium')) return 'premio';
  if (clean.includes('prof') || clean.includes('profissional')) return 'profissional';
  return 'gratuito';
}

/**
 * Analisa as cargas postadas nos últimos 30 dias em relação ao plano do usuário.
 * Retorna se excedeu, quantidades e quantos dias aguardar para voltar a publicar.
 */
export function checkCargasLimit(cargas = [], user = null) {
  const planId = getUserPlanId(user);
  const planoInfo = PLANOS[planId] || PLANOS.gratuito;
  const limite = planoInfo.limite;

  // Data atual - 30 dias
  const agora = Date.now();
  const trintaDiasAtrasMs = agora - 30 * 24 * 60 * 60 * 1000;

  // Filtra as cargas postadas dentro da janela dos últimos 30 dias
  const cargasNoPeriodo = [];

  for (const c of cargas) {
    const timeRef = c.criado_em || c.created_at || c.publicado_em || c.data_publicacao || c.data_coleta;
    if (!timeRef) continue;

    const dataObj = new Date(timeRef.includes('T') ? timeRef : timeRef + 'T00:00:00');
    const timeMs = dataObj.getTime();

    if (!isNaN(timeMs) && timeMs >= trintaDiasAtrasMs) {
      cargasNoPeriodo.push({
        ...c,
        _timestampMs: timeMs,
      });
    }
  }

  const totalUsado = cargasNoPeriodo.length;
  const excedeu = limite !== Infinity && totalUsado >= limite;

  let diasRestantes = 0;
  if (excedeu && cargasNoPeriodo.length > 0) {
    // Ordena da mais antiga para a mais recente
    cargasNoPeriodo.sort((a, b) => a._timestampMs - b._timestampMs);

    // A carga mais antiga dentro da janela liberará a vaga quando completar 30 dias
    const cargaMaisAntigaMs = cargasNoPeriodo[0]._timestampMs;
    const momentoLiberacaoMs = cargaMaisAntigaMs + 30 * 24 * 60 * 60 * 1000;
    const diferencaMs = momentoLiberacaoMs - agora;
    diasRestantes = Math.max(1, Math.ceil(diferencaMs / (1000 * 60 * 60 * 24)));
  }

  return {
    excedeu,
    planId,
    planoInfo,
    limite,
    totalUsado,
    diasRestantes,
  };
}

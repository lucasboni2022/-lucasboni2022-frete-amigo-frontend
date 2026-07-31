import api from './axios';

export const cargasAPI = {
  /**
   * GET /api/cargas
   * @param {{ origem_estado, destino_estado, tipo_veiculo, page, limit }} params
   */
  list: (params = {}) => api.get('/cargas', { params }),

  /**
   * GET /api/cargas/:id
   */
  getById: (id) => api.get(`/cargas/${id}`),

  /**
   * POST /api/cargas
   * @param {{ origem_cidade, origem_estado, destino_cidade, destino_estado,
   *           data_coleta, tipo_carga, peso_kg, valor_frete, tipo_veiculo,
   *           tipo_carroceria, observacoes }} data
   */
  create: (data) => api.post('/cargas', data),

  /**
   * PUT /api/cargas/:id
   */
  update: (id, data) => api.put(`/cargas/${id}`, data),

  /**
   * DELETE /api/cargas/:id
   */
  delete: (id) => api.delete(`/cargas/${id}`),

  /**
   * GET /api/cargas/my-cargas/list
   * @param {{ status, page, limit }} params
   */
  myCargas: (params = {}) => api.get('/cargas/my-cargas/list', { params }),

  /**
   * GET /api/cargas/:id/contato
   * Verifica plano ativo na Hotmart e retorna contato do embarcador.
   * Requer autenticação (JWT).
   * - 200: { contato_telefone, contato_email, embarcador_nome }
   * - 403 + plano_required: usuário sem plano ativo
   */
  getContato: (id) => api.get(`/cargas/${id}/contato`),
};

import api from './axios';

export const authAPI = {
  /**
   * POST /api/auth/register
   * @param {{ email, senha, nome_completo, telefone, tipo_perfil }} data
   */
  register: (data) => api.post('/auth/register', data),

  /**
   * POST /api/auth/login
   * @param {{ email, senha }} data
   * @returns {{ token: string, user: object }}
   */
  login: (data) => api.post('/auth/login', data),

  /**
   * GET /api/auth/profile
   */
  getProfile: () => api.get('/auth/profile'),

  /**
   * PUT /api/auth/profile
   * @param {{ nome_completo, telefone, empresa, cidade, estado }} data
   */
  updateProfile: (data) => api.put('/auth/profile', data),

  /**
   * POST /api/auth/forgot-password
   * @param {{ email: string }} data
   */
  forgotPassword: (data) => api.post('/auth/forgot-password', data),

  /**
   * POST /api/auth/reset-password
   * @param {{ token: string, nova_senha: string }} data
   */
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

/**
 * Extrai a mensagem de erro retornada pelo backend ou utiliza uma mensagem padrão.
 * Trata estruturas como:
 * - { message: "Erro ao processar solicitação", error: "Invalid login: 535 5.7.8 Error" } -> "Erro ao processar solicitação - Invalid login: 535 5.7.8 Error"
 * - { message: "E-mail é obrigatório" } -> "E-mail é obrigatório"
 * - { error: "E-mail é obrigatório" } -> "E-mail é obrigatório"
 * - { detail: "E-mail é obrigatório" } -> "E-mail é obrigatório"
 * - { errors: ["E-mail é obrigatório"] } -> "E-mail é obrigatório"
 * - "E-mail é obrigatório" (string pura)
 */
export function getErrorMessage(err, fallbackMessage = 'Ocorreu um erro. Tente novamente.') {
  if (!err) return fallbackMessage;

  if (err.response?.data) {
    const data = err.response.data;

    // Se a resposta for uma string simples
    if (typeof data === 'string' && data.trim()) {
      return data;
    }

    // Se for um objeto contendo propriedades de mensagem de erro
    if (typeof data === 'object' && data !== null) {
      const msg = (typeof data.message === 'string' && data.message.trim()) ? data.message.trim() : null;
      const detail = (typeof data.error === 'string' && data.error.trim()) ? data.error.trim()
                   : (typeof data.detail === 'string' && data.detail.trim()) ? data.detail.trim()
                   : (typeof data.details === 'string' && data.details.trim()) ? data.details.trim()
                   : null;

      if (msg && detail && msg !== detail) {
        return `${msg} - ${detail}`;
      }
      if (detail) return detail;
      if (msg) return msg;
      if (typeof data.msg === 'string' && data.msg.trim()) return data.msg.trim();

      // Se data.errors for um array
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        const first = data.errors[0];
        if (typeof first === 'string' && first.trim()) return first;
        if (first?.msg) return first.msg;
        if (first?.message) return first.message;
      }

      // Se data.errors for um objeto com mensagens por campo
      if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
        const values = Object.values(data.errors);
        if (values.length > 0) {
          const firstVal = values[0];
          if (typeof firstVal === 'string' && firstVal.trim()) return firstVal;
          if (Array.isArray(firstVal) && firstVal.length > 0) return firstVal[0];
        }
      }

      try {
        const jsonStr = JSON.stringify(data);
        if (jsonStr && jsonStr !== '{}') return jsonStr;
      } catch {
        // ignore
      }
    }
  }

  // Se houver err.message (mensagens do próprio JS/axios)
  if (typeof err.message === 'string' && err.message.trim() && !err.message.includes('Network Error')) {
    return err.message;
  }

  return fallbackMessage;
}

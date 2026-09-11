/**
 * Serviço de Chat e Mensageria do Frete Amigo
 * Suporta persistência local (localStorage), sincronização multi-abas em tempo real
 * (BroadcastChannel + storage event) e preparação para endpoints REST.
 */

const STORAGE_KEY = 'frete_amigo_chat_conversations';
const CHANNEL_NAME = 'frete_amigo_chat_channel';

// Cria canal broadcast se suportado pelo navegador
let broadcastChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  } catch (err) {
    console.warn('BroadcastChannel não disponível:', err);
  }
}

// Ouvintes locais
const listeners = new Set();

function notifyListeners(event) {
  listeners.forEach(fn => {
    try { fn(event); } catch (e) { console.error('Erro no ouvinte de chat:', e); }
  });
}

// Escuta mensagens entre abas
if (broadcastChannel) {
  broadcastChannel.onmessage = (e) => {
    notifyListeners(e.data);
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      notifyListeners({ type: 'STORAGE_UPDATE' });
    }
  });
}

function loadAllConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erro ao ler conversas do localStorage:', err);
    return [];
  }
}

function saveAllConversations(conversations) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (err) {
    console.error('Erro ao salvar conversas no localStorage:', err);
  }
}

export const chatService = {
  /**
   * Retorna todas as conversas em que o usuário participa (seja motorista ou embarcador)
   */
  getConversations(userId) {
    if (!userId) return [];
    const uid = String(userId);
    const all = loadAllConversations();
    return all
      .filter(c => String(c.motoristaId) === uid || String(c.embarcadorId) === uid)
      .sort((a, b) => new Date(b.lastMessageTime || b.createdAt) - new Date(a.lastMessageTime || a.createdAt));
  },

  /**
   * Retorna uma conversa específica por ID
   */
  getConversation(conversationId) {
    const all = loadAllConversations();
    return all.find(c => c.id === conversationId) || null;
  },

  /**
   * Obtém conversa existente ou cria uma nova vinculada à carga e aos participantes
   */
  getOrCreateConversation({ carga, motorista, embarcador }) {
    if (!carga || !motorista) return null;

    const cargaId = String(carga.id);
    const motoristaId = String(motorista.id);
    const embarcadorId = String(embarcador?.id || carga.usuario_id || carga.embarcador_id || 'embarcador_anuncio');

    const conversationId = `chat_${cargaId}_${motoristaId}`;
    const all = loadAllConversations();
    let existing = all.find(c => c.id === conversationId);

    if (existing) {
      return existing;
    }

    const motoristaNome = motorista.nome_completo || motorista.nome || 'Motorista';
    const embarcadorNome = embarcador?.nome_completo || embarcador?.nome || carga.embarcador_nome || carga.nome_embarcador || 'Embarcador';

    const newConv = {
      id: conversationId,
      cargaId: carga.id,
      cargaInfo: {
        id: carga.id,
        origem: `${carga.origem_cidade || ''}/${carga.origem_estado || ''}`,
        destino: `${carga.destino_cidade || ''}/${carga.destino_estado || ''}`,
        valor_frete: carga.valor_frete,
        tipo_carga: carga.tipo_carga,
        tipo_veiculo: carga.tipo_veiculo,
        peso_kg: carga.peso_kg,
        data_coleta: carga.data_coleta,
      },
      motoristaId,
      motoristaNome,
      embarcadorId,
      embarcadorNome,
      createdAt: new Date().toISOString(),
      lastMessage: 'Conversa iniciada',
      lastMessageTime: new Date().toISOString(),
      unreadCountMotorista: 0,
      unreadCountEmbarcador: 0,
      messages: [
        {
          id: `msg_init_${Date.now()}`,
          isSystem: true,
          text: `Conversa iniciada referente à carga ${carga.origem_cidade || ''}/${carga.origem_estado || ''} → ${carga.destino_cidade || ''}/${carga.destino_estado || ''}.`,
          timestamp: new Date().toISOString(),
        }
      ]
    };

    all.unshift(newConv);
    saveAllConversations(all);

    const event = { type: 'CONVERSATION_CREATED', conversationId };
    if (broadcastChannel) broadcastChannel.postMessage(event);
    notifyListeners(event);

    return newConv;
  },

  /**
   * Envia uma nova mensagem na conversa
   */
  sendMessage(conversationId, { senderId, senderName, senderRole, text }) {
    if (!conversationId || !text?.trim()) return null;

    const all = loadAllConversations();
    const idx = all.findIndex(c => c.id === conversationId);
    if (idx === -1) return null;

    const conv = all[idx];
    const now = new Date().toISOString();
    const cleanText = text.trim();

    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      senderId: String(senderId),
      senderName: senderName || 'Usuário',
      senderRole: senderRole || 'motorista',
      text: cleanText,
      timestamp: now,
      read: false,
    };

    conv.messages = conv.messages || [];
    conv.messages.push(newMessage);
    conv.lastMessage = cleanText;
    conv.lastMessageTime = now;

    // Atualiza contador de não lidas para o destinatário
    if (String(senderId) === String(conv.motoristaId)) {
      conv.unreadCountEmbarcador = (conv.unreadCountEmbarcador || 0) + 1;
    } else {
      conv.unreadCountMotorista = (conv.unreadCountMotorista || 0) + 1;
    }

    // Move a conversa para o topo da lista
    all.splice(idx, 1);
    all.unshift(conv);

    saveAllConversations(all);

    const event = { type: 'NEW_MESSAGE', conversationId, message: newMessage };
    if (broadcastChannel) broadcastChannel.postMessage(event);
    notifyListeners(event);

    return newMessage;
  },

  /**
   * Marca as mensagens da conversa como lidas para o usuário atual
   */
  markAsRead(conversationId, userId) {
    if (!conversationId || !userId) return;
    const uid = String(userId);
    const all = loadAllConversations();
    const conv = all.find(c => c.id === conversationId);
    if (!conv) return;

    let changed = false;

    if (uid === String(conv.motoristaId) && conv.unreadCountMotorista > 0) {
      conv.unreadCountMotorista = 0;
      changed = true;
    } else if (uid === String(conv.embarcadorId) && conv.unreadCountEmbarcador > 0) {
      conv.unreadCountEmbarcador = 0;
      changed = true;
    }

    if (conv.messages) {
      conv.messages.forEach(m => {
        if (m.senderId && String(m.senderId) !== uid && !m.read) {
          m.read = true;
          changed = true;
        }
      });
    }

    if (changed) {
      saveAllConversations(all);
      const event = { type: 'MESSAGES_READ', conversationId, userId };
      if (broadcastChannel) broadcastChannel.postMessage(event);
      notifyListeners(event);
    }
  },

  /**
   * Total de mensagens não lidas para o usuário logado
   */
  getUnreadCount(userId) {
    if (!userId) return 0;
    const uid = String(userId);
    const all = loadAllConversations();
    let total = 0;
    for (const conv of all) {
      if (uid === String(conv.motoristaId)) {
        total += (conv.unreadCountMotorista || 0);
      } else if (uid === String(conv.embarcadorId)) {
        total += (conv.unreadCountEmbarcador || 0);
      }
    }
    return total;
  },

  /**
   * Assina eventos de atualização de mensagens e conversas
   */
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};

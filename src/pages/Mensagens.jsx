import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { chatService } from '../services/chatService';

function formatTime(isoStr) {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  } catch {
    return '';
  }
}

function formatCurrency(val) {
  if (!val && val !== 0) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

export default function Mensagens() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialChatId = searchParams.get('chatId');

  const [conversations, setConversations] = useState([]);
  const [activeChatId, setActiveChatId] = useState(initialChatId || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [input, setInput] = useState('');
  const [showMobileList, setShowMobileList] = useState(!initialChatId);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const loadConversations = () => {
    if (!user) return;
    const list = chatService.getConversations(user.id);
    setConversations(list);

    if (!activeChatId && list.length > 0 && !initialChatId) {
      setActiveChatId(list[0].id);
    } else if (initialChatId && list.some(c => c.id === initialChatId)) {
      setActiveChatId(initialChatId);
    }
  };

  useEffect(() => {
    loadConversations();
    const unsubscribe = chatService.subscribe(() => {
      loadConversations();
    });
    return () => unsubscribe();
  }, [user]);

  const activeConv = conversations.find(c => c.id === activeChatId) || null;

  useEffect(() => {
    if (activeChatId && user) {
      chatService.markAsRead(activeChatId, user.id);
      setShowMobileList(false);
      setSearchParams({ chatId: activeChatId });
    }
  }, [activeChatId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
    setShowMobileList(false);
    if (user) {
      chatService.markAsRead(chatId, user.id);
    }
  };

  const handleSend = (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || !activeConv || !user) return;

    const role = user.tipo_perfil === 'embarcador' ? 'embarcador' : 'motorista';
    chatService.sendMessage(activeConv.id, {
      senderId: user.id,
      senderName: user.nome_completo || user.nome || 'Usuário',
      senderRole: role,
      text,
    });

    setInput('');
    loadConversations();
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getOtherParticipant = (conv) => {
    const isMeMotorista = String(user?.id) === String(conv.motoristaId);
    return {
      name: isMeMotorista ? conv.embarcadorNome : conv.motoristaNome,
      role: isMeMotorista ? 'Embarcador' : 'Motorista',
      unread: isMeMotorista ? (conv.unreadCountMotorista || 0) : (conv.unreadCountEmbarcador || 0),
    };
  };

  const filteredConversations = conversations.filter(conv => {
    const other = getOtherParticipant(conv);
    const term = searchTerm.toLowerCase();
    const matchName = other.name?.toLowerCase().includes(term);
    const matchOrigem = conv.cargaInfo?.origem?.toLowerCase().includes(term);
    const matchDestino = conv.cargaInfo?.destino?.toLowerCase().includes(term);
    return matchName || matchOrigem || matchDestino;
  });

  const getInitials = (n) => (n ? n.split(' ').slice(0, 2).map(x => x[0]).join('').toUpperCase() : 'U');

  return (
    <div className="mensagens-page-container">
      <div className="container" style={{ paddingBottom: 40 }}>
        <div className="mensagens-layout-card card">
          {/* Coluna Esquerda: Lista de Conversas */}
          <div className={`mensagens-sidebar ${!showMobileList ? 'hide-mobile' : ''}`}>
            <div className="mensagens-sidebar-header">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>💬</span> Mensagens
                </h2>
                <span className="badge badge-active" style={{ fontSize: '0.75rem' }}>
                  {conversations.length} {conversations.length === 1 ? 'conversa' : 'conversas'}
                </span>
              </div>
              <div className="mensagens-search-wrapper">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="text"
                  className="mensagens-search-input"
                  placeholder="Buscar conversa ou rota..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="mensagens-list">
              {filteredConversations.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>📭</div>
                  <p style={{ fontWeight: 600, marginBottom: 4 }}>Nenhuma conversa encontrada</p>
                  <p style={{ fontSize: '0.8125rem' }}>
                    {conversations.length === 0
                      ? 'Inicie conversas nas cargas disponíveis para falar com embarcadores.'
                      : 'Tente outro termo de busca.'}
                  </p>
                  {conversations.length === 0 && (
                    <Link to="/buscar-cargas" className="btn btn-sm btn-primary" style={{ marginTop: 12 }}>
                      Buscar Cargas
                    </Link>
                  )}
                </div>
              ) : (
                filteredConversations.map(conv => {
                  const other = getOtherParticipant(conv);
                  const isSelected = conv.id === activeChatId;

                  return (
                    <div
                      key={conv.id}
                      className={`mensagens-item ${isSelected ? 'active' : ''}`}
                      onClick={() => handleSelectChat(conv.id)}
                    >
                      <div className="mensagens-item-avatar">
                        {getInitials(other.name)}
                        <span className="chat-status-dot" />
                      </div>
                      <div className="mensagens-item-body">
                        <div className="mensagens-item-header">
                          <strong className="mensagens-item-name">{other.name}</strong>
                          <span className="mensagens-item-time">{formatTime(conv.lastMessageTime)}</span>
                        </div>
                        <div className="mensagens-item-route">
                          📍 {conv.cargaInfo?.origem} → {conv.cargaInfo?.destino}
                        </div>
                        <div className="mensagens-item-preview-row">
                          <span className="mensagens-item-preview">{conv.lastMessage || 'Conversa iniciada'}</span>
                          {other.unread > 0 && (
                            <span className="mensagens-unread-badge">{other.unread}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Coluna Direita: Janela da Conversa Ativa */}
          <div className={`mensagens-chat-panel ${showMobileList ? 'hide-mobile' : ''}`}>
            {activeConv ? (
              <>
                {/* Header do Chat */}
                <div className="mensagens-chat-header">
                  <button
                    className="btn btn-sm btn-outline show-mobile-back"
                    onClick={() => setShowMobileList(true)}
                    style={{ marginRight: 8, padding: '4px 8px' }}
                    title="Voltar à lista"
                  >
                    ←
                  </button>

                  {(() => {
                    const other = getOtherParticipant(activeConv);
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                        <div className="chat-widget-avatar">
                          {getInitials(other.name)}
                          <span className="chat-status-dot" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {other.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="badge badge-active" style={{ fontSize: '0.6875rem', padding: '1px 6px' }}>{other.role}</span>
                            <span>• Online no Frete Amigo</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {activeConv.cargaId && (
                    <Link
                      to={`/cargas/${activeConv.cargaId}`}
                      className="btn btn-sm btn-outline"
                      style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <span>📦</span> Ver Carga
                    </Link>
                  )}
                </div>

                {/* Banner de Resumo da Carga */}
                {activeConv.cargaInfo && (
                  <div className="mensagens-carga-strip">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                        {activeConv.cargaInfo.origem} → {activeConv.cargaInfo.destino}
                      </span>
                      {activeConv.cargaInfo.tipo_carga && (
                        <span className="badge badge-pending" style={{ fontSize: '0.75rem' }}>
                          {activeConv.cargaInfo.tipo_carga}
                        </span>
                      )}
                      {activeConv.cargaInfo.tipo_veiculo && (
                        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                          • {activeConv.cargaInfo.tipo_veiculo}
                        </span>
                      )}
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.1rem' }}>
                      {formatCurrency(activeConv.cargaInfo.valor_frete)}
                    </div>
                  </div>
                )}

                {/* Lista de Mensagens */}
                <div className="mensagens-messages-area">
                  {activeConv.messages?.map((msg) => {
                    if (msg.isSystem) {
                      return (
                        <div key={msg.id} className="chat-message-system">
                          <span>{msg.text}</span>
                        </div>
                      );
                    }

                    const isMe = String(msg.senderId) === String(user?.id);

                    return (
                      <div
                        key={msg.id}
                        className={`chat-message-bubble-wrapper ${isMe ? 'outgoing' : 'incoming'}`}
                      >
                        <div className={`chat-message-bubble ${isMe ? 'outgoing' : 'incoming'}`}>
                          <div className="chat-message-sender-name">
                            {isMe ? 'Você' : msg.senderName}
                          </div>
                          <div className="chat-message-text">{msg.text}</div>
                          <div className="chat-message-meta">
                            <span className="chat-message-time">{formatTime(msg.timestamp)}</span>
                            {isMe && (
                              <span className="chat-message-check" title={msg.read ? 'Lida' : 'Enviada'}>
                                {msg.read ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Caixa de Digitação */}
                <div className="mensagens-chat-input-row">
                  <textarea
                    ref={inputRef}
                    className="mensagens-input"
                    rows={1}
                    placeholder="Digite sua mensagem aqui... (Enter para enviar)"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    className="btn btn-primary"
                    style={{ padding: '0 20px', height: 44, borderRadius: 'var(--radius)' }}
                    onClick={() => handleSend()}
                    disabled={!input.trim()}
                  >
                    Enviar ✈️
                  </button>
                </div>
              </>
            ) : (
              <div className="mensagens-empty-state">
                <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>💬</div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: 8, color: 'var(--color-primary)' }}>
                  Selecione uma conversa
                </h3>
                <p style={{ color: 'var(--color-text-muted)', maxWidth: 400, margin: '0 auto', fontSize: '0.9375rem' }}>
                  Converse diretamente com motoristas e embarcadores com rapidez e segurança através do Frete Amigo.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

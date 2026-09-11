import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { chatService } from '../services/chatService';

function formatTime(isoStr) {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatCurrency(val) {
  if (!val && val !== 0) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

export default function ChatWidget({ carga, embarcador, isOpen, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [minimized, setMinimized] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const QUICK_CHIPS = [
    'Olá! A carga ainda está disponível?',
    'Qual o valor mínimo que você faz no frete?',
    'Consigo realizar a coleta na data prevista!',
    'Qual o local exato para carregamento?'
  ];

  // Carrega ou inicializa a conversa quando o widget abre
  useEffect(() => {
    if (!isOpen || !carga || !user) return;

    const conv = chatService.getOrCreateConversation({
      carga,
      motorista: user,
      embarcador: {
        id: embarcador?.id || carga.usuario_id || carga.embarcador_id,
        nome: embarcador?.nome || embarcador?.embarcador_nome || carga.embarcador_nome || carga.nome_embarcador,
      }
    });

    setConversation(conv);
    if (conv) {
      chatService.markAsRead(conv.id, user.id);
    }

    const unsubscribe = chatService.subscribe((event) => {
      if (conv && (event.conversationId === conv.id || event.type === 'STORAGE_UPDATE')) {
        const updated = chatService.getConversation(conv.id);
        if (updated) {
          setConversation(updated);
          chatService.markAsRead(conv.id, user.id);
        }
      }
    });

    return () => unsubscribe();
  }, [isOpen, carga, embarcador, user]);

  // Rola para a mensagem mais recente
  useEffect(() => {
    if (!minimized && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages, minimized, isOpen]);

  if (!isOpen || !carga || !user) return null;

  const handleSend = (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || !conversation) return;

    const role = user.tipo_perfil === 'embarcador' ? 'embarcador' : 'motorista';
    chatService.sendMessage(conversation.id, {
      senderId: user.id,
      senderName: user.nome_completo || user.nome || 'Motorista',
      senderRole: role,
      text,
    });

    const updated = chatService.getConversation(conversation.id);
    setConversation(updated);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const embarcadorNome = embarcador?.nome || embarcador?.embarcador_nome || carga.embarcador_nome || carga.nome_embarcador || 'Embarcador';
  const getInitials = (n) => (n ? n.split(' ').slice(0, 2).map(x => x[0]).join('').toUpperCase() : 'E');

  if (minimized) {
    return (
      <div className="chat-widget-minimized" onClick={() => setMinimized(false)}>
        <div className="chat-widget-min-avatar">💬</div>
        <div className="chat-widget-min-text">
          <strong>Chat: {embarcadorNome}</strong>
          <span>{carga.origem_cidade} → {carga.destino_cidade}</span>
        </div>
        <button className="chat-widget-btn-restore" title="Restaurar chat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
        </button>
      </div>
    );
  }

  return (
    <div className="chat-widget-container">
      {/* Header */}
      <div className="chat-widget-header">
        <div className="chat-widget-header-user">
          <div className="chat-widget-avatar">
            {getInitials(embarcadorNome)}
            <span className="chat-status-dot" title="Online no Frete Amigo" />
          </div>
          <div className="chat-widget-title-box">
            <div className="chat-widget-title" title={embarcadorNome}>{embarcadorNome}</div>
            <div className="chat-widget-subtitle">
              <span className="online-indicator-text">Online</span> • Embarcador
            </div>
          </div>
        </div>

        <div className="chat-widget-actions">
          <button
            className="chat-widget-btn-icon"
            onClick={() => navigate(`/mensagens?chatId=${conversation?.id}`)}
            title="Abrir em tela cheia"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          </button>
          <button
            className="chat-widget-btn-icon"
            onClick={() => setMinimized(true)}
            title="Minimizar conversa"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button
            className="chat-widget-btn-icon"
            onClick={onClose}
            title="Fechar conversa"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      {/* Carga Summary Banner */}
      <div className="chat-widget-carga-banner">
        <div className="chat-widget-carga-info">
          <div className="chat-widget-carga-route">
            <strong>{carga.origem_cidade}/{carga.origem_estado}</strong>
            <span style={{ color: 'var(--color-accent)' }}>→</span>
            <strong>{carga.destino_cidade}/{carga.destino_estado}</strong>
          </div>
          <div className="chat-widget-carga-meta">
            {carga.tipo_carga && <span>{carga.tipo_carga}</span>}
            {carga.tipo_veiculo && <span>• {carga.tipo_veiculo}</span>}
          </div>
        </div>
        <div className="chat-widget-carga-price">
          {formatCurrency(carga.valor_frete)}
        </div>
      </div>

      {/* Messages List */}
      <div className="chat-widget-messages">
        {conversation?.messages?.map((msg) => {
          if (msg.isSystem) {
            return (
              <div key={msg.id} className="chat-message-system">
                <span>{msg.text}</span>
              </div>
            );
          }

          const isMe = String(msg.senderId) === String(user.id);

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

      {/* Quick suggestions chips */}
      {conversation?.messages?.filter(m => !m.isSystem).length === 0 && (
        <div className="chat-widget-chips">
          <div className="chat-chips-label">Perguntas rápidas:</div>
          <div className="chat-chips-list">
            {QUICK_CHIPS.map((chip, i) => (
              <button
                key={i}
                className="chat-chip-btn"
                onClick={() => handleSend(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="chat-widget-input-area">
        <textarea
          ref={textareaRef}
          className="chat-widget-input"
          placeholder="Digite sua mensagem para o embarcador..."
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="chat-widget-send-btn"
          onClick={() => handleSend()}
          disabled={!input.trim()}
          title="Enviar mensagem (Enter)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

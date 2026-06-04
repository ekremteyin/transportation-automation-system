import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getConversations, getMessages, sendMessage, markRead
} from '../../api/messageApi';

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return 'az önce';
  if (diff < 3600)  return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
  return new Date(dateStr).toLocaleDateString('tr-TR');
}

function ConversationItem({ conv, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition
        ${selected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold text-slate-800' : 'text-slate-700'}`}>
            {conv.otherPartyName}
          </p>
          <p className="text-xs text-slate-400 truncate mt-0.5">{conv.route}</p>
          {conv.lastMessage && (
            <p className="text-xs text-slate-500 truncate mt-0.5">{conv.lastMessage}</p>
          )}
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          {conv.lastMessageAt && (
            <span className="text-[10px] text-slate-400">{timeAgo(conv.lastMessageAt)}</span>
          )}
          {conv.unreadCount > 0 && (
            <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function MessageBubble({ msg }) {
  return (
    <div className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
        ${msg.isMine
          ? 'bg-blue-600 text-white rounded-br-sm'
          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'}`}
      >
        {!msg.isMine && (
          <p className="text-xs font-semibold mb-1 text-blue-600">{msg.senderName}</p>
        )}
        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
        <p className={`text-[10px] mt-1 text-right ${msg.isMine ? 'text-blue-200' : 'text-slate-400'}`}>
          {new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const selectedConv = conversations.find(c => c.offerId === selectedOfferId);

  // Konuşma listesini yükle
  useEffect(() => {
    getConversations().then(r => setConversations(r.data)).catch(() => {});
  }, []);

  // Seçili konuşmanın mesajlarını yükle
  useEffect(() => {
    if (!selectedOfferId) return;
    setLoadingMsgs(true);
    getMessages(selectedOfferId)
      .then(r => {
        setMessages(r.data);
        markRead(selectedOfferId).catch(() => {});
        setConversations(prev =>
          prev.map(c => c.offerId === selectedOfferId ? { ...c, unreadCount: 0 } : c)
        );
      })
      .finally(() => setLoadingMsgs(false));
  }, [selectedOfferId]);

  // En alta scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConv = (offerId) => {
    setSelectedOfferId(offerId);
    setMessages([]);
    setText('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !selectedOfferId || sending) return;
    setSending(true);
    try {
      const res = await sendMessage({ offerId: selectedOfferId, content: trimmed });
      setMessages(prev => [...prev, res.data]);
      setText('');
      setConversations(prev =>
        prev.map(c =>
          c.offerId === selectedOfferId
            ? { ...c, lastMessage: trimmed, lastMessageAt: new Date().toISOString() }
            : c
        )
      );
    } catch {
      // hata sessizce yutulur
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Sol: Konuşma Listesi */}
      <div className="w-72 shrink-0 border-r border-slate-200 bg-white flex flex-col">
        <div className="px-4 py-3 border-b border-slate-100">
          <h2 className="font-semibold text-slate-700">Mesajlar</h2>
        </div>
        <div className="overflow-y-auto flex-1">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">
              <p className="text-2xl mb-2">💬</p>
              Henüz konuşma yok.
            </div>
          ) : (
            conversations.map(c => (
              <ConversationItem
                key={c.offerId}
                conv={c}
                selected={c.offerId === selectedOfferId}
                onClick={() => handleSelectConv(c.offerId)}
              />
            ))
          )}
        </div>
      </div>

      {/* Sağ: Mesaj Geçmişi */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {!selectedOfferId ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-sm">Bir konuşma seçin</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-5 py-3">
              <p className="font-semibold text-slate-800 text-sm">
                {selectedConv?.otherPartyName}
              </p>
              <p className="text-xs text-slate-400">{selectedConv?.route}</p>
            </div>

            {/* Mesajlar */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {loadingMsgs ? (
                <div className="text-center text-slate-400 text-sm pt-10">Yükleniyor...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-slate-400 text-sm pt-10">
                  Henüz mesaj yok. İlk mesajı siz gönderin!
                </div>
              ) : (
                <>
                  {messages.map(m => <MessageBubble key={m.id} msg={m} />)}
                  <div ref={bottomRef} />
                </>
              )}
            </div>

            {/* Gönderme Alanı */}
            <div className="bg-white border-t border-slate-200 px-4 py-3 flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Mesaj yazın... (Enter ile gönder)"
                rows={1}
                className="flex-1 resize-none border border-slate-300 rounded-xl px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-28 overflow-y-auto"
                style={{ lineHeight: '1.5' }}
              />
              <button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium
                  hover:bg-blue-700 disabled:opacity-50 transition shrink-0"
              >
                {sending ? '...' : 'Gönder'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

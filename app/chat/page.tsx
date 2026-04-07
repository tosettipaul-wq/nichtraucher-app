'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function ChatPage() {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);
      setMessages([{
        id: '0',
        role: 'assistant',
        content: 'Hallo! 👋 Ich bin dein Quitter-Buddy — dein persönlicher KI-Coach. Ich bin hier um dir zu helfen, rauchfrei zu bleiben. Was kann ich für dich tun?',
        timestamp: new Date().toISOString(),
      }]);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history: messages }),
      });

      const data = await response.json();

      if (data.error) {
        setMessages((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `❌ Fehler: ${data.error}`,
          timestamp: new Date().toISOString(),
        }]);
      } else {
        setMessages((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Verbindungsfehler. Bitte später versuchen.',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl shrink-0">
        <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1.5"
          >
            ← Zurück
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-lg shadow-lg shadow-teal-500/20">
              🤖
            </div>
            <div>
              <p className="font-bold text-white text-sm">Quitter-Buddy</p>
              <p className="text-emerald-400 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                KI-Coach aktiv
              </p>
            </div>
          </div>
        </div>
      </nav>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl mx-auto w-full">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/20'
                  : 'bg-slate-700 border border-slate-600'
              }`}>
                {msg.role === 'assistant' ? '🤖' : '👤'}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-teal-500 text-slate-950 font-medium rounded-tr-sm'
                    : 'bg-slate-800/80 text-slate-100 border border-slate-700/60 rounded-tl-sm'
                }`}
              >
                <p>{msg.content}</p>
                <p className={`text-xs mt-1.5 opacity-60`}>
                  {new Date(msg.timestamp).toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {sending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-sm shrink-0">
                🤖
              </div>
              <div className="bg-slate-800/80 border border-slate-700/60 px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-xl px-4 py-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Schreib eine Nachricht..."
              disabled={sending}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 text-sm"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="px-5 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-teal-500/20 text-sm"
            >
              {sending ? '...' : '↑'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

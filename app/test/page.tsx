'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('hero');
  const [streakDays, setStreakDays] = useState(23);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'buddy', text: 'Hey! 👋 Wie geht es dir heute? Tag 23 – du bist ein Held!' },
    { role: 'user', text: 'Hatte kurz ein Verlangen, aber es ist vorbei.' },
    { role: 'buddy', text: '💪 Stark! Verlangen dauert maximal 3 Minuten. Du hast es überstanden!' },
  ]);

  const bg = darkMode ? 'bg-slate-950' : 'bg-gray-50';
  const card = darkMode ? 'bg-slate-900/80 border-slate-700/60' : 'bg-white border-gray-200';
  const text = darkMode ? 'text-white' : 'text-slate-900';
  const muted = darkMode ? 'text-slate-400' : 'text-gray-500';
  const subtle = darkMode ? 'bg-slate-800/60' : 'bg-gray-100';

  const stats = [
    { label: 'Rauchfreie Tage', value: '23', icon: '🏆', color: 'text-teal-400' },
    { label: 'Nicht geraucht', value: '460', sub: 'Zigaretten', icon: '🚭', color: 'text-green-400' },
    { label: 'Erspart', value: '184€', icon: '💰', color: 'text-yellow-400' },
    { label: 'Gewonnene Zeit', value: '38h', icon: '⏰', color: 'text-purple-400' },
  ];

  const features = [
    {
      icon: '🤖',
      title: 'KI-Coach Buddy',
      desc: 'Persönlicher Coach, der deinen Fortschritt kennt und bei Cravings sofort hilft.',
      color: 'from-teal-500/20 to-cyan-500/20 border-teal-500/30',
    },
    {
      icon: '📊',
      title: 'Gesundheits-Timeline',
      desc: 'Sieh in Echtzeit, wie sich dein Körper erholt – von Minuten bis zu Jahren.',
      color: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    },
    {
      icon: '🎮',
      title: 'Gamification',
      desc: 'Verdiene Badges, erklimme die Bestenliste, und feiere jeden Meilenstein.',
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    },
    {
      icon: '🔥',
      title: 'Craving-Manager',
      desc: 'Sofortige Techniken für den Moment, wenn das Verlangen kommt.',
      color: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
    },
    {
      icon: '👥',
      title: 'Community',
      desc: 'Finde andere auf derselben Reise. Gegenseitige Unterstützung, die wirkt.',
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30',
    },
    {
      icon: '📱',
      title: 'Offline-First',
      desc: 'Funktioniert immer – auch ohne Internet. Deine Daten, dein Gerät.',
      color: 'from-rose-500/20 to-pink-500/20 border-rose-500/30',
    },
  ];

  const timeline = [
    { time: '20 Min', desc: 'Herzfrequenz und Blutdruck normalisieren sich', done: true },
    { time: '12 Std', desc: 'CO-Spiegel im Blut normalisiert sich', done: true },
    { time: '2 Wo', desc: 'Blutkreislauf verbessert sich merklich', done: true },
    { time: '1 Monat', desc: 'Lungenkapazität erhöht sich um 30%', done: false },
    { time: '1 Jahr', desc: 'Herzinfarktrisiko halbiert sich', done: false },
    { time: '10 Jahre', desc: 'Lungenkrebsrisiko wie ein Nichtraucher', done: false },
  ];

  const badges = [
    { name: '1 Tag', icon: '⭐', earned: true },
    { name: '1 Woche', icon: '🥉', earned: true },
    { name: '2 Wochen', icon: '🥈', earned: true },
    { name: '1 Monat', icon: '🥇', earned: false },
    { name: '3 Monate', icon: '💎', earned: false },
    { name: '1 Jahr', icon: '👑', earned: false },
  ];

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const newMessages = [...chatMessages, { role: 'user', text: chatInput }];
    setChatMessages(newMessages);
    setChatInput('');
    setTimeout(() => {
      setChatMessages([
        ...newMessages,
        { role: 'buddy', text: 'Ich bin für dich da! 💙 Du machst das großartig – bleib stark.' },
      ]);
    }, 800);
  };

  const tabs = [
    { id: 'hero', label: '🏠 Hero' },
    { id: 'stats', label: '📊 Stats' },
    { id: 'features', label: '✨ Features' },
    { id: 'chat', label: '💬 KI-Coach' },
    { id: 'timeline', label: '🕐 Timeline' },
    { id: 'gamification', label: '🎮 Gamification' },
  ];

  return (
    <div className={`min-h-screen ${bg} ${text} transition-all duration-300 font-sans`}>
      {/* Header */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-xl border-b ${
          darkMode ? 'border-slate-800/80 bg-slate-950/90' : 'border-gray-200/80 bg-white/90'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-lg shadow-lg shadow-teal-500/25">
              🚭
            </div>
            <div>
              <span className="font-bold text-base tracking-tight">Nichtraucher</span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400 font-medium border border-teal-500/25">
                Test Demo
              </span>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl transition-all ${
              darkMode
                ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400'
                : 'bg-gray-100 hover:bg-gray-200 text-slate-700'
            }`}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div
        className={`sticky top-[57px] z-40 border-b ${
          darkMode ? 'border-slate-800/80 bg-slate-950/90' : 'border-gray-200/80 bg-white/90'
        } backdrop-blur-xl`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 overflow-x-auto">
          <div className="flex gap-1 py-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
                    : darkMode
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* HERO TAB */}
        {activeTab === 'hero' && (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-6 py-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                Live Demo – Keine Anmeldung erforderlich
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
                Dein Leben.{' '}
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
                  Rauchfrei.
                </span>
              </h1>
              <p className={`text-lg sm:text-xl ${muted} max-w-2xl mx-auto leading-relaxed`}>
                Der KI-Coach, der dich durch jedes Verlangen führt. Kein Rückfall. Kein Kompromiss.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold text-lg shadow-xl shadow-teal-500/30 hover:shadow-teal-500/50 hover:scale-105 transition-all duration-200">
                  Kostenlos starten 🚀
                </button>
                <button
                  className={`px-8 py-4 rounded-2xl font-bold text-lg border transition-all duration-200 ${
                    darkMode
                      ? 'border-slate-700 hover:border-teal-500/50 hover:bg-teal-500/10'
                      : 'border-gray-300 hover:border-teal-500/50 hover:bg-teal-50'
                  }`}
                >
                  Demo ansehen
                </button>
              </div>
            </div>

            {/* Day Counter */}
            <div
              className={`rounded-3xl border p-8 text-center bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-transparent ${
                darkMode ? 'border-teal-500/20' : 'border-teal-200'
              }`}
            >
              <p className={`text-sm font-medium mb-2 ${muted}`}>Du bist bereits</p>
              <div className="text-8xl font-black bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent leading-none mb-2">
                {streakDays}
              </div>
              <p className="text-2xl font-bold mb-6">Tage rauchfrei 🎉</p>
              <div className="flex justify-center gap-2">
                {Array.from({ length: Math.min(streakDays, 30) }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-8 rounded-full transition-all ${
                      i < streakDays ? 'bg-teal-400' : darkMode ? 'bg-slate-700' : 'bg-gray-200'
                    }`}
                    style={{ opacity: i < streakDays ? 0.4 + (i / streakDays) * 0.6 : 1 }}
                  />
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className={`rounded-2xl border p-5 text-center transition-all hover:scale-105 ${card}`}
                >
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                  {s.sub && <div className={`text-xs ${muted}`}>{s.sub}</div>}
                  <div className={`text-xs mt-1 ${muted}`}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-black mb-2">Deine Fortschritte</h2>
              <p className={muted}>Echtzeit-Tracking deiner rauchfreien Reise</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Savings Card */}
              <div
                className={`rounded-2xl border p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 ${
                  darkMode ? 'border-yellow-500/20' : 'border-yellow-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">💰</span>
                  <div>
                    <p className={`text-sm ${muted}`}>Gespart</p>
                    <p className="text-4xl font-black text-yellow-400">184€</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={muted}>Pro Tag</span>
                    <span className="font-semibold">8€</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={muted}>Pro Monat</span>
                    <span className="font-semibold">240€</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={muted}>Pro Jahr</span>
                    <span className="font-semibold text-yellow-400">2.880€</span>
                  </div>
                </div>
              </div>

              {/* Health Progress */}
              <div className={`rounded-2xl border p-6 ${card}`}>
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span>❤️</span> Gesundheits-Score
                </h3>
                {[
                  { label: 'Lunge', value: 72, color: 'bg-teal-400' },
                  { label: 'Herz', value: 85, color: 'bg-green-400' },
                  { label: 'Haut', value: 60, color: 'bg-cyan-400' },
                  { label: 'Energie', value: 78, color: 'bg-purple-400' },
                ].map((h) => (
                  <div key={h.label} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className={muted}>{h.label}</span>
                      <span className="font-semibold">{h.value}%</span>
                    </div>
                    <div className={`h-2 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                      <div
                        className={`h-2 rounded-full ${h.color} transition-all duration-1000`}
                        style={{ width: `${h.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Chart */}
            <div className={`rounded-2xl border p-6 ${card}`}>
              <h3 className="font-bold mb-6">Verlangen diese Woche</h3>
              <div className="flex items-end gap-3 h-32">
                {[8, 6, 5, 3, 4, 2, 1].map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-teal-500 to-cyan-400 transition-all duration-500"
                      style={{ height: `${(v / 8) * 100}%`, minHeight: '4px' }}
                    />
                    <span className={`text-xs ${muted}`}>
                      {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FEATURES TAB */}
        {activeTab === 'features' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-black mb-2">Features</h2>
              <p className={muted}>Alles, was du für deine rauchfreie Reise brauchst</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f) => (
                <div
                  key={f.title}
                  className={`rounded-2xl border p-6 bg-gradient-to-br ${f.color} transition-all hover:scale-[1.02] hover:shadow-xl cursor-pointer`}
                >
                  <div className="text-4xl mb-4">{f.icon}</div>
                  <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                  <p className={`text-sm leading-relaxed ${muted}`}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-black mb-2">KI-Coach Buddy</h2>
              <p className={muted}>Dein persönlicher Coach – immer für dich da</p>
            </div>
            <div className={`rounded-2xl border overflow-hidden ${card}`}>
              {/* Chat Header */}
              <div
                className={`p-4 border-b flex items-center gap-3 ${
                  darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-lg">
                  🤖
                </div>
                <div>
                  <p className="font-bold">Buddy</p>
                  <p className="text-xs text-teal-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-teal-500 text-white rounded-br-sm'
                          : darkMode
                          ? 'bg-slate-800 text-slate-200 rounded-bl-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div
                className={`p-4 border-t flex gap-3 ${
                  darkMode ? 'border-slate-700' : 'border-gray-200'
                }`}
              >
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Schreib Buddy eine Nachricht..."
                  className={`flex-1 rounded-xl px-4 py-3 text-sm outline-none border transition-all ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-teal-500'
                      : 'bg-gray-50 border-gray-300 focus:border-teal-500'
                  }`}
                />
                <button
                  onClick={sendMessage}
                  className="px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-medium transition-all hover:scale-105 active:scale-95"
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-black mb-2">Gesundheits-Timeline</h2>
              <p className={muted}>So erholt sich dein Körper nach dem Aufhören</p>
            </div>
            <div className="relative">
              <div
                className={`absolute left-6 top-0 bottom-0 w-0.5 ${
                  darkMode ? 'bg-slate-700' : 'bg-gray-200'
                }`}
              />
              <div className="space-y-4">
                {timeline.map((item, i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <div
                      className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                        item.done
                          ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                          : darkMode
                          ? 'bg-slate-800 border border-slate-700 text-slate-500'
                          : 'bg-gray-100 border border-gray-200 text-gray-400'
                      }`}
                    >
                      {item.done ? '✓' : '○'}
                    </div>
                    <div
                      className={`flex-1 rounded-2xl border p-4 ${
                        item.done
                          ? darkMode
                            ? 'border-teal-500/30 bg-teal-500/10'
                            : 'border-teal-200 bg-teal-50'
                          : card
                      }`}
                    >
                      <div
                        className={`text-xs font-bold mb-1 ${
                          item.done ? 'text-teal-400' : muted
                        }`}
                      >
                        {item.time}
                      </div>
                      <p className="text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* GAMIFICATION TAB */}
        {activeTab === 'gamification' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-black mb-2">Achievements</h2>
              <p className={muted}>Verdiene Badges auf deiner rauchfreien Reise</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {badges.map((b) => (
                <div
                  key={b.name}
                  className={`rounded-2xl border p-6 text-center transition-all hover:scale-105 ${
                    b.earned
                      ? darkMode
                        ? 'border-teal-500/40 bg-gradient-to-br from-teal-500/15 to-cyan-500/10'
                        : 'border-teal-200 bg-teal-50'
                      : `${card} opacity-50`
                  }`}
                >
                  <div
                    className={`text-5xl mb-3 ${!b.earned && 'grayscale'}`}
                  >
                    {b.icon}
                  </div>
                  <p className="font-bold">{b.name}</p>
                  <p
                    className={`text-xs mt-1 ${
                      b.earned ? 'text-teal-400' : muted
                    }`}
                  >
                    {b.earned ? '✓ Verdient' : '🔒 Gesperrt'}
                  </p>
                </div>
              ))}
            </div>

            {/* Leaderboard */}
            <div className={`rounded-2xl border p-6 ${card}`}>
              <h3 className="font-bold mb-4">🏆 Bestenliste</h3>
              <div className="space-y-3">
                {[
                  { name: 'Sarah M.', days: 45, rank: 1 },
                  { name: 'Du', days: 23, rank: 2 },
                  { name: 'Thomas K.', days: 18, rank: 3 },
                  { name: 'Julia R.', days: 12, rank: 4 },
                ].map((u) => (
                  <div
                    key={u.name}
                    className={`flex items-center gap-4 p-3 rounded-xl ${
                      u.name === 'Du'
                        ? darkMode
                          ? 'bg-teal-500/15 border border-teal-500/30'
                          : 'bg-teal-50 border border-teal-200'
                        : subtle
                    }`}
                  >
                    <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white">
                      {u.rank}
                    </span>
                    <span className={`flex-1 font-medium ${u.name === 'Du' ? 'text-teal-400' : ''}`}>
                      {u.name}
                    </span>
                    <span className={`text-sm font-bold ${u.name === 'Du' ? 'text-teal-400' : muted}`}>
                      {u.days} Tage
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className={`mt-16 py-8 text-center text-sm border-t ${
          darkMode ? 'border-slate-800 text-slate-500' : 'border-gray-200 text-gray-400'
        }`}
      >
        <p>🚭 Nichtraucher Demo • Keine Anmeldung • Keine Daten werden gespeichert</p>
        <p className="mt-1">Built with Next.js + Tailwind CSS</p>
      </footer>
    </div>
  );
}

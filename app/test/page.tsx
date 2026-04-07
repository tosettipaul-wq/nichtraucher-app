'use client';

import { useState } from 'react';

export default function TestPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('hero');
  const [chatMessages, setChatMessages] = useState([
    { role: 'buddy', text: 'Hey! 👋 Wie geht es dir heute? Wie war deine Nacht?' },
    { role: 'user', text: 'Gut, ich habe 7 Stunden geschlafen' },
    { role: 'buddy', text: 'Awesome! 😴 Das ist großartig für deinen Körper. Dein Stress-Level wird dadurch sinken.' },
  ]);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [streakDays, setStreakDays] = useState(23);

  const bgClass = darkMode ? 'bg-slate-950' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-slate-950';
  const cardClass = darkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200';
  const inputClass = darkMode
    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400'
    : 'bg-white border-gray-300 text-slate-950 placeholder-gray-400';

  const addChatMessage = (role: 'user' | 'buddy', text: string) => {
    setChatMessages([...chatMessages, { role, text }]);
  };

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} transition-colors duration-300`}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-700 bg-opacity-95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">🚭 Nichtraucher Test Demo</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition"
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {['hero', 'onboarding', 'chat', 'gamification', 'walkthrough'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === tab
                  ? 'bg-teal-600 text-white'
                  : darkMode
                    ? 'bg-slate-800 hover:bg-slate-700'
                    : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Hero Section */}
        {activeTab === 'hero' && (
          <div className="space-y-8">
            <div className={`rounded-xl p-8 border border-gray-700 ${cardClass}`}>
              <div className="text-center mb-12">
                <h2 className="text-5xl font-bold mb-4">🚭 Nichtraucher</h2>
                <p className="text-xl text-gray-400">Dein Weg zur rauchfreien Zukunft</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className={`p-6 rounded-lg border ${cardClass}`}>
                  <h3 className="text-2xl font-bold mb-4">Dein Fortschritt</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Tage rauchfrei</p>
                      <p className="text-5xl font-bold text-teal-400">{streakDays}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Geld gespart</p>
                      <p className="text-3xl font-bold text-green-400">€{(streakDays * 8.5).toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => setStreakDays(streakDays + 1)}
                      className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-lg transition"
                    >
                      ✅ Heute rauchfrei (Demo)
                    </button>
                  </div>
                </div>

                <div className={`p-6 rounded-lg border ${cardClass}`}>
                  <h3 className="text-2xl font-bold mb-4">Features</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-teal-400 text-xl">✓</span>
                      <span>Track Tage rauchfrei in Echtzeit</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-teal-400 text-xl">✓</span>
                      <span>AI Buddy Chat (Doctor + Coach)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-teal-400 text-xl">✓</span>
                      <span>Gamification (Streaks, Badges)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-teal-400 text-xl">✓</span>
                      <span>Friend Accountability System</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-teal-400 text-xl">✓</span>
                      <span>Grace Days (Shame-free approach)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onboarding Flow */}
        {activeTab === 'onboarding' && (
          <div className={`rounded-xl p-8 border border-gray-700 ${cardClass}`}>
            <h2 className="text-3xl font-bold mb-6">Test Onboarding Flow (No Data Saved)</h2>

            <div className="space-y-6">
              {/* Progress Indicator */}
              <div className="flex justify-between items-center mb-8">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex flex-col items-center flex-1">
                    <button
                      onClick={() => setOnboardingStep(step)}
                      className={`w-12 h-12 rounded-full font-bold transition mb-2 ${
                        step <= onboardingStep
                          ? 'bg-teal-600 text-white'
                          : darkMode
                            ? 'bg-slate-700 text-gray-400'
                            : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {step}
                    </button>
                    <span className="text-xs text-center text-gray-400">
                      {step === 1
                        ? 'Willkommen'
                        : step === 2
                          ? 'Ziel'
                          : step === 3
                            ? 'Motivation'
                            : 'Fertig'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Step Content */}
              <div className={`p-8 rounded-lg border ${cardClass} min-h-96`}>
                {onboardingStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold">Willkommen bei Nichtraucher 🎯</h3>
                    <p className="text-gray-400">
                      Diese App hilft dir, dein Rauchen zu beenden. Mit Unterstützung von deinem AI Buddy
                      (ein Mix aus Arzt und Coach), Gamification und einer liebevollen Community.
                    </p>
                    <p className="text-gray-400">
                      <strong>Wichtig:</strong> Dies ist keine Therapie, aber ein echtes Support-System.
                    </p>
                  </div>
                )}

                {onboardingStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold">Dein Ziel</h3>
                    <div className="space-y-4">
                      <label className="block">
                        <input type="radio" name="goal" defaultChecked />
                        <span className="ml-2">Komplett aufhören zu rauchen</span>
                      </label>
                      <label className="block">
                        <input type="radio" name="goal" />
                        <span className="ml-2">Menge reduzieren</span>
                      </label>
                      <label className="block">
                        <input type="radio" name="goal" />
                        <span className="ml-2">Nur gelegentlich rauchen</span>
                      </label>
                    </div>
                  </div>
                )}

                {onboardingStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold">Deine Motivation</h3>
                    <textarea
                      placeholder="Warum möchtest du rauchfrei werden? Z.B. Gesundheit, Familie, Geld..."
                      className={`w-full p-4 rounded-lg border min-h-40 focus:outline-none focus:ring-2 focus:ring-teal-600 ${inputClass}`}
                    />
                  </div>
                )}

                {onboardingStep === 4 && (
                  <div className="space-y-6 text-center">
                    <h3 className="text-2xl font-bold">🎉 Perfekt!</h3>
                    <p className="text-gray-400">Dein Profil ist erstellt. Starte jetzt deine Reise!</p>
                    <div className="text-4xl">🚭 → 💚 → 🏆</div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex gap-4">
                {onboardingStep > 1 && (
                  <button
                    onClick={() => setOnboardingStep(onboardingStep - 1)}
                    className={`flex-1 py-3 px-4 rounded-lg border font-bold transition ${
                      darkMode
                        ? 'border-slate-700 hover:bg-slate-800'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    ← Zurück
                  </button>
                )}
                {onboardingStep < 4 && (
                  <button
                    onClick={() => setOnboardingStep(onboardingStep + 1)}
                    className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-lg transition"
                  >
                    Weiter →
                  </button>
                )}
                {onboardingStep === 4 && (
                  <button className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition">
                    🚀 Los geht's!
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chat Demo */}
        {activeTab === 'chat' && (
          <div className={`rounded-xl p-8 border border-gray-700 ${cardClass} max-w-2xl mx-auto`}>
            <h2 className="text-3xl font-bold mb-6">AI Buddy Chat Demo (Read-only)</h2>

            <div className={`rounded-lg border ${cardClass} h-96 overflow-y-auto p-4 mb-4`}>
              <div className="space-y-4">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs px-4 py-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-teal-600 text-white'
                          : darkMode
                            ? 'bg-slate-800 text-gray-100'
                            : 'bg-gray-200 text-slate-900'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() =>
                  addChatMessage(
                    'user',
                    'Ich hatte heute eine schwierige Zeit mit Cravings...'
                  )
                }
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition text-left"
              >
                💭 Demo: "Ich hatte heute eine schwierige Zeit..."
              </button>
              <button
                onClick={() =>
                  addChatMessage(
                    'buddy',
                    'Das ist völlig normal! 💪 Cravings sind am stärksten in den ersten 3 Wochen. Dein Körper gewöhnt sich an die neue Situation.'
                  )
                }
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg transition text-left"
              >
                🤖 Demo AI Response
              </button>
              <p className="text-xs text-gray-400 text-center">
                (Demo Mode: Keine Daten werden gespeichert)
              </p>
            </div>
          </div>
        )}

        {/* Gamification Preview */}
        {activeTab === 'gamification' && (
          <div className="space-y-8">
            <div className={`rounded-xl p-8 border border-gray-700 ${cardClass}`}>
              <h2 className="text-3xl font-bold mb-8">Gamification Preview (Mock)</h2>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Streaks */}
                <div className={`rounded-lg border p-6 ${cardClass}`}>
                  <h3 className="text-2xl font-bold mb-4">🔥 Streaks</h3>
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">Aktuelle Serie</span>
                        <span className="text-3xl font-bold text-orange-400">23</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-orange-400 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">7 Tage bis Meilenstein 30</p>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">Beste Serie</span>
                        <span className="text-2xl font-bold text-yellow-400">23</span>
                      </div>
                      <p className="text-sm text-gray-400">Neuer persönlicher Rekord!</p>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className={`rounded-lg border p-6 ${cardClass}`}>
                  <h3 className="text-2xl font-bold mb-4">🏆 Badges (Achievements)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { emoji: '🎯', label: 'Gestartet', unlocked: true },
                      { emoji: '🌱', label: '7 Tage', unlocked: true },
                      { emoji: '💚', label: '14 Tage', unlocked: true },
                      { emoji: '🔥', label: '30 Tage', unlocked: false },
                      { emoji: '👑', label: '100 Tage', unlocked: false },
                      { emoji: '🌟', label: '1 Jahr', unlocked: false },
                    ].map((badge, idx) => (
                      <div
                        key={idx}
                        className={`text-center p-4 rounded-lg transition ${
                          badge.unlocked
                            ? darkMode
                              ? 'bg-slate-800'
                              : 'bg-yellow-50'
                            : darkMode
                              ? 'bg-slate-900 opacity-50'
                              : 'bg-gray-200 opacity-50'
                        }`}
                      >
                        <div className="text-3xl mb-2">{badge.emoji}</div>
                        <p className="text-xs font-semibold">{badge.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Levels */}
              <div className={`rounded-lg border p-6 mt-8 ${cardClass}`}>
                <h3 className="text-2xl font-bold mb-4">⭐ Level Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Level 5: "Champion" 💪</span>
                      <span className="text-sm text-gray-400">1200 / 1500 XP</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div className="bg-teal-600 h-3 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Walkthrough */}
        {activeTab === 'walkthrough' && (
          <div className={`rounded-xl p-8 border border-gray-700 ${cardClass}`}>
            <h2 className="text-3xl font-bold mb-8">Live Feature Walkthrough (Read-only)</h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Dashboard Preview */}
              <div className={`rounded-lg border p-6 ${cardClass}`}>
                <h3 className="text-xl font-bold mb-4">📊 Dashboard</h3>
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                    <p className="text-sm text-gray-400 mb-1">Hauptmetrik</p>
                    <p className="text-4xl font-bold text-teal-400">{streakDays} Tage</p>
                    <p className="text-xs text-gray-400 mt-1">rauchfrei seit 23 März</p>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                    <p className="text-sm text-gray-400 mb-1">Geld gespart</p>
                    <p className="text-3xl font-bold text-green-400">€195,50</p>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                    <p className="text-sm text-gray-400 mb-1">Gesundheit</p>
                    <div className="flex gap-2">
                      <span>❤️</span>
                      <span>💚</span>
                      <span>🫁</span>
                      <span>⚡</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Friends/Accountability */}
              <div className={`rounded-lg border p-6 ${cardClass}`}>
                <h3 className="text-xl font-bold mb-4">👥 Freunde & Accountability</h3>
                <div className="space-y-3">
                  {['Alex', 'Lisa', 'Marco'].map((friend, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg flex justify-between items-center ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}
                    >
                      <div>
                        <p className="font-semibold">{friend}</p>
                        <p className="text-xs text-gray-400">
                          {idx === 0 ? '42 Tage' : idx === 1 ? '18 Tage' : '7 Tage'}
                        </p>
                      </div>
                      <span className="text-2xl">{idx === 0 ? '🔥' : idx === 1 ? '💪' : '🌱'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cravings Log */}
              <div className={`rounded-lg border p-6 ${cardClass}`}>
                <h3 className="text-xl font-bold mb-4">📝 Cravings Log</h3>
                <div className="space-y-3">
                  {[
                    { time: '14:32', level: 'Hoch', trigger: 'Stress nach Meeting' },
                    { time: '11:20', level: 'Mittel', trigger: 'Gewohnheit (Kaffee)' },
                    { time: '08:15', level: 'Niedrig', trigger: 'Morgenroutine' },
                  ].map((log, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}
                    >
                      <div className="flex justify-between mb-2">
                        <p className="font-semibold text-sm">{log.time}</p>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          log.level === 'Hoch' ? 'bg-red-500' :
                          log.level === 'Mittel' ? 'bg-yellow-500' : 'bg-green-500'
                        } text-white`}>
                          {log.level}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{log.trigger}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Facts */}
              <div className={`rounded-lg border p-6 ${cardClass}`}>
                <h3 className="text-xl font-bold mb-4">💡 Daily Medical Facts</h3>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                  <p className="text-sm text-gray-300">
                    <strong>Tag 23:</strong> Dein Geruchssinn regeneriert sich. Du merkst jetzt
                    Gerüche, die du 20 Jahre nicht gerochen hast!
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Responsive Demo */}
            <div className={`rounded-lg border p-6 mt-8 ${cardClass}`}>
              <h3 className="text-xl font-bold mb-4">📱 Mobile-Responsive Layout</h3>
              <p className="text-sm text-gray-400 mb-4">
                Diese Seite passt sich automatisch an alle Bildschirmgrößen an. Probiere es aus, indem du dein Browser-Fenster verkleinerst!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                  <p className="text-xs">📱 Mobil</p>
                  <p className="text-lg font-bold">Single Column</p>
                </div>
                <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                  <p className="text-xs">🖥️ Desktop</p>
                  <p className="text-lg font-bold">Multi-Column</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700 mt-16 py-8 text-center text-sm text-gray-400">
        <p>Nichtraucher Test Demo • No Authentication Required • No Data Saved</p>
        <p className="mt-2">Built with Next.js + Tailwind CSS</p>
      </footer>
    </div>
  );
}

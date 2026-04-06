'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">🚭 Nichtraucher</h1>
          <p className="text-gray-300">Dein Weg zur rauchfreien Zukunft</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Willkommen</h2>
          <p className="text-gray-300 mb-6">
            Tracke deinen Fortschritt, chatte mit deinem AI Buddy (Doctor + Coach), 
            und erhalte täglich Motivation und medizinische Facts über deinen Körper.
          </p>

          <button
            onClick={() => router.push('/onboarding/step-1')}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-lg transition duration-200 mb-4"
          >
            🚀 Los geht's!
          </button>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="font-semibold text-white mb-4">Features:</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>✅ Track Tage rauchfrei</li>
              <li>✅ AI Buddy Chat (Doctor + Coach)</li>
              <li>✅ Täglich Medical Facts</li>
              <li>✅ Gamification (Streaks, Achievements)</li>
              <li>✅ Friend Accountability (20:00 CET Daily)</li>
              <li>✅ Grace Days (Shame-free approach)</li>
            </ul>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          MVP v1.0 • April 2026 • Built with Next.js + Supabase + Claude AI
        </p>
      </div>
    </div>
  );
}

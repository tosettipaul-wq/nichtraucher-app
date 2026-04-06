'use client';

import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/lib/onboarding-store';

export default function Step2Page() {
  const router = useRouter();
  const { data, setData, setStep } = useOnboarding();

  const handleNext = () => {
    if (!data.quit_date) {
      alert('Bitte wähle ein Datum aus');
      return;
    }
    setStep(3);
    router.push('/onboarding/step-3');
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white">Schritt 2 von 5</h1>
        <p className="text-gray-300 text-lg mt-2">Wann willst du aufhören zu rauchen?</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Quit-Datum
          </label>
          <input
            type="date"
            value={data.quit_date || today}
            onChange={(e) => setData('quit_date', e.target.value)}
            min={today}
            className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div className="bg-teal-900 bg-opacity-30 border border-teal-700 rounded-lg p-4">
          <p className="text-sm text-teal-200">
            💡 <strong>Tipp:</strong> Wähle ein Datum bald, aber nicht überstürzt. Ein oder zwei
            Tage Vorbereitungszeit helfen.
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-6">
        <button
          onClick={() => {
            setStep(1);
            router.push('/onboarding/step-1');
          }}
          className="px-6 py-2 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-700 transition"
        >
          ← Zurück
        </button>
        <button
          onClick={handleNext}
          className="flex-1 px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition font-medium"
        >
          Weiter →
        </button>
      </div>
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/lib/onboarding-store';

export default function Step1Page() {
  const router = useRouter();
  const { data, setData, setStep } = useOnboarding();

  const reasons = [
    'Gesundheit für mich selbst',
    'Für meine Familie',
    'Finanzielle Gründe',
    'Fitness & Sport',
    'Andere',
  ];

  const handleNext = () => {
    if (!data.reason) {
      alert('Bitte wähle einen Grund aus');
      return;
    }
    setStep(2);
    router.push('/onboarding/step-2');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white">Schritt 1 von 5</h1>
        <p className="text-gray-300 text-lg mt-2">Warum willst du mit dem Rauchen aufhören?</p>
      </div>

      <div className="space-y-3">
        {reasons.map((reason) => (
          <button
            key={reason}
            onClick={() => setData('reason', reason)}
            className={`w-full p-4 text-left rounded-lg border-2 transition ${
              data.reason === reason
                ? 'border-teal-500 bg-teal-900 bg-opacity-30'
                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center">
              <div
                className={`w-5 h-5 rounded-full border-2 mr-3 ${
                  data.reason === reason
                    ? 'border-teal-500 bg-teal-500'
                    : 'border-gray-600'
                }`}
              />
              <span className={`font-medium ${data.reason === reason ? 'text-teal-400' : 'text-white'}`}>{reason}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="px-6 py-2 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-700 transition"
        >
          Abbrechen
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

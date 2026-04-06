import { create } from 'zustand';

export interface OnboardingData {
  reason: string;
  quit_date: string;
  cigs_per_day: number;
  triggers: string[];
  friend_email: string;
  full_name: string;
}

interface OnboardingStore {
  data: Partial<OnboardingData>;
  currentStep: number;
  setData: (key: keyof OnboardingData, value: any) => void;
  setStep: (step: number) => void;
  reset: () => void;
}

export const useOnboarding = create<OnboardingStore>((set) => ({
  data: {},
  currentStep: 1,
  setData: (key, value) =>
    set((state) => ({
      data: { ...state.data, [key]: value },
    })),
  setStep: (step) => set({ currentStep: step }),
  reset: () => set({ data: {}, currentStep: 1 }),
}));

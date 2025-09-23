/*
export interface RegisterRequest {
  email: string; // *r
  password: string; // *r
  name: string; // *r
  phone: string; // *r
  gender?: number;
  age?: number;
  role?: number;
  token?: string;
}
*/

import { RegisterRequest } from '@/api/Member';
import { create } from 'zustand';

type SignUpStore = {
    registerForm : RegisterRequest
    setForm : (partial :Partial<RegisterRequest>) => void;  
    resetForm :()=>void;
}

export const useSignUpStore = create<SignUpStore>((set) => ({
  registerForm: {} as RegisterRequest,
  setForm: (partial) => set((state) => ({ registerForm: { ...state.registerForm, ...partial } })),
  resetForm: () => set({ registerForm: {} as RegisterRequest }),
}));

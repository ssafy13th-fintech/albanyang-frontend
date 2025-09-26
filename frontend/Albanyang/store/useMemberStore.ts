import { MemberData } from '@/api/Member';
import { create } from 'zustand';

type MemberStore = {
    memberForm : MemberData
    setForm : (partial :Partial<MemberData>) => void;  
    resetForm :()=>void;
}

export const useMemberStore = create<MemberStore>((set) => ({
  memberForm: {} as MemberData,
  setForm: (partial) => set((state) => ({ memberForm: { ...state.memberForm, ...partial } })),
  resetForm: () => set({ memberForm: {} as MemberData }),
}));

export const getState = useMemberStore.getState();


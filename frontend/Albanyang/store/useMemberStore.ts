import { MemberData } from '@/api/Member';
import { Role } from '@/components/navBar/NavBar';
import { create } from 'zustand';


interface MemberStoreData extends MemberData{
  role? : Role 
}

type MemberStore = {
    memberForm : MemberStoreData
    setForm : (partial :Partial<MemberStoreData>) => void;  
    resetForm :()=>void;
}

export const useMemberStore = create<MemberStore>((set) => ({
  memberForm: {} as MemberStoreData,
  setForm: (partial) => set((state) => ({ memberForm: { ...state.memberForm, ...partial } })),
  resetForm: () => set({ memberForm: {} as MemberStoreData }),
}));

export const getState = useMemberStore.getState();


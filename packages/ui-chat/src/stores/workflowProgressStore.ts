import { create } from 'zustand';

export const useWorkflowProgressStore = create<{
  workflowId: string;
  setWorkflowId: (id: string) => void;
}>(set => ({
  workflowId: '',
  setWorkflowId: (id: string) => set({ workflowId: id }),
}));

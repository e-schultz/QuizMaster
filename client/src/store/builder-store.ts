import { create } from 'zustand';
import { Assessment } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface BuilderState {
  currentStepId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  
  // Actions
  setCurrentStepId: (stepId: string) => void;
  setDirty: (dirty: boolean) => void;
  saveAssessment: (assessment: Assessment) => Promise<void>;
  publishAssessment: (assessment: Assessment) => Promise<void>;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  currentStepId: null,
  isDirty: false,
  isSaving: false,

  setCurrentStepId: (stepId: string) => {
    set({ currentStepId: stepId });
  },

  setDirty: (dirty: boolean) => {
    set({ isDirty: dirty });
  },

  saveAssessment: async (assessment: Assessment) => {
    set({ isSaving: true });
    
    try {
      await apiRequest('PUT', `/api/assessments/${assessment.id}`, {
        ...assessment,
        meta: {
          ...assessment.meta,
          updatedAt: new Date().toISOString()
        }
      });
      
      set({ isDirty: false });
    } catch (error) {
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  publishAssessment: async (assessment: Assessment) => {
    set({ isSaving: true });
    
    try {
      await apiRequest('PUT', `/api/assessments/${assessment.id}`, {
        ...assessment,
        status: 'published' as const,
        version: assessment.version + 1,
        meta: {
          ...assessment.meta,
          updatedAt: new Date().toISOString()
        }
      });
      
      set({ isDirty: false });
    } catch (error) {
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },
}));

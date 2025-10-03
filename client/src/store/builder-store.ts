import { create } from 'zustand';
import { Assessment } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { Edge } from '@xyflow/react';

interface BuilderState {
  currentStepId: string | null;
  selectedEdge: Edge | null;
  isDirty: boolean;
  isSaving: boolean;
  
  // Actions
  setCurrentStepId: (stepId: string | null) => void;
  setSelectedEdge: (edge: Edge | null) => void;
  setDirty: (dirty: boolean) => void;
  saveAssessment: (assessment: Assessment) => Promise<void>;
  publishAssessment: (assessment: Assessment) => Promise<void>;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  currentStepId: null,
  selectedEdge: null,
  isDirty: false,
  isSaving: false,

  setCurrentStepId: (stepId: string | null) => {
    set({ currentStepId: stepId, selectedEdge: null });
  },

  setSelectedEdge: (edge: Edge | null) => {
    set({ selectedEdge: edge, currentStepId: null });
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

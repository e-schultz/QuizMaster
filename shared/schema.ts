import { z } from "zod";

// Core Assessment Schema
export const assessmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  version: z.number(),
  status: z.enum(['draft', 'published']),
  groups: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    steps: z.array(z.object({
      id: z.string()
    }))
  })),
  steps: z.record(z.string(), z.object({
    id: z.string(),
    key: z.string(),
    title: z.string(),
    description: z.string().optional(),
    fields: z.array(z.object({
      name: z.string(),
      label: z.string(),
      type: z.enum(['text', 'textarea', 'number', 'select', 'checkbox', 'radio', 'date', 'bmi']),
      required: z.boolean().optional(),
      options: z.array(z.object({
        label: z.string(),
        value: z.string()
      })).optional(),
      helpText: z.string().optional(),
      visibility: z.object({
        any: z.array(z.any()).optional(),
        all: z.array(z.any()).optional(),
        not: z.any().optional()
      }).optional(),
      validate: z.object({
        path: z.string()
      }).optional()
    })),
    traversal: z.array(z.object({
      when: z.object({
        any: z.array(z.any()).optional(),
        all: z.array(z.any()).optional(),
        not: z.any().optional()
      }),
      go: z.object({
        type: z.enum(['step', 'group', 'end']),
        id: z.string().optional()
      })
    })).optional(),
    fallbackNext: z.object({
      type: z.enum(['step', 'group', 'end']),
      id: z.string().optional()
    }).optional()
  })),
  meta: z.object({
    createdAt: z.string(),
    updatedAt: z.string(),
    createdBy: z.string().optional()
  })
});

export const insertAssessmentSchema = assessmentSchema.omit({ id: true, meta: true });

export type Assessment = z.infer<typeof assessmentSchema>;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;

// Condition Schema
export const conditionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('eq'), field: z.string(), value: z.any() }),
  z.object({ type: z.literal('ne'), field: z.string(), value: z.any() }),
  z.object({ type: z.literal('gt'), field: z.string(), value: z.number() }),
  z.object({ type: z.literal('gte'), field: z.string(), value: z.number() }),
  z.object({ type: z.literal('lt'), field: z.string(), value: z.number() }),
  z.object({ type: z.literal('lte'), field: z.string(), value: z.number() }),
  z.object({ type: z.literal('in'), field: z.string(), values: z.array(z.any()) }),
  z.object({ type: z.literal('truthy'), field: z.string() }),
  z.object({ type: z.literal('falsy'), field: z.string() })
]);

export type Condition = z.infer<typeof conditionSchema>;

// Session Schema for runtime
export const sessionSchema = z.object({
  id: z.string(),
  assessmentId: z.string(),
  currentStepId: z.string(),
  answers: z.record(z.string(), z.record(z.string(), z.any())),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type Session = z.infer<typeof sessionSchema>;
export type InsertSession = Omit<Session, 'id' | 'createdAt' | 'updatedAt'>;

import { Assessment } from "@shared/schema";
import { evaluateVisibility } from "./visibility-evaluator";

type TraversalRule = Assessment['steps'][string]['traversal'];
type FallbackRule = Assessment['steps'][string]['fallbackNext'];

/**
 * Determines the next step based on traversal rules and current context
 */
export function evaluateTraversal(
  step: Assessment['steps'][string],
  allAnswers: Record<string, Record<string, any>>,
  assessment: Assessment
): { type: 'step' | 'group' | 'end'; id?: string } | null {
  // Flatten all answers into a single object for evaluation
  const flatAnswers = Object.values(allAnswers).reduce((acc, stepAnswers) => {
    return { ...acc, ...stepAnswers };
  }, {});

  // Evaluate traversal rules in order
  if (step.traversal && step.traversal.length > 0) {
    for (const rule of step.traversal) {
      if (evaluateVisibility(rule.when, flatAnswers)) {
        return rule.go;
      }
    }
  }

  // If no rules matched, use fallback
  if (step.fallbackNext) {
    return step.fallbackNext;
  }

  // Default: go to next step in order
  return getNextStepInOrder(step.id, assessment);
}

/**
 * Gets the next step in the natural order (group by group)
 */
export function getNextStepInOrder(
  currentStepId: string,
  assessment: Assessment
): { type: 'step' | 'group' | 'end'; id?: string } | null {
  // Find current step's position
  let currentGroupIndex = -1;
  let currentStepIndex = -1;
  
  for (let i = 0; i < assessment.groups.length; i++) {
    const group = assessment.groups[i];
    const stepIndex = group.steps.findIndex(s => s.id === currentStepId);
    
    if (stepIndex !== -1) {
      currentGroupIndex = i;
      currentStepIndex = stepIndex;
      break;
    }
  }

  if (currentGroupIndex === -1) return null;

  const currentGroup = assessment.groups[currentGroupIndex];
  
  // If there's a next step in the current group
  if (currentStepIndex + 1 < currentGroup.steps.length) {
    return {
      type: 'step',
      id: currentGroup.steps[currentStepIndex + 1].id
    };
  }

  // If there's a next group
  if (currentGroupIndex + 1 < assessment.groups.length) {
    const nextGroup = assessment.groups[currentGroupIndex + 1];
    if (nextGroup.steps.length > 0) {
      return {
        type: 'step',
        id: nextGroup.steps[0].id
      };
    }
  }

  // End of assessment
  return { type: 'end' };
}

/**
 * Gets the previous step in the natural order
 */
export function getPreviousStepInOrder(
  currentStepId: string,
  assessment: Assessment
): { type: 'step' | 'group' | 'end'; id?: string } | null {
  // Find current step's position
  let currentGroupIndex = -1;
  let currentStepIndex = -1;
  
  for (let i = 0; i < assessment.groups.length; i++) {
    const group = assessment.groups[i];
    const stepIndex = group.steps.findIndex(s => s.id === currentStepId);
    
    if (stepIndex !== -1) {
      currentGroupIndex = i;
      currentStepIndex = stepIndex;
      break;
    }
  }

  if (currentGroupIndex === -1) return null;

  const currentGroup = assessment.groups[currentGroupIndex];
  
  // If there's a previous step in the current group
  if (currentStepIndex > 0) {
    return {
      type: 'step',
      id: currentGroup.steps[currentStepIndex - 1].id
    };
  }

  // If there's a previous group
  if (currentGroupIndex > 0) {
    const prevGroup = assessment.groups[currentGroupIndex - 1];
    if (prevGroup.steps.length > 0) {
      return {
        type: 'step',
        id: prevGroup.steps[prevGroup.steps.length - 1].id
      };
    }
  }

  // Beginning of assessment
  return null;
}

/**
 * Validates that all steps in an assessment are reachable
 */
export function validateReachability(assessment: Assessment): {
  reachableSteps: Set<string>;
  unreachableSteps: string[];
} {
  const reachableSteps = new Set<string>();
  const allStepIds = Object.keys(assessment.steps);
  
  // Start with first step of first group
  if (assessment.groups.length > 0 && assessment.groups[0].steps.length > 0) {
    const firstStepId = assessment.groups[0].steps[0].id;
    reachableSteps.add(firstStepId);
    
    // Use BFS to find all reachable steps
    const queue: string[] = [firstStepId];
    const visited = new Set<string>();
    
    while (queue.length > 0) {
      const stepId = queue.shift()!;
      if (visited.has(stepId)) continue;
      visited.add(stepId);
      
      const step = assessment.steps[stepId];
      if (!step) continue;
      
      // Check traversal rules
      if (step.traversal) {
        step.traversal.forEach(rule => {
          if (rule.go.type === 'step' && rule.go.id) {
            reachableSteps.add(rule.go.id);
            if (!visited.has(rule.go.id)) {
              queue.push(rule.go.id);
            }
          }
        });
      }
      
      // Check fallback
      if (step.fallbackNext?.type === 'step' && step.fallbackNext.id) {
        reachableSteps.add(step.fallbackNext.id);
        if (!visited.has(step.fallbackNext.id)) {
          queue.push(step.fallbackNext.id);
        }
      }
      
      // Check natural next step
      const nextStep = getNextStepInOrder(stepId, assessment);
      if (nextStep?.type === 'step' && nextStep.id) {
        reachableSteps.add(nextStep.id);
        if (!visited.has(nextStep.id)) {
          queue.push(nextStep.id);
        }
      }
    }
  }
  
  const unreachableSteps = allStepIds.filter(id => !reachableSteps.has(id));
  
  return { reachableSteps, unreachableSteps };
}

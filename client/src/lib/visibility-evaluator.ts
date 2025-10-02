import { Assessment, Condition } from "@shared/schema";

type VisibilityExpression = Assessment['steps'][string]['fields'][0]['visibility'];

/**
 * Evaluates a single condition against the given values
 */
function evaluateCondition(condition: any, values: Record<string, any>): boolean {
  if (!condition || typeof condition !== 'object') return true;

  // Handle different condition types
  if ('eq' in condition && Array.isArray(condition.eq)) {
    const [field, expectedValue] = condition.eq;
    return values[field] === expectedValue;
  }

  if ('ne' in condition && Array.isArray(condition.ne)) {
    const [field, expectedValue] = condition.ne;
    return values[field] !== expectedValue;
  }

  if ('gt' in condition && Array.isArray(condition.gt)) {
    const [field, expectedValue] = condition.gt;
    const fieldValue = Number(values[field]);
    return !isNaN(fieldValue) && fieldValue > expectedValue;
  }

  if ('gte' in condition && Array.isArray(condition.gte)) {
    const [field, expectedValue] = condition.gte;
    const fieldValue = Number(values[field]);
    return !isNaN(fieldValue) && fieldValue >= expectedValue;
  }

  if ('lt' in condition && Array.isArray(condition.lt)) {
    const [field, expectedValue] = condition.lt;
    const fieldValue = Number(values[field]);
    return !isNaN(fieldValue) && fieldValue < expectedValue;
  }

  if ('lte' in condition && Array.isArray(condition.lte)) {
    const [field, expectedValue] = condition.lte;
    const fieldValue = Number(values[field]);
    return !isNaN(fieldValue) && fieldValue <= expectedValue;
  }

  if ('in' in condition && Array.isArray(condition.in)) {
    const [field, expectedValues] = condition.in;
    return Array.isArray(expectedValues) && expectedValues.includes(values[field]);
  }

  if ('truthy' in condition && Array.isArray(condition.truthy)) {
    const [field] = condition.truthy;
    return Boolean(values[field]);
  }

  if ('falsy' in condition && Array.isArray(condition.falsy)) {
    const [field] = condition.falsy;
    return !Boolean(values[field]);
  }

  return true;
}

/**
 * Evaluates a visibility expression (with any/all/not logic) against the given values
 */
export function evaluateVisibility(
  expression: VisibilityExpression | undefined, 
  values: Record<string, any>
): boolean {
  if (!expression) return true;

  // Handle 'any' logic (OR)
  if (expression.any && Array.isArray(expression.any)) {
    return expression.any.some(condition => evaluateCondition(condition, values));
  }

  // Handle 'all' logic (AND)
  if (expression.all && Array.isArray(expression.all)) {
    return expression.all.every(condition => evaluateCondition(condition, values));
  }

  // Handle 'not' logic
  if (expression.not) {
    return !evaluateVisibility(expression.not, values);
  }

  return true;
}

/**
 * Gets all fields that should be visible given the current form values
 */
export function getVisibleFields(
  fields: Assessment['steps'][string]['fields'], 
  values: Record<string, any>
): string[] {
  return fields
    .filter(field => evaluateVisibility(field.visibility, values))
    .map(field => field.name);
}

/**
 * Validates that all required visible fields have values
 */
export function validateVisibleFields(
  fields: Assessment['steps'][string]['fields'],
  values: Record<string, any>
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  fields.forEach(field => {
    if (field.required && evaluateVisibility(field.visibility, values)) {
      const value = values[field.name];
      
      if (field.type === 'checkbox' && value !== true) {
        errors[field.name] = `${field.label} is required`;
      } else if (typeof value === 'string' && value.trim().length === 0) {
        errors[field.name] = `${field.label} is required`;
      } else if (value == null || value === '') {
        errors[field.name] = `${field.label} is required`;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

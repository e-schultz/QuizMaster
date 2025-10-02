import { useState, useEffect } from "react";
import { Assessment } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import FieldComponents from "./field-components";
import { evaluateVisibility } from "@/lib/visibility-evaluator";

interface FormRendererProps {
  step: Assessment['steps'][string];
  answers: Record<string, any>;
  onAnswersChange: (answers: Record<string, any>) => void;
  isPreview?: boolean;
  'data-testid'?: string;
}

export default function FormRenderer({ 
  step, 
  answers, 
  onAnswersChange, 
  isPreview = false,
  'data-testid': dataTestId
}: FormRendererProps) {
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set());

  // Create dynamic schema based on visible fields
  const createSchema = () => {
    const schemaFields: Record<string, z.ZodType> = {};
    
    step.fields.forEach(field => {
      if (visibleFields.has(field.name) || !field.visibility) {
        let fieldSchema: z.ZodType = z.any();
        
        switch (field.type) {
          case 'text':
          case 'textarea':
            fieldSchema = z.string();
            break;
          case 'number':
            fieldSchema = z.number();
            break;
          case 'checkbox':
            fieldSchema = z.boolean();
            break;
          case 'date':
            fieldSchema = z.string();
            break;
          case 'select':
          case 'radio':
            fieldSchema = z.string();
            break;
        }

        if (field.required) {
          fieldSchema = fieldSchema.refine(val => {
            if (field.type === 'checkbox') return val === true;
            if (typeof val === 'string') return val.trim().length > 0;
            return val != null;
          }, { message: `${field.label} is required` });
        } else {
          fieldSchema = fieldSchema.optional();
        }

        schemaFields[field.name] = fieldSchema;
      }
    });

    return z.object(schemaFields);
  };

  const form = useForm({
    resolver: zodResolver(createSchema()),
    defaultValues: answers,
    shouldUnregister: true, // Unregister hidden fields
  });

  // Watch form values for visibility evaluation
  const watchedValues = form.watch();

  // Update visible fields based on current values
  useEffect(() => {
    const newVisibleFields = new Set<string>();
    
    step.fields.forEach(field => {
      if (!field.visibility) {
        newVisibleFields.add(field.name);
      } else {
        const isVisible = evaluateVisibility(field.visibility, watchedValues);
        if (isVisible) {
          newVisibleFields.add(field.name);
        }
      }
    });

    setVisibleFields(newVisibleFields);
  }, [step.fields, watchedValues]);

  // Update parent when form values change
  useEffect(() => {
    const subscription = form.watch((data) => {
      // Only include values for visible fields
      const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
        if (visibleFields.has(key)) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      onAnswersChange(filteredData);
    });

    return () => subscription.unsubscribe();
  }, [form, onAnswersChange, visibleFields]);

  return (
    <div data-testid={dataTestId}>
      <Form {...form}>
        <form className="space-y-6">
          {step.fields.map((field) => {
            const isVisible = visibleFields.has(field.name);
            
            if (!isVisible) return null;

            return (
              <div 
                key={field.name}
                className={field.visibility ? "pl-8 border-l-2 border-primary/30 bg-primary/5 p-4 rounded-r-md" : ""}
                data-testid={`field-${field.name}`}
              >
                {field.visibility && (
                  <div className="flex items-start gap-2 mb-3">
                    <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                    </div>
                    <p className="text-sm text-foreground font-medium">Additional information needed</p>
                  </div>
                )}
                
                <FieldComponents
                  field={field}
                  form={form}
                  isPreview={isPreview}
                />
              </div>
            );
          })}
        </form>
      </Form>
    </div>
  );
}

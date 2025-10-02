import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Assessment } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Type, 
  Hash, 
  Calendar, 
  CheckSquare, 
  Circle, 
  List, 
  Calculator,
  FileText,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type FieldType = Assessment['steps'][string]['fields'][0]['type'];

interface FieldEditorProps {
  field?: Assessment['steps'][string]['fields'][0];
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: Assessment['steps'][string]['fields'][0]) => void;
}

const fieldSchema = z.object({
  name: z.string().min(1, "Field name is required").regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Invalid field name format"),
  label: z.string().min(1, "Field label is required"),
  type: z.enum(['text', 'textarea', 'number', 'select', 'checkbox', 'radio', 'date', 'bmi']),
  required: z.boolean().optional(),
  helpText: z.string().optional(),
  options: z.array(z.object({
    label: z.string().min(1, "Option label is required"),
    value: z.string().min(1, "Option value is required")
  })).optional()
});

type FieldFormData = z.infer<typeof fieldSchema>;

const fieldTypeIcons: Record<FieldType, typeof Type> = {
  text: Type,
  textarea: FileText,
  number: Hash,
  select: List,
  checkbox: CheckSquare,
  radio: Circle,
  date: Calendar,
  bmi: Calculator
};

const fieldTypeLabels: Record<FieldType, string> = {
  text: 'Text Input',
  textarea: 'Text Area',
  number: 'Number Input',
  select: 'Dropdown Select',
  checkbox: 'Checkbox',
  radio: 'Radio Group',
  date: 'Date Picker',
  bmi: 'BMI Calculator'
};

export default function FieldEditor({ field, isOpen, onClose, onSave }: FieldEditorProps) {
  const { toast } = useToast();
  const [showVisibility, setShowVisibility] = useState(false);

  const form = useForm<FieldFormData>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      name: field?.name || '',
      label: field?.label || '',
      type: field?.type || 'text',
      required: field?.required || false,
      helpText: field?.helpText || '',
      options: field?.options || []
    }
  });

  const selectedType = form.watch('type');
  const needsOptions = ['select', 'radio'].includes(selectedType);

  const handleSubmit = (data: FieldFormData) => {
    try {
      const fieldData: Assessment['steps'][string]['fields'][0] = {
        name: data.name,
        label: data.label,
        type: data.type,
        required: data.required,
        helpText: data.helpText?.trim() || undefined,
        options: needsOptions ? data.options : undefined
      };

      onSave(fieldData);
      onClose();
      
      toast({
        title: "Field Saved",
        description: `${data.label} has been ${field ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Could not save field. Please check your input and try again.",
        variant: "destructive",
      });
    }
  };

  const addOption = () => {
    const currentOptions = form.getValues('options') || [];
    form.setValue('options', [...currentOptions, { label: '', value: '' }]);
  };

  const removeOption = (index: number) => {
    const currentOptions = form.getValues('options') || [];
    form.setValue('options', currentOptions.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, field: 'label' | 'value', value: string) => {
    const currentOptions = form.getValues('options') || [];
    const newOptions = [...currentOptions];
    newOptions[index] = { ...newOptions[index], [field]: value };
    form.setValue('options', newOptions);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-field-editor">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {field ? (
              <>
                <Save className="w-5 h-5" />
                Edit Field
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Add New Field
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            {/* Field Type Selection */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Field Type</Label>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(fieldTypeLabels) as FieldType[]).map((type) => {
                  const Icon = fieldTypeIcons[type];
                  const isSelected = selectedType === type;
                  
                  return (
                    <Card 
                      key={type}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => form.setValue('type', type)}
                      data-testid={`select-field-type-${type}`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                            {fieldTypeLabels[type]}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="field_name" 
                            className="font-mono"
                            data-testid="input-field-name"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="label"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Label <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Field Label"
                            data-testid="input-field-label"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="helpText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Help Text</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Optional help text to guide users"
                          className="resize-none"
                          rows={2}
                          data-testid="textarea-field-help"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name="required"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-field-required"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          Required field
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Options Configuration (for select/radio fields) */}
            {needsOptions && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    Options
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                      className="gap-1"
                      data-testid="button-add-option"
                    >
                      <Plus className="w-3 h-3" />
                      Add Option
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {form.watch('options')?.map((option, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Display Label</Label>
                            <Input
                              value={option.label}
                              onChange={(e) => updateOption(index, 'label', e.target.value)}
                              placeholder="Option label"
                              data-testid={`input-option-label-${index}`}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Value</Label>
                            <Input
                              value={option.value}
                              onChange={(e) => updateOption(index, 'value', e.target.value)}
                              placeholder="option_value"
                              className="font-mono"
                              data-testid={`input-option-value-${index}`}
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="mt-6 text-muted-foreground hover:text-destructive"
                          onClick={() => removeOption(index)}
                          data-testid={`button-remove-option-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}

                    {(!form.watch('options') || form.watch('options')?.length === 0) && (
                      <div className="text-center py-6 text-muted-foreground">
                        <List className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">No options added yet</p>
                        <p className="text-xs">Click "Add Option" to create choices</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Conditional Visibility */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {showVisibility ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    Conditional Visibility
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVisibility(!showVisibility)}
                    data-testid="button-toggle-visibility"
                  >
                    {showVisibility ? 'Hide' : 'Configure'}
                  </Button>
                </CardTitle>
              </CardHeader>
              {showVisibility && (
                <CardContent>
                  <div className="text-center py-6 text-muted-foreground">
                    <EyeOff className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Conditional visibility rules</p>
                    <p className="text-xs">Feature coming soon - create rules to show/hide this field based on other answers</p>
                  </div>
                </CardContent>
              )}
            </Card>

          </form>
        </Form>

        <DialogFooter className="gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            data-testid="button-cancel-field"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(handleSubmit)}
            data-testid="button-save-field"
          >
            <Save className="w-4 h-4 mr-2" />
            {field ? 'Update Field' : 'Create Field'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

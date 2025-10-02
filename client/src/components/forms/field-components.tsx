import { Assessment } from "@shared/schema";
import { UseFormReturn } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface FieldComponentsProps {
  field: Assessment['steps'][string]['fields'][0];
  form: UseFormReturn<any>;
  isPreview?: boolean;
}

export default function FieldComponents({ field, form, isPreview = false }: FieldComponentsProps) {
  const [bmiData, setBmiData] = useState<{ height: number; weight: number; bmi: number; category: string } | null>(null);

  // BMI Calculator logic
  useEffect(() => {
    if (field.type === 'bmi') {
      const heightFt = form.watch('height_ft');
      const heightIn = form.watch('height_in');
      const weight = form.watch('weight');

      if (heightFt && weight) {
        const totalInches = (heightFt * 12) + (heightIn || 0);
        const heightM = totalInches * 0.0254;
        const weightKg = weight * 0.453592;
        const bmi = weightKg / (heightM * heightM);
        
        let category = 'Unknown';
        if (bmi < 18.5) category = 'Underweight';
        else if (bmi < 25) category = 'Normal Range';
        else if (bmi < 30) category = 'Overweight';
        else category = 'Obese';

        setBmiData({
          height: totalInches,
          weight,
          bmi: Math.round(bmi * 10) / 10,
          category
        });
      }
    }
  }, [field.type, form]);

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <FormField
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-foreground">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                    className="min-h-[44px]"
                    data-testid={`input-${field.name}`}
                    {...formField}
                  />
                </FormControl>
                {field.helpText && (
                  <FormDescription className="flex items-start gap-2">
                    <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    {field.helpText}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'textarea':
        return (
          <FormField
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-foreground">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    className="min-h-[100px] resize-none"
                    data-testid={`textarea-${field.name}`}
                    {...formField}
                  />
                </FormControl>
                {field.helpText && (
                  <FormDescription className="flex items-start gap-2">
                    <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    {field.helpText}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'number':
        return (
          <FormField
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-foreground">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    className="min-h-[44px]"
                    data-testid={`input-${field.name}`}
                    {...formField}
                    onChange={(e) => formField.onChange(e.target.value ? Number(e.target.value) : '')}
                  />
                </FormControl>
                {field.helpText && (
                  <FormDescription className="flex items-start gap-2">
                    <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    {field.helpText}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'date':
        return (
          <FormField
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-foreground">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="min-h-[44px]"
                    data-testid={`input-${field.name}`}
                    {...formField}
                  />
                </FormControl>
                {field.helpText && (
                  <FormDescription className="flex items-start gap-2">
                    <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    {field.helpText}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'select':
        return (
          <FormField
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-foreground">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <Select 
                  onValueChange={formField.onChange} 
                  defaultValue={formField.value}
                  data-testid={`select-${field.name}`}
                >
                  <FormControl>
                    <SelectTrigger className="min-h-[44px]">
                      <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.helpText && (
                  <FormDescription className="flex items-start gap-2">
                    <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    {field.helpText}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'radio':
        return (
          <FormField
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-foreground mb-3">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={formField.onChange}
                    defaultValue={formField.value}
                    className="space-y-3"
                    data-testid={`radio-group-${field.name}`}
                  >
                    {field.options?.map((option) => (
                      <div 
                        key={option.value} 
                        className="flex items-center gap-3 p-3 rounded-md border border-input hover:bg-muted min-h-[44px]"
                      >
                        <RadioGroupItem 
                          value={option.value} 
                          id={`${field.name}-${option.value}`}
                          className="w-5 h-5"
                          data-testid={`radio-${field.name}-${option.value}`}
                        />
                        <Label 
                          htmlFor={`${field.name}-${option.value}`}
                          className="text-sm text-foreground cursor-pointer"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                {field.helpText && (
                  <FormDescription className="flex items-start gap-2">
                    <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    {field.helpText}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'checkbox':
        return (
          <FormField
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <div className="flex items-start gap-3 p-3 rounded-md border border-input hover:bg-muted">
                  <FormControl>
                    <Checkbox
                      checked={formField.value}
                      onCheckedChange={formField.onChange}
                      className="w-5 h-5 mt-0.5 min-w-[20px] min-h-[20px]"
                      data-testid={`checkbox-${field.name}`}
                    />
                  </FormControl>
                  <div className="flex-1">
                    <FormLabel className="text-sm font-semibold text-foreground block mb-1 cursor-pointer">
                      {field.label}
                    </FormLabel>
                    {field.helpText && (
                      <FormDescription className="text-xs">
                        {field.helpText}
                      </FormDescription>
                    )}
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'bmi':
        return (
          <div className="space-y-6">
            {/* Height Input */}
            <div>
              <Label className="text-sm font-semibold text-foreground mb-2 block">
                Height <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Feet"
                    className="pr-12 min-h-[44px]"
                    {...form.register('height_ft')}
                    data-testid="input-height-ft"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">ft</span>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Inches"
                    className="pr-12 min-h-[44px]"
                    {...form.register('height_in')}
                    data-testid="input-height-in"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">in</span>
                </div>
              </div>
            </div>

            {/* Weight Input */}
            <div>
              <Label className="text-sm font-semibold text-foreground mb-2 block">
                Weight <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="Enter weight"
                  className="pr-12 min-h-[44px]"
                  {...form.register('weight')}
                  data-testid="input-weight"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">lbs</span>
              </div>
            </div>

            {/* Calculated BMI Display */}
            {bmiData && (
              <Card className="bg-accent/10 border-accent/30" data-testid="bmi-result">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-accent mb-1">
                        Body Mass Index (BMI)
                      </div>
                      <div className="text-2xl font-bold text-foreground" data-testid="text-bmi-value">
                        {bmiData.bmi}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        className={`gap-2 ${
                          bmiData.category === 'Normal Range' 
                            ? 'bg-accent text-accent-foreground' 
                            : 'bg-secondary text-secondary-foreground'
                        }`}
                        data-testid="badge-bmi-category"
                      >
                        <CheckCircle className="w-3 h-3" />
                        {bmiData.category}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">18.5 - 24.9</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return (
          <div className="text-muted-foreground text-sm">
            Unsupported field type: {field.type}
          </div>
        );
    }
  };

  return renderField();
}

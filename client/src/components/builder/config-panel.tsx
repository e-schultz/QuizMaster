import { useState } from "react";
import { Assessment } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Info, 
  Shield, 
  GitBranch, 
  Zap, 
  Plus, 
  Trash2,
  ArrowRight,
  RotateCcw,
  Check,
  Settings
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ConfigPanelProps {
  assessment: Assessment;
  currentStepId: string | null;
}

export default function ConfigPanel({ assessment, currentStepId }: ConfigPanelProps) {
  const [activeTab, setActiveTab] = useState("settings");

  if (!currentStepId) {
    return (
      <aside className="w-96 bg-card border-l border-border flex items-center justify-center">
        <div className="text-center text-muted-foreground p-8">
          <p>Select a step to configure</p>
        </div>
      </aside>
    );
  }

  const currentStep = assessment.steps[currentStepId];
  if (!currentStep) {
    return (
      <aside className="w-96 bg-card border-l border-border flex items-center justify-center">
        <div className="text-center text-muted-foreground p-8">
          <p>Step not found</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-96 bg-card border-l border-border flex flex-col overflow-hidden" data-testid="config-panel">
      {/* Config Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
          Step Configuration
        </h2>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted p-1">
            <TabsTrigger 
              value="settings" 
              className="text-xs px-2 py-1.5"
              data-testid="tab-settings"
            >
              Settings
            </TabsTrigger>
            <TabsTrigger 
              value="fields" 
              className="text-xs px-2 py-1.5"
              data-testid="tab-fields"
            >
              Fields
            </TabsTrigger>
            <TabsTrigger 
              value="rules" 
              className="text-xs px-2 py-1.5"
              data-testid="tab-rules"
            >
              Rules
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Config Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} className="h-full">
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="p-4 space-y-6 mt-0 h-full overflow-y-auto">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Info className="text-primary w-4 h-4" />
                Basic Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide">
                    Step Title <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    value={currentStep.title}
                    className="mt-1.5"
                    data-testid="input-step-title"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide">
                    Step Key
                  </Label>
                  <Input 
                    value={currentStep.key}
                    className="mt-1.5 bg-muted font-mono"
                    readOnly
                    data-testid="input-step-key"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Auto-generated, read-only</p>
                </div>

                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide">
                    Description
                  </Label>
                  <Textarea 
                    rows={3}
                    className="mt-1.5 resize-none"
                    placeholder="Describe what information is collected in this step..."
                    value={currentStep.description || ''}
                    data-testid="textarea-step-description"
                  />
                </div>
              </div>
            </div>

            {/* Validation Settings */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Shield className="text-accent w-4 h-4" />
                Validation
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="required-step" defaultChecked data-testid="checkbox-required-step" />
                  <Label htmlFor="required-step" className="text-sm">Required step</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="validate-blur" defaultChecked data-testid="checkbox-validate-blur" />
                  <Label htmlFor="validate-blur" className="text-sm">Validate on blur</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="allow-skip" data-testid="checkbox-allow-skip" />
                  <Label htmlFor="allow-skip" className="text-sm">Allow skip</Label>
                </div>
              </div>
            </div>

            {/* Conditional Traversal */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <GitBranch className="text-primary w-4 h-4" />
                  Conditional Routing
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-primary hover:underline h-auto p-1"
                  data-testid="button-add-rule"
                >
                  + Add Rule
                </Button>
              </div>

              <div className="space-y-3">
                {/* Existing Rule */}
                <Card className="border-border bg-muted/30">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-foreground mb-1">Rule 1</div>
                        <div className="text-xs font-mono text-muted-foreground bg-card px-2 py-1 rounded">
                          smoker === true
                        </div>
                      </div>
                      <Button 
                        size="icon"
                        variant="ghost"
                        className="w-6 h-6 text-muted-foreground hover:text-destructive"
                        data-testid="button-delete-rule"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-2">
                      <ArrowRight className="text-primary w-3 h-3" />
                      <span className="text-muted-foreground">Go to:</span>
                      <span className="font-medium text-foreground">Smoking History</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Default Route */}
                <Card className="border-dashed">
                  <CardContent className="p-3">
                    <div className="text-xs font-semibold text-foreground mb-1">Default (Fallback)</div>
                    <div className="flex items-center gap-2 text-xs">
                      <ArrowRight className="text-muted-foreground w-3 h-3" />
                      <span className="text-muted-foreground">Go to:</span>
                      <Select defaultValue="next" data-testid="select-fallback-route">
                        <SelectTrigger className="h-6 text-xs border-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="next">Next step in order</SelectItem>
                          <SelectItem value="contact">Contact Details</SelectItem>
                          <SelectItem value="vitals">Skip to Vitals</SelectItem>
                          <SelectItem value="end">End assessment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Actions */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Zap className="text-accent w-4 h-4" />
                On Complete Actions
              </h3>

              <Button 
                variant="outline"
                className="w-full gap-2 border-dashed hover:border-primary hover:bg-primary/5 hover:text-primary min-h-[44px]"
                data-testid="button-add-action"
              >
                <Plus className="w-4 h-4" />
                <span>Add Action</span>
              </Button>
            </div>
          </TabsContent>

          {/* Fields Tab */}
          <TabsContent value="fields" className="p-4 space-y-4 mt-0 h-full overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Form Fields</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-primary hover:underline h-auto p-1"
                data-testid="button-add-field"
              >
                + Add Field
              </Button>
            </div>

            {/* Field List */}
            <div className="space-y-2">
              {currentStep.fields.map((field, index) => (
                <Card key={field.name} className="border-border hover:border-primary bg-muted/30">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-4 h-4 p-0 drag-handle text-muted-foreground hover:text-foreground mt-1"
                        data-testid={`drag-field-${field.name}`}
                      >
                        <GripVertical className="w-3 h-3" />
                      </Button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">{field.label}</span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-primary/10 text-primary">
                            {field.type}
                          </span>
                          {field.required && <span className="text-destructive text-xs">*</span>}
                          {field.visibility && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <GitBranch className="text-primary w-3 h-3" />
                              </TooltipTrigger>
                              <TooltipContent>Has visibility conditions</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono truncate">{field.name}</div>
                        {field.visibility && (
                          <div className="text-xs text-primary mt-1">
                            <Info className="w-3 h-3 inline mr-1" />
                            Shows when: condition defined
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-7 h-7 text-muted-foreground hover:text-foreground"
                          data-testid={`edit-field-${field.name}`}
                        >
                          <Settings className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-7 h-7 text-muted-foreground hover:text-destructive"
                          data-testid={`delete-field-${field.name}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add Field Button */}
              <Button
                variant="outline"
                className="w-full gap-2 border-dashed hover:border-primary hover:bg-primary/5 hover:text-primary min-h-[44px]"
                data-testid="button-add-new-field"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">Add New Field</span>
              </Button>
            </div>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="p-4 space-y-4 mt-0 h-full overflow-y-auto">
            <h3 className="text-sm font-semibold text-foreground">Conditional Logic</h3>
            <p className="text-xs text-muted-foreground">
              Define visibility and traversal rules for dynamic form behavior.
            </p>
            
            <div className="text-center py-8 text-muted-foreground">
              <GitBranch className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Rules configuration will be implemented here</p>
            </div>
          </TabsContent>

        </Tabs>
      </div>

      {/* Config Footer */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 gap-2 min-h-[44px]"
            data-testid="button-reset-config"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button 
            className="flex-1 gap-2 min-h-[44px]"
            data-testid="button-apply-config"
          >
            <Check className="w-4 h-4" />
            Apply
          </Button>
        </div>
      </div>
    </aside>
  );
}

const GripVertical = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.5 4.625C6.12132 4.625 6.625 4.12132 6.625 3.5C6.625 2.87868 6.12132 2.375 5.5 2.375C4.87868 2.375 4.375 2.87868 4.375 3.5C4.375 4.12132 4.87868 4.625 5.5 4.625ZM9.5 4.625C10.1213 4.625 10.625 4.12132 10.625 3.5C10.625 2.87868 10.1213 2.375 9.5 2.375C8.87868 2.375 8.375 2.87868 8.375 3.5C8.375 4.12132 8.87868 4.625 9.5 4.625ZM6.625 7.5C6.625 8.12132 6.12132 8.625 5.5 8.625C4.87868 8.625 4.375 8.12132 4.375 7.5C4.375 6.87868 4.87868 6.375 5.5 6.375C6.12132 6.375 6.625 6.87868 6.625 7.5ZM9.5 8.625C10.1213 8.625 10.625 8.12132 10.625 7.5C10.625 6.87868 10.1213 6.375 9.5 6.375C8.87868 6.375 8.375 6.87868 8.375 7.5C8.375 8.12132 8.87868 8.625 9.5 8.625ZM6.625 11.5C6.625 12.1213 6.12132 12.625 5.5 12.625C4.87868 12.625 4.375 12.1213 4.375 11.5C4.375 10.8787 4.87868 10.375 5.5 10.375C6.12132 10.375 6.625 10.8787 6.625 11.5ZM9.5 12.625C10.1213 12.625 10.625 12.1213 10.625 11.5C10.625 10.8787 10.1213 10.375 9.5 10.375C8.87868 10.375 8.375 10.8787 8.375 11.5C8.375 12.1213 8.87868 12.625 9.5 12.625Z"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
    ></path>
  </svg>
);

import { Assessment } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Settings } from "lucide-react";
import FormRenderer from "@/components/forms/form-renderer";
import { useState } from "react";

interface PreviewProps {
  assessment: Assessment;
  currentStepId: string | null;
}

export default function Preview({ assessment, currentStepId }: PreviewProps) {
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, any>>({});

  if (!currentStepId) {
    return (
      <main className="flex-1 bg-background overflow-y-auto flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Select a step from the navigator to preview</p>
        </div>
      </main>
    );
  }

  const currentStep = assessment.steps[currentStepId];
  if (!currentStep) {
    return (
      <main className="flex-1 bg-background overflow-y-auto flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Step not found</p>
        </div>
      </main>
    );
  }

  const currentGroup = assessment.groups.find(group => 
    group.steps.some(step => step.id === currentStepId)
  );

  const totalSteps = Object.keys(assessment.steps).length;
  const stepIndex = Object.keys(assessment.steps).indexOf(currentStepId) + 1;
  const progressPercentage = Math.round((stepIndex / totalSteps) * 100);

  return (
    <main className="flex-1 bg-background overflow-y-auto" data-testid="preview-panel">
      <div className="max-w-4xl mx-auto p-8">
        {/* Preview Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Step {stepIndex} of {totalSteps}
                  </Badge>
                  {currentGroup && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{currentGroup.title}</span>
                    </>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-preview-title">
                  {currentStep.title}
                </h2>
                {currentStep.description && (
                  <p className="text-muted-foreground" data-testid="text-preview-description">
                    {currentStep.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="w-10 h-10"
                  title="Edit step settings"
                  data-testid="button-edit-step-settings"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <Progress value={progressPercentage} className="h-2" />
          </CardContent>
        </Card>

        {/* Form Preview */}
        <Card>
          <CardContent className="p-8">
            <FormRenderer
              step={currentStep}
              answers={previewAnswers}
              onAnswersChange={setPreviewAnswers}
              isPreview={true}
              data-testid="form-preview"
            />
          </CardContent>
        </Card>

        {/* Form Navigation */}
        <div className="flex items-center justify-between mt-8 gap-4">
          <Button 
            variant="outline" 
            className="gap-2 min-h-[44px]"
            disabled={stepIndex === 1}
            data-testid="button-preview-previous"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            Auto-saving...
          </div>

          <Button 
            className="gap-2 min-h-[44px]"
            data-testid="button-preview-continue"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </main>
  );
}

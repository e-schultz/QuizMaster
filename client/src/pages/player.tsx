import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Assessment, Session } from "@shared/schema";
import FormRenderer from "@/components/forms/form-renderer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Save, HelpCircle, CheckCircle, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Player() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);

  const { data: assessment, isLoading } = useQuery<Assessment>({
    queryKey: ["/api/assessments", id],
    enabled: !!id,
  });

  const { data: session } = useQuery<Session>({
    queryKey: ["/api/sessions", sessionId],
    enabled: !!sessionId,
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data: { assessmentId: string; currentStepId: string; answers: Record<string, Record<string, any>> }) => {
      const response = await apiRequest("POST", "/api/sessions", data);
      return response.json();
    },
    onSuccess: (newSession: Session) => {
      setSessionId(newSession.id);
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ sessionId, updates }: { sessionId: string; updates: Partial<Session> }) => {
      const response = await apiRequest("PUT", `/api/sessions/${sessionId}`, updates);
      return response.json();
    },
  });

  // Initialize session when assessment loads
  if (assessment && !session && !sessionId && !createSessionMutation.isPending) {
    const firstGroup = assessment.groups[0];
    const firstStep = firstGroup?.steps[0];
    if (firstStep) {
      createSessionMutation.mutate({
        assessmentId: assessment.id,
        currentStepId: firstStep.id,
        answers: {}
      });
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Assessment Not Found</h2>
          <p className="text-muted-foreground">The requested assessment could not be found.</p>
        </div>
      </div>
    );
  }

  if (assessment.status !== 'published') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Assessment Not Available</h2>
          <p className="text-muted-foreground">This assessment has not been published yet.</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing session...</p>
        </div>
      </div>
    );
  }

  const currentStep = assessment.steps[session.currentStepId];
  const totalSteps = Object.keys(assessment.steps).length;
  const completedSteps = Object.keys(session.answers).length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  const currentGroup = assessment.groups.find(group => 
    group.steps.some(step => step.id === session.currentStepId)
  );

  const stepIndex = Object.keys(assessment.steps).indexOf(session.currentStepId) + 1;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        
        {/* Player Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <CheckCircle className="w-4 h-4" />
            <span>Patient Assessment</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-assessment-title">
            {assessment.title}
          </h1>
          <p className="text-muted-foreground">
            Please complete all sections to continue with your appointment
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-foreground">Overall Progress</span>
              <span className="text-sm font-semibold text-primary" data-testid="text-progress-percentage">
                {progressPercentage}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3 mb-4" />
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span>{completedSteps} completed</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="w-4 h-4 text-primary fill-current" />
                <span>1 in progress</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="w-4 h-4 text-border" />
                <span>{totalSteps - completedSteps - 1} remaining</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Step Card */}
        <Card className="overflow-hidden">
          {/* Step Header */}
          <CardHeader className="bg-primary/5 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wide text-primary">
                Step {stepIndex} of {totalSteps}
              </Badge>
              {currentGroup && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{currentGroup.title}</span>
                </>
              )}
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-step-title">
              {currentStep?.title}
            </h2>
            {currentStep?.description && (
              <p className="text-muted-foreground" data-testid="text-step-description">
                {currentStep.description}
              </p>
            )}
          </CardHeader>

          {/* Step Content */}
          <CardContent className="p-8">
            {currentStep && (
              <FormRenderer
                step={currentStep}
                answers={session.answers[currentStep.key] || {}}
                onAnswersChange={(answers) => {
                  const updatedAnswers = {
                    ...session.answers,
                    [currentStep.key]: answers
                  };
                  updateSessionMutation.mutate({
                    sessionId: session.id,
                    updates: { answers: updatedAnswers }
                  });
                }}
                data-testid="form-current-step"
              />
            )}
          </CardContent>

          {/* Step Footer */}
          <div className="bg-muted/30 border-t border-border px-8 py-6">
            <div className="flex items-center justify-between gap-4">
              <Button 
                variant="outline" 
                className="gap-2 min-h-[44px]"
                disabled={stepIndex === 1}
                data-testid="button-previous"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Previous</span>
              </Button>

              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  className="gap-2 min-h-[44px]"
                  onClick={() => {
                    toast({
                      title: "Progress Saved",
                      description: "Your answers have been saved. You can continue later.",
                    });
                  }}
                  data-testid="button-save-exit"
                >
                  <Save className="w-5 h-5" />
                  <span className="hidden sm:inline">Save & Exit</span>
                </Button>

                <Button 
                  className="gap-2 min-h-[44px]" 
                  size="lg"
                  data-testid="button-continue"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <button 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            data-testid="button-help"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Need help? Contact support</span>
          </button>
        </div>
      </div>
    </div>
  );
}

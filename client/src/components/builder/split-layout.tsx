import { useState, useEffect } from "react";
import { Assessment } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Save, 
  Rocket, 
  Zap, 
  GitBranch,
  ClipboardList,
  User
} from "lucide-react";
import Navigator from "./navigator";
import Preview from "./preview";
import ConfigPanel from "./config-panel";
import { useBuilderStore } from "@/store/builder-store";
import { useToast } from "@/hooks/use-toast";

interface SplitLayoutProps {
  assessment: Assessment;
}

export default function SplitLayout({ assessment }: SplitLayoutProps) {
  const { toast } = useToast();
  const { 
    currentStepId, 
    setCurrentStepId, 
    isDirty, 
    setDirty,
    saveAssessment,
    publishAssessment 
  } = useBuilderStore();

  // Set first step as current if none selected
  useEffect(() => {
    if (!currentStepId && assessment.groups.length > 0) {
      const firstStep = assessment.groups[0].steps[0];
      if (firstStep) {
        setCurrentStepId(firstStep.id);
      }
    }
  }, [assessment, currentStepId, setCurrentStepId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // TODO: Open quick actions modal
        toast({
          title: "Quick Actions",
          description: "Quick actions modal will be implemented here",
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSave = async () => {
    try {
      await saveAssessment(assessment);
      toast({
        title: "Assessment Saved",
        description: "Your changes have been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Could not save assessment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePublish = async () => {
    try {
      await publishAssessment(assessment);
      toast({
        title: "Assessment Published",
        description: "Your assessment is now live and ready for use",
      });
    } catch (error) {
      toast({
        title: "Publish Failed",
        description: "Could not publish assessment. Please fix any validation errors.",
        variant: "destructive",
      });
    }
  };

  const totalSteps = Object.keys(assessment.steps).length;

  return (
    <div className="flex flex-col h-screen">
      
      {/* Top Navigation Bar */}
      <header 
        className="bg-card border-b border-border flex items-center justify-between px-6 py-3 shadow-sm sticky top-0 z-50"
        data-testid="header-builder"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <ClipboardList className="text-primary text-2xl" />
            <div>
              <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
                {assessment.title}
                {isDirty && (
                  <span className="text-destructive" title="Unsaved changes">*</span>
                )}
              </h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge 
                  variant={assessment.status === 'published' ? 'default' : 'secondary'}
                  className={assessment.status === 'draft' ? 'animate-pulse' : ''}
                >
                  {assessment.status}
                </Badge>
                <span>•</span>
                <span>Version {assessment.version}</span>
                <span>•</span>
                <span>Last saved 2 minutes ago</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Action */}
          <Button 
            variant="outline" 
            className="gap-2 min-h-[44px]" 
            title="Quick Actions (Cmd/Ctrl+K)"
            data-testid="button-quick-actions"
          >
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Actions</span>
            <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-mono">⌘K</kbd>
          </Button>

          {/* View Flow Map */}
          <Button 
            variant="outline" 
            className="gap-2 min-h-[44px]"
            data-testid="button-flow-map"
          >
            <GitBranch className="w-4 h-4" />
            <span className="hidden sm:inline">Flow Map</span>
          </Button>

          {/* Save */}
          <Button 
            variant="secondary" 
            className="gap-2 min-h-[44px]"
            onClick={handleSave}
            disabled={!isDirty}
            data-testid="button-save"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
            <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary-foreground/20 text-secondary-foreground text-xs font-mono">⌘S</kbd>
          </Button>

          {/* Publish */}
          <Button 
            className="gap-2 min-h-[44px]"
            onClick={handlePublish}
            data-testid="button-publish"
          >
            <Rocket className="w-4 h-4" />
            <span>Publish</span>
          </Button>

          {/* User Menu */}
          <Button 
            size="icon"
            className="rounded-full min-w-[44px] min-h-[44px]"
            data-testid="button-user-menu"
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Split View Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT PANEL: Navigator */}
        <Navigator 
          assessment={assessment} 
          currentStepId={currentStepId}
          onStepSelect={setCurrentStepId}
        />

        {/* CENTER PANEL: Live Preview */}
        <Preview 
          assessment={assessment}
          currentStepId={currentStepId}
        />

        {/* RIGHT PANEL: Config Panel */}
        <ConfigPanel 
          assessment={assessment}
          currentStepId={currentStepId}
        />

      </div>
    </div>
  );
}

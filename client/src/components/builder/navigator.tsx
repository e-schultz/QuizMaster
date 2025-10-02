import { useState } from "react";
import { Assessment } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  GripVertical, 
  ChevronDown, 
  ChevronRight, 
  Folder, 
  FileText, 
  Plus, 
  PlusCircle,
  CheckCircle,
  AlertTriangle,
  Combine
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface NavigatorProps {
  assessment: Assessment;
  currentStepId: string | null;
  onStepSelect: (stepId: string) => void;
}

export default function Navigator({ assessment, currentStepId, onStepSelect }: NavigatorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(assessment.groups.map(g => g.id)));

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const collapseAll = () => {
    setExpandedGroups(new Set());
  };

  const expandAll = () => {
    setExpandedGroups(new Set(assessment.groups.map(g => g.id)));
  };

  const totalSteps = Object.keys(assessment.steps).length;
  const validationErrors = 1; // TODO: Calculate actual errors

  const filteredGroups = assessment.groups.filter(group => {
    if (!searchTerm) return true;
    const groupMatch = group.title.toLowerCase().includes(searchTerm.toLowerCase());
    const stepMatch = group.steps.some(stepRef => {
      const step = assessment.steps[stepRef.id];
      return step?.title.toLowerCase().includes(searchTerm.toLowerCase());
    });
    return groupMatch || stepMatch;
  });

  return (
    <aside className="w-72 bg-card border-r border-border flex flex-col overflow-hidden" data-testid="navigator-panel">
      {/* Navigator Header */}
      <div className="p-4 border-b border-border bg-muted/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Structure</h2>
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8"
            onClick={expandedGroups.size > 0 ? collapseAll : expandAll}
            title="Collapse all"
            data-testid="button-toggle-all"
          >
            <Combine className="w-3 h-3" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search steps..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-steps"
          />
        </div>
      </div>

      {/* Navigator Tree */}
      <div className="flex-1 overflow-y-auto p-2" data-testid="navigator-tree">
        <div className="space-y-2">
          {filteredGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.id);
            
            return (
              <div key={group.id}>
                {/* Group Header */}
                <div className="group flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted cursor-pointer">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-4 h-4 p-0 drag-handle text-muted-foreground hover:text-foreground"
                    data-testid={`drag-group-${group.id}`}
                  >
                    <GripVertical className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-4 h-4 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => toggleGroup(group.id)}
                    data-testid={`toggle-group-${group.id}`}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                  </Button>
                  <Folder className="text-primary w-4 h-4" />
                  <span className="text-sm font-medium text-foreground flex-1">{group.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {group.steps.length}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-4 h-4 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                    data-testid={`add-step-${group.id}`}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>

                {/* Steps in Group */}
                {isExpanded && (
                  <div className="ml-6 space-y-1 mt-1">
                    {group.steps.map((stepRef) => {
                      const step = assessment.steps[stepRef.id];
                      if (!step) return null;

                      const isSelected = currentStepId === step.id;
                      const hasValidationError = step.id === 'insurance_info'; // TODO: Real validation

                      return (
                        <div
                          key={step.id}
                          className={cn(
                            "group flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer",
                            isSelected 
                              ? "bg-primary/10 border-l-2 border-primary" 
                              : "hover:bg-muted"
                          )}
                          onClick={() => onStepSelect(step.id)}
                          data-testid={`step-${step.id}`}
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-4 h-4 p-0 drag-handle text-muted-foreground hover:text-foreground"
                            data-testid={`drag-step-${step.id}`}
                          >
                            <GripVertical className="w-3 h-3" />
                          </Button>
                          <FileText className={cn(
                            "w-4 h-4",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )} />
                          <span className={cn(
                            "text-sm flex-1",
                            isSelected ? "font-medium text-foreground" : "text-foreground"
                          )}>
                            {step.title}
                          </span>
                          {hasValidationError ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertTriangle className="text-destructive w-3 h-3" />
                              </TooltipTrigger>
                              <TooltipContent>Has validation errors</TooltipContent>
                            </Tooltip>
                          ) : step.id === 'personal_info' ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <CheckCircle className="text-accent w-3 h-3" />
                              </TooltipTrigger>
                              <TooltipContent>Valid</TooltipContent>
                            </Tooltip>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Group Button */}
        <Button
          variant="outline"
          className="w-full flex items-center gap-2 mt-4 border-2 border-dashed hover:border-primary hover:bg-primary/5 hover:text-primary min-h-[44px]"
          data-testid="button-add-group"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Add Section Group</span>
        </Button>
      </div>

      {/* Navigator Footer */}
      <div className="p-3 border-t border-border bg-muted/30">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center justify-between">
            <span>Total Steps:</span>
            <span className="font-semibold text-foreground" data-testid="text-total-steps">
              {totalSteps}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Validation Status:</span>
            <span 
              className={cn(
                "font-medium",
                validationErrors > 0 ? "text-destructive" : "text-accent"
              )}
              data-testid="text-validation-status"
            >
              {validationErrors > 0 ? `${validationErrors} error${validationErrors !== 1 ? 's' : ''}` : 'All valid'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

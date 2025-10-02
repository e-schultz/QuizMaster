import { useMemo, useCallback } from "react";
import { Assessment } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap,
  Node,
  Edge,
  MarkerType,
  Position,
  useNodesState,
  useEdgesState
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AlertTriangle, GitBranch, CheckCircle, Play } from "lucide-react";
import { validateReachability } from "@/lib/traversal-evaluator";

interface FlowMapDialogProps {
  assessment: Assessment;
  isOpen: boolean;
  onClose: () => void;
  currentStepId?: string | null;
}

const nodeTypes = {
  step: StepNode,
  group: GroupNode,
};

function StepNode({ data }: { data: any }) {
  const isUnreachable = data.isUnreachable;
  const isCurrent = data.isCurrent;
  const hasConditional = data.hasConditional;

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 shadow-md min-w-[180px] transition-all ${
        isUnreachable
          ? "border-destructive bg-destructive/10 opacity-60"
          : isCurrent
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:border-primary/50"
      }`}
      data-testid={`flow-node-${data.stepId}`}
    >
      <div className="flex items-center gap-2 mb-1">
        {isCurrent && <Play className="w-3 h-3 text-primary fill-current" />}
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {data.groupTitle}
        </span>
      </div>
      <div className="font-semibold text-foreground mb-2">{data.label}</div>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="text-xs">
          {data.fieldCount} fields
        </Badge>
        {hasConditional && (
          <Badge variant="secondary" className="text-xs gap-1">
            <GitBranch className="w-3 h-3" />
            Conditional
          </Badge>
        )}
        {isUnreachable && (
          <Badge variant="destructive" className="text-xs gap-1">
            <AlertTriangle className="w-3 h-3" />
            Unreachable
          </Badge>
        )}
      </div>
    </div>
  );
}

function GroupNode({ data }: { data: any }) {
  return (
    <div className="px-6 py-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 min-w-[200px]">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-primary" />
        <span className="font-bold text-primary text-lg">{data.label}</span>
      </div>
      {data.description && (
        <p className="text-xs text-muted-foreground mt-2">{data.description}</p>
      )}
      <div className="text-xs text-primary mt-2">
        {data.stepCount} steps
      </div>
    </div>
  );
}

export default function FlowMapDialog({ 
  assessment, 
  isOpen, 
  onClose, 
  currentStepId 
}: FlowMapDialogProps) {
  
  // Validate reachability
  const { reachableSteps, unreachableSteps } = useMemo(
    () => validateReachability(assessment),
    [assessment]
  );

  // Convert assessment to nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    let yOffset = 0;
    const groupSpacing = 250;
    const stepSpacing = 120;
    const xOffset = 50;

    // Create nodes for each group and its steps
    assessment.groups.forEach((group, groupIndex) => {
      // Add group header node
      nodes.push({
        id: `group-${group.id}`,
        type: 'group',
        position: { x: xOffset, y: yOffset },
        data: {
          label: group.title,
          description: group.description,
          stepCount: group.steps.length,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });

      yOffset += 100;

      // Add step nodes for this group
      group.steps.forEach((stepRef, stepIndex) => {
        const step = assessment.steps[stepRef.id];
        if (!step) return;

        const isUnreachable = unreachableSteps.includes(step.id);
        const isCurrent = currentStepId === step.id;
        const hasConditional = (step.traversal && step.traversal.length > 0) || !!step.fallbackNext;

        nodes.push({
          id: step.id,
          type: 'step',
          position: { x: xOffset + 100, y: yOffset },
          data: {
            label: step.title,
            stepId: step.id,
            groupTitle: group.title,
            fieldCount: step.fields.length,
            isUnreachable,
            isCurrent,
            hasConditional,
          },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        });

        // Add edge from group to step
        edges.push({
          id: `group-${group.id}-to-${step.id}`,
          source: `group-${group.id}`,
          target: step.id,
          type: 'default',
          animated: false,
          style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '5,5' },
        });

        // Add traversal edges
        if (step.traversal && step.traversal.length > 0) {
          step.traversal.forEach((rule, ruleIndex) => {
            if (rule.go.type === 'step' && rule.go.id) {
              edges.push({
                id: `${step.id}-rule-${ruleIndex}-${rule.go.id}`,
                source: step.id,
                target: rule.go.id,
                type: 'default',
                animated: true,
                label: `Condition ${ruleIndex + 1}`,
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: 'hsl(var(--primary))',
                },
                style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
              });
            } else if (rule.go.type === 'end') {
              // Create end node if it doesn't exist
              if (!nodes.find(n => n.id === 'end')) {
                nodes.push({
                  id: 'end',
                  type: 'step',
                  position: { x: xOffset + 100 + (assessment.groups.length * 300), y: yOffset },
                  data: {
                    label: 'End Assessment',
                    stepId: 'end',
                    groupTitle: 'System',
                    fieldCount: 0,
                    isUnreachable: false,
                    isCurrent: false,
                    hasConditional: false,
                  },
                  sourcePosition: Position.Right,
                  targetPosition: Position.Left,
                });
              }
              
              edges.push({
                id: `${step.id}-rule-${ruleIndex}-end`,
                source: step.id,
                target: 'end',
                type: 'default',
                animated: true,
                label: 'End',
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: 'hsl(var(--accent))',
                },
                style: { stroke: 'hsl(var(--accent))', strokeWidth: 2 },
              });
            }
          });
        }

        // Add fallback edge
        if (step.fallbackNext) {
          if (step.fallbackNext.type === 'step' && step.fallbackNext.id) {
            edges.push({
              id: `${step.id}-fallback-${step.fallbackNext.id}`,
              source: step.id,
              target: step.fallbackNext.id,
              type: 'default',
              animated: false,
              label: 'Default',
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: 'hsl(var(--muted-foreground))',
              },
              style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2, strokeDasharray: '5,5' },
            });
          }
        } else if (stepIndex < group.steps.length - 1) {
          // Natural flow to next step in group
          const nextStepId = group.steps[stepIndex + 1].id;
          edges.push({
            id: `${step.id}-next-${nextStepId}`,
            source: step.id,
            target: nextStepId,
            type: 'default',
            animated: false,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: 'hsl(var(--muted-foreground))',
            },
            style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 },
          });
        } else if (groupIndex < assessment.groups.length - 1) {
          // Natural flow to first step of next group
          const nextGroup = assessment.groups[groupIndex + 1];
          if (nextGroup.steps.length > 0) {
            edges.push({
              id: `${step.id}-next-${nextGroup.steps[0].id}`,
              source: step.id,
              target: nextGroup.steps[0].id,
              type: 'default',
              animated: false,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: 'hsl(var(--muted-foreground))',
              },
              style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 },
            });
          }
        }

        yOffset += stepSpacing;
      });

      yOffset += groupSpacing - (group.steps.length * stepSpacing);
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [assessment, currentStepId, unreachableSteps]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onInit = useCallback((instance: any) => {
    // Fit view to show all nodes
    setTimeout(() => {
      instance.fitView({ padding: 0.2 });
    }, 10);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[85vh]" data-testid="dialog-flow-map">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Assessment Flow Map
          </DialogTitle>
        </DialogHeader>

        {/* Validation Warnings */}
        {unreachableSteps.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> {unreachableSteps.length} step{unreachableSteps.length !== 1 ? 's are' : ' is'} unreachable and will never be shown to users. Review your conditional routing to ensure all steps are accessible.
            </AlertDescription>
          </Alert>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-primary bg-primary/10 rounded" />
            <span>Current Step</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-border bg-card rounded" />
            <span>Normal Step</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-destructive bg-destructive/10 rounded" />
            <span>Unreachable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-primary" />
            <span>Conditional</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-muted-foreground border-dashed" style={{ borderTop: '2px dashed' }} />
            <span>Default</span>
          </div>
        </div>

        {/* Flow Visualization */}
        <div className="flex-1 border border-border rounded-lg overflow-hidden bg-muted/30">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onInit={onInit}
            fitView
            attributionPosition="bottom-left"
            colorMode="light"
            proOptions={{ hideAttribution: true }}
          >
            <Background color="hsl(var(--muted-foreground))" gap={16} />
            <Controls />
            <MiniMap 
              nodeColor={(node) => {
                if (node.data?.isUnreachable) return 'hsl(var(--destructive))';
                if (node.data?.isCurrent) return 'hsl(var(--primary))';
                return 'hsl(var(--border))';
              }}
              className="bg-card border border-border"
            />
          </ReactFlow>
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span className="text-muted-foreground">
                {reachableSteps.size} reachable steps
              </span>
            </div>
            {unreachableSteps.length > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-destructive font-medium">
                  {unreachableSteps.length} unreachable steps
                </span>
              </div>
            )}
          </div>
          <Button onClick={onClose} data-testid="button-close-flow-map">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

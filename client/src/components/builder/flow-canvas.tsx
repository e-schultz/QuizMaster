import { useMemo, useCallback } from "react";
import { Assessment } from "@shared/schema";
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
  Handle,
  useNodesState,
  useEdgesState,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { 
  AlertTriangle, 
  GitBranch, 
  Plus,
  Play,
  Square,
  Type,
  Hash,
  Calendar,
  ChevronDown,
  CheckSquare,
  Circle,
  List,
  Calculator,
} from "lucide-react";
import { validateReachability } from "@/lib/traversal-evaluator";
import { useBuilderStore } from "@/store/builder-store";

interface FlowCanvasProps {
  assessment: Assessment;
}

function getFieldIcon(fieldType: string) {
  const iconClass = "w-3 h-3";
  switch (fieldType) {
    case 'text':
    case 'textarea':
      return <Type className={iconClass} />;
    case 'number':
      return <Hash className={iconClass} />;
    case 'date':
      return <Calendar className={iconClass} />;
    case 'select':
      return <ChevronDown className={iconClass} />;
    case 'checkbox':
      return <CheckSquare className={iconClass} />;
    case 'radio':
      return <Circle className={iconClass} />;
    case 'bmi':
      return <Calculator className={iconClass} />;
    default:
      return <List className={iconClass} />;
  }
}

function StepNode({ data, selected }: { data: any; selected: boolean }) {
  const isUnreachable = data.isUnreachable;
  const hasConditional = data.hasConditional;
  const isStart = data.isStart;
  const isEnd = data.isEnd;
  const fields = data.fields || [];
  const displayFields = fields.slice(0, 4);
  const remainingCount = Math.max(0, fields.length - 4);

  return (
    <>
      {/* Input handle (top) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />

      <div
        className={`px-4 py-3 rounded-lg border-2 shadow-lg min-w-[240px] max-w-[280px] transition-all cursor-pointer ${
          isUnreachable
            ? "border-destructive bg-destructive/10 opacity-60"
            : selected
            ? "border-primary bg-primary/10 shadow-xl ring-2 ring-primary/50"
            : "border-border bg-card hover:border-primary/50 hover:shadow-xl"
        }`}
        data-testid={`flow-node-${data.stepId}`}
      >
        {/* Header with group and start/end badges */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {data.groupTitle}
          </span>
          {isStart && (
            <Badge variant="default" className="text-xs gap-1 bg-green-600 hover:bg-green-700">
              <Play className="w-3 h-3" />
              START
            </Badge>
          )}
          {isEnd && (
            <Badge variant="default" className="text-xs gap-1 bg-red-600 hover:bg-red-700">
              <Square className="w-3 h-3" />
              END
            </Badge>
          )}
        </div>

        {/* Step title */}
        <div className="font-semibold text-foreground mb-2">{data.label}</div>

        {/* Field list preview */}
        {displayFields.length > 0 && (
          <div className="mb-2 space-y-1">
            {displayFields.map((field: any, index: number) => (
              <div key={index} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="text-primary">{getFieldIcon(field.type)}</span>
                <span className="truncate">{field.label}</span>
                {field.validation?.required && (
                  <span className="text-destructive">*</span>
                )}
              </div>
            ))}
            {remainingCount > 0 && (
              <div className="text-xs text-muted-foreground italic pl-5">
                ...and {remainingCount} more
              </div>
            )}
          </div>
        )}

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {data.fieldCount} field{data.fieldCount !== 1 ? 's' : ''}
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

      {/* Output handle (bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />
    </>
  );
}

export default function FlowCanvas({ assessment }: FlowCanvasProps) {
  const { currentStepId, setCurrentStepId, setSelectedEdge } = useBuilderStore();
  
  // Memoize node types to prevent React Flow warnings
  const nodeTypes = useMemo(() => ({ step: StepNode }), []);
  
  // Validate reachability
  const { reachableSteps, unreachableSteps } = useMemo(
    () => validateReachability(assessment),
    [assessment]
  );

  // Convert assessment to nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    let yOffset = 50;
    const groupSpacing = 300;
    const stepSpacing = 150;
    const xOffset = 100;

    // Determine first step (start) and collect all steps to find end nodes
    const firstStep = assessment.groups[0]?.steps[0]?.id;
    const allStepIds = assessment.groups.flatMap(g => g.steps.map(s => s.id));
    const stepsWithOutgoing = new Set<string>();

    // Create nodes for each group and its steps
    assessment.groups.forEach((group, groupIndex) => {
      // Add step nodes for this group
      group.steps.forEach((stepRef, stepIndex) => {
        const step = assessment.steps[stepRef.id];
        if (!step) return;

        const isUnreachable = unreachableSteps.includes(step.id);
        const hasConditional = (step.traversal && step.traversal.length > 0) || !!step.fallbackNext;
        const isStart = step.id === firstStep;

        // Check if this step has outgoing edges (not an end node)
        const hasOutgoing = 
          (step.traversal && step.traversal.length > 0) || 
          !!step.fallbackNext ||
          (stepIndex < group.steps.length - 1) ||
          (groupIndex < assessment.groups.length - 1);

        if (hasOutgoing) {
          stepsWithOutgoing.add(step.id);
        }

        nodes.push({
          id: step.id,
          type: 'step',
          position: { x: xOffset, y: yOffset },
          data: {
            label: step.title,
            stepId: step.id,
            groupTitle: group.title,
            fieldCount: step.fields.length,
            fields: step.fields,
            isUnreachable,
            hasConditional,
            isStart,
            isEnd: !hasOutgoing,
          },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
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
                label: `If condition ${ruleIndex + 1}`,
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: 'hsl(var(--primary))',
                },
                style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
                data: { ruleIndex, stepId: step.id },
              });
            } else if (rule.go.type === 'end') {
              // Create end node if it doesn't exist
              if (!nodes.find(n => n.id === 'end')) {
                nodes.push({
                  id: 'end',
                  type: 'step',
                  position: { x: xOffset + 600, y: yOffset },
                  data: {
                    label: 'End Assessment',
                    stepId: 'end',
                    groupTitle: 'System',
                    fieldCount: 0,
                    fields: [],
                    isUnreachable: false,
                    hasConditional: false,
                    isStart: false,
                    isEnd: true,
                  },
                  sourcePosition: Position.Bottom,
                  targetPosition: Position.Top,
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
                data: { ruleIndex, stepId: step.id },
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
              data: { isFallback: true, stepId: step.id },
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
            data: { isNatural: true },
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
              data: { isNatural: true },
            });
          }
        }

        yOffset += stepSpacing;
      });

      yOffset += groupSpacing - (group.steps.length * stepSpacing);
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [assessment, unreachableSteps]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Handle node selection
  const handleNodeClick = useCallback((_: any, node: Node) => {
    if (node.id !== 'end') {
      setCurrentStepId(node.id);
      setSelectedEdge(null);
    }
  }, [setCurrentStepId, setSelectedEdge]);

  // Handle edge selection
  const handleEdgeClick = useCallback((_: any, edge: Edge) => {
    console.log('Edge clicked:', edge);
    setSelectedEdge(edge);
    setCurrentStepId(null);
  }, [setCurrentStepId, setSelectedEdge]);

  // Handle drag-to-connect (creating new traversal rules)
  const onConnect = useCallback((connection: Connection) => {
    // TODO: Implement create traversal rule
    console.log('Creating new connection:', connection);
    // This would open a dialog to configure the traversal rule
  }, []);

  const onInit = useCallback((instance: any) => {
    // Fit view to show all nodes
    setTimeout(() => {
      instance.fitView({ padding: 0.2 });
    }, 10);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Validation Warnings */}
      {unreachableSteps.length > 0 && (
        <Alert variant="destructive" className="m-4 mb-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Warning:</strong> {unreachableSteps.length} step{unreachableSteps.length !== 1 ? 's are' : ' is'} unreachable
          </AlertDescription>
        </Alert>
      )}

      {/* Legend */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 border-2 border-primary bg-primary/10 rounded" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-primary" />
          <span>Conditional</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-muted-foreground border-dashed" style={{ borderTop: '2px dashed' }} />
          <span>Default</span>
        </div>
      </div>

      {/* Flow Visualization */}
      <div className="flex-1 bg-muted/20">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onInit={onInit}
          fitView
          attributionPosition="bottom-left"
          colorMode="light"
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            type: 'default',
          }}
          elementsSelectable={true}
          selectNodesOnDrag={false}
        >
          <Background color="hsl(var(--muted-foreground))" gap={16} />
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              if (node.data?.isUnreachable) return 'hsl(var(--destructive))';
              if (node.id === currentStepId) return 'hsl(var(--primary))';
              return 'hsl(var(--border))';
            }}
            className="bg-card border border-border"
          />
        </ReactFlow>
      </div>
    </div>
  );
}

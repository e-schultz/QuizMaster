import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Assessment } from "@shared/schema";
import SplitLayout from "@/components/builder/split-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssessment } from "@/hooks/use-assessment";

export default function Builder() {
  const { id } = useParams<{ id?: string }>();
  
  const { data: assessment, isLoading, error } = useQuery<Assessment>({
    queryKey: ["/api/assessments", id],
    enabled: !!id,
  });

  const { 
    currentAssessment, 
    createNewAssessment, 
    isCreatingNew 
  } = useAssessment(assessment);

  // Handle new assessment creation
  if (!id && !currentAssessment && !isCreatingNew) {
    createNewAssessment();
    return <div className="h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Creating new assessment...</p>
      </div>
    </div>;
  }

  if (isLoading || isCreatingNew) {
    return (
      <div className="h-screen bg-background">
        {/* Header Skeleton */}
        <div className="bg-card border-b border-border px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="w-8 h-8" />
              <div>
                <Skeleton className="h-6 w-48 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </div>

        {/* Split Layout Skeleton */}
        <div className="flex h-[calc(100vh-73px)]">
          <div className="w-72 bg-card border-r border-border p-4">
            <Skeleton className="h-6 w-20 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
          <div className="flex-1 p-8">
            <Skeleton className="h-32 w-full mb-6" />
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="w-96 bg-card border-l border-border p-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-destructive mb-2">Error Loading Assessment</h2>
          <p className="text-muted-foreground">
            {id ? `Assessment ${id} could not be loaded` : "Failed to create new assessment"}
          </p>
        </div>
      </div>
    );
  }

  if (!currentAssessment) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Assessment Not Found</h2>
          <p className="text-muted-foreground">The requested assessment could not be found.</p>
        </div>
      </div>
    );
  }

  return <SplitLayout assessment={currentAssessment} />;
}

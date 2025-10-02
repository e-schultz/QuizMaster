import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Assessment } from "@shared/schema";
import { Plus, FolderInput, Copy, Book, Edit, Play, Trash2 } from "lucide-react";

export default function Home() {
  const { data: assessments, isLoading } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="h-2 bg-muted rounded w-full mb-2"></div>
                  <div className="h-2 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!assessments || assessments.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <Card className="p-12">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Plus className="text-primary text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Create Your First Assessment
            </h2>
            <p className="text-muted-foreground mb-8">
              Get started by creating a new assessment or importing an existing one. Build custom forms with conditional logic and branching paths.
            </p>
            <div className="space-y-3">
              <Link href="/builder">
                <Button 
                  className="w-full gap-2 min-h-[44px]" 
                  size="lg"
                  data-testid="button-create-assessment"
                >
                  <Plus className="w-5 h-5" />
                  Create New Assessment
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full gap-2 min-h-[44px]" 
                size="lg"
                data-testid="button-import-assessment"
              >
                <FolderInput className="w-5 h-5" />
                Import Assessment
              </Button>
              <Button 
                variant="outline" 
                className="w-full gap-2 min-h-[44px] border-dashed" 
                size="lg"
                data-testid="button-duplicate-template"
              >
                <Copy className="w-5 h-5" />
                Duplicate Template
              </Button>
            </div>
          </Card>

          <div className="mt-8">
            <a 
              href="#" 
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              data-testid="link-documentation"
            >
              <Book className="w-4 h-4" />
              View Documentation
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Assessment Builder</h1>
            <p className="text-muted-foreground">Create and manage healthcare assessments</p>
          </div>
          <Link href="/builder">
            <Button className="gap-2 min-h-[44px]" data-testid="button-new-assessment">
              <Plus className="w-5 h-5" />
              New Assessment
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((assessment) => (
            <Card 
              key={assessment.id} 
              className="hover:shadow-md transition-shadow"
              data-testid={`card-assessment-${assessment.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{assessment.title}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant={assessment.status === 'published' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {assessment.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Version {assessment.version}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {Object.keys(assessment.steps).length} steps across {assessment.groups.length} groups
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-muted-foreground mb-4">
                  Last updated {new Date(assessment.meta.updatedAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Link href={`/builder/${assessment.id}`} className="flex-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2 min-h-[36px]"
                      data-testid={`button-edit-${assessment.id}`}
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                  </Link>
                  {assessment.status === 'published' && (
                    <Link href={`/player/${assessment.id}`} className="flex-1">
                      <Button 
                        size="sm" 
                        className="w-full gap-2 min-h-[36px]"
                        data-testid={`button-play-${assessment.id}`}
                      >
                        <Play className="w-4 h-4" />
                        Run
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

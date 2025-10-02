import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Assessment, InsertAssessment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { randomUUID } from "crypto";

export function useAssessment(existingAssessment?: Assessment) {
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(
    existingAssessment || null
  );
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (existingAssessment) {
      setCurrentAssessment(existingAssessment);
    }
  }, [existingAssessment]);

  const createNewMutation = useMutation({
    mutationFn: async (data: InsertAssessment) => {
      const response = await apiRequest("POST", "/api/assessments", data);
      return response.json();
    },
    onSuccess: (assessment: Assessment) => {
      setCurrentAssessment(assessment);
      setIsCreatingNew(false);
      queryClient.setQueryData(["/api/assessments", assessment.id], assessment);
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
    },
    onError: () => {
      setIsCreatingNew(false);
    }
  });

  const createNewAssessment = () => {
    if (isCreatingNew) return;
    
    setIsCreatingNew(true);
    
    const newAssessment: InsertAssessment = {
      title: "New Assessment",
      version: 1,
      status: "draft",
      groups: [
        {
          id: randomUUID(),
          title: "Getting Started",
          description: "Basic information collection",
          steps: [
            { id: "welcome-step" }
          ]
        }
      ],
      steps: {
        "welcome-step": {
          id: "welcome-step",
          key: "welcome",
          title: "Welcome",
          description: "Welcome to this assessment. Please provide the requested information.",
          fields: [
            {
              name: "name",
              label: "Full Name",
              type: "text",
              required: true,
              helpText: "Please enter your full legal name"
            }
          ]
        }
      }
    };

    createNewMutation.mutate(newAssessment);
  };

  return {
    currentAssessment,
    createNewAssessment,
    isCreatingNew: isCreatingNew || createNewMutation.isPending,
    createError: createNewMutation.error,
  };
}

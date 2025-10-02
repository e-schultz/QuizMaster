import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { assessmentSchema, insertAssessmentSchema, sessionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Assessment routes
  app.get("/api/assessments", async (req, res) => {
    try {
      const assessments = await storage.listAssessments();
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assessments" });
    }
  });

  app.get("/api/assessments/:id", async (req, res) => {
    try {
      const assessment = await storage.getAssessment(req.params.id);
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assessment" });
    }
  });

  app.post("/api/assessments", async (req, res) => {
    try {
      const validatedData = insertAssessmentSchema.parse(req.body);
      const assessment = await storage.createAssessment(validatedData);
      res.status(201).json(assessment);
    } catch (error) {
      res.status(400).json({ error: "Invalid assessment data", details: error });
    }
  });

  app.put("/api/assessments/:id", async (req, res) => {
    try {
      const updates = assessmentSchema.partial().parse(req.body);
      const assessment = await storage.updateAssessment(req.params.id, updates);
      res.json(assessment);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      res.status(400).json({ error: "Invalid update data", details: error });
    }
  });

  app.delete("/api/assessments/:id", async (req, res) => {
    try {
      await storage.deleteAssessment(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete assessment" });
    }
  });

  // Session routes
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  app.post("/api/sessions", async (req, res) => {
    try {
      const validatedData = sessionSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(req.body);
      const session = await storage.createSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid session data", details: error });
    }
  });

  app.put("/api/sessions/:id", async (req, res) => {
    try {
      const updates = sessionSchema.partial().parse(req.body);
      const session = await storage.updateSession(req.params.id, updates);
      res.json(session);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.status(400).json({ error: "Invalid update data", details: error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

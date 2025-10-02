import { Assessment, InsertAssessment, Session, InsertSession } from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

export interface IStorage {
  // Assessment operations
  getAssessment(id: string): Promise<Assessment | undefined>;
  listAssessments(): Promise<Assessment[]>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  updateAssessment(id: string, assessment: Partial<Assessment>): Promise<Assessment>;
  deleteAssessment(id: string): Promise<void>;
  
  // Session operations
  getSession(id: string): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: string, session: Partial<Session>): Promise<Session>;
}

export class FileStorage implements IStorage {
  private assessmentsDir = path.join(process.cwd(), 'public', 'assessments');
  private sessionsDir = path.join(process.cwd(), 'public', 'sessions');

  constructor() {
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.assessmentsDir, { recursive: true });
      await fs.mkdir(this.sessionsDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create storage directories:', error);
    }
  }

  // Assessment operations
  async getAssessment(id: string): Promise<Assessment | undefined> {
    try {
      const filePath = path.join(this.assessmentsDir, `${id}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return undefined;
    }
  }

  async listAssessments(): Promise<Assessment[]> {
    try {
      const files = await fs.readdir(this.assessmentsDir);
      const assessments: Assessment[] = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.assessmentsDir, file);
          const data = await fs.readFile(filePath, 'utf-8');
          assessments.push(JSON.parse(data));
        }
      }
      
      return assessments.sort((a, b) => 
        new Date(b.meta.updatedAt).getTime() - new Date(a.meta.updatedAt).getTime()
      );
    } catch (error) {
      return [];
    }
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const id = randomUUID();
    const now = new Date().toISOString();
    
    const assessment: Assessment = {
      ...insertAssessment,
      id,
      meta: {
        createdAt: now,
        updatedAt: now,
        createdBy: 'system'
      }
    };

    const filePath = path.join(this.assessmentsDir, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(assessment, null, 2));
    
    return assessment;
  }

  async updateAssessment(id: string, updates: Partial<Assessment>): Promise<Assessment> {
    const existing = await this.getAssessment(id);
    if (!existing) {
      throw new Error(`Assessment ${id} not found`);
    }

    const updated: Assessment = {
      ...existing,
      ...updates,
      meta: {
        ...existing.meta,
        updatedAt: new Date().toISOString()
      }
    };

    const filePath = path.join(this.assessmentsDir, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(updated, null, 2));
    
    return updated;
  }

  async deleteAssessment(id: string): Promise<void> {
    const filePath = path.join(this.assessmentsDir, `${id}.json`);
    await fs.unlink(filePath);
  }

  // Session operations
  async getSession(id: string): Promise<Session | undefined> {
    try {
      const filePath = path.join(this.sessionsDir, `${id}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return undefined;
    }
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const now = new Date().toISOString();
    
    const session: Session = {
      ...insertSession,
      id,
      createdAt: now,
      updatedAt: now
    };

    const filePath = path.join(this.sessionsDir, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(session, null, 2));
    
    return session;
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session> {
    const existing = await this.getSession(id);
    if (!existing) {
      throw new Error(`Session ${id} not found`);
    }

    const updated: Session = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const filePath = path.join(this.sessionsDir, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(updated, null, 2));
    
    return updated;
  }
}

export const storage = new FileStorage();

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuerySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock AI responses for demonstration
  const mockResponses = [
    "Based on the sales data analysis, the top selling products last quarter were:\n\n1. **Premium Widget Pro** - 1,247 units sold ($62,350 revenue)\n2. **Standard Widget** - 982 units sold ($29,460 revenue)\n3. **Widget Accessories Kit** - 756 units sold ($15,120 revenue)\n\nThe Premium Widget Pro showed a 23% increase compared to the previous quarter, indicating strong market demand for premium features.",
    
    "The customer satisfaction metrics show:\n\n• **Overall satisfaction score:** 4.2/5.0\n• **Net Promoter Score:** 68\n• **Customer retention rate:** 87%\n\nKey insights: Customer satisfaction improved by 12% this quarter, primarily driven by faster response times and enhanced product quality. The main areas for improvement are shipping speed and product documentation.",
    
    "Revenue analysis reveals:\n\n• **Total revenue:** $2.4M (↑18% YoY)\n• **Monthly recurring revenue:** $450K\n• **Average deal size:** $3,200\n\nGrowth drivers include expansion in the enterprise segment and successful launch of the premium tier. The subscription model continues to show strong momentum with 95% renewal rates.",

    "The conversion funnel analysis shows:\n\n• **Website visitors:** 45,200\n• **Lead generation:** 3,840 (8.5% conversion)\n• **Qualified leads:** 1,920 (50% of leads)\n• **Closed deals:** 384 (20% close rate)\n\nRecommendations: Focus on improving lead qualification process and consider A/B testing the pricing page to increase conversion rates.",

    "Employee productivity metrics indicate:\n\n• **Average tasks completed per day:** 12.3\n• **Project completion rate:** 94%\n• **Team collaboration score:** 4.1/5.0\n• **Time to resolution:** 2.4 hours average\n\nProductivity has increased 15% since implementing the new project management system. Remote workers show 8% higher efficiency than in-office workers."
  ];

  // Process BI query with mock AI
  app.post("/api/queries", async (req, res) => {
    try {
      const { question } = insertQuerySchema.parse(req.body);
      
      if (!question.trim()) {
        return res.status(400).json({ message: "Question cannot be empty" });
      }

      if (question.trim().length < 10) {
        return res.status(400).json({ message: "Please enter a more detailed question (at least 10 characters)" });
      }

      // Simulate AI processing delay (1.5-3 seconds)
      const delay = Math.random() * 1500 + 1500;
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Get random mock response
      const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      const query = await storage.createQuery({ question }, response);
      
      res.json(query);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all queries
  app.get("/api/queries", async (req, res) => {
    try {
      const queries = await storage.getAllQueries();
      res.json(queries);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

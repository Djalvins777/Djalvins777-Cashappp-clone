import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { storage } from "./storage";
import { insertDatasetSchema, insertChartSchema, insertDashboardSchema } from "@shared/schema";
import type { ColumnInfo } from "@shared/schema";
import { z } from "zod";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // File upload endpoint
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const file = req.file;
      const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
      let parsedData: any[] = [];

      const detectColumnType = (values: any[]): 'number' | 'text' | 'date' => {
        const sampleValues = values.filter(v => v != null && v !== '').slice(0, 10);
        
        if (sampleValues.length === 0) return 'text';
        
        const numericCount = sampleValues.filter(v => !isNaN(Number(v))).length;
        if (numericCount / sampleValues.length > 0.8) return 'number';
        
        const dateCount = sampleValues.filter(v => !isNaN(Date.parse(v))).length;
        if (dateCount / sampleValues.length > 0.8) return 'date';
        
        return 'text';
      };

      if (fileExtension === 'csv') {
        const csvText = file.buffer.toString('utf-8');
        const result = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        });
        parsedData = result.data as any[];
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        parsedData = XLSX.utils.sheet_to_json(firstSheet);
      } else {
        res.status(400).json({ error: 'Unsupported file format' });
        return;
      }

      if (parsedData.length === 0) {
        res.status(400).json({ error: 'No data found in file' });
        return;
      }

      // Extract column information
      const columnNames = Object.keys(parsedData[0]);
      const columns: ColumnInfo[] = columnNames.map(name => {
        const values = parsedData.map(row => row[name]);
        const type = detectColumnType(values);
        return {
          name,
          type,
          dataType: type === 'number' ? 'numeric' : type === 'date' ? 'datetime' : 'string',
        };
      });

      // Create dataset
      const dataset = await storage.createDataset({
        name: file.originalname.replace(/\.[^/.]+$/, ""),
        fileName: file.originalname,
        data: parsedData as any,
        columns: columns as any,
        rowCount: parsedData.length.toString(),
      });

      res.json(dataset);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: "Failed to process file" });
    }
  });

  // Dataset routes
  app.post("/api/datasets", async (req, res) => {
    try {
      const validatedData = insertDatasetSchema.parse(req.body);
      const dataset = await storage.createDataset(validatedData);
      res.json(dataset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create dataset" });
      }
    }
  });

  app.get("/api/datasets", async (req, res) => {
    try {
      const datasets = await storage.getAllDatasets();
      res.json(datasets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch datasets" });
    }
  });

  app.get("/api/datasets/:id", async (req, res) => {
    try {
      const dataset = await storage.getDataset(req.params.id);
      if (!dataset) {
        res.status(404).json({ error: "Dataset not found" });
        return;
      }
      res.json(dataset);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dataset" });
    }
  });

  app.delete("/api/datasets/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDataset(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Dataset not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete dataset" });
    }
  });

  // Chart routes
  app.post("/api/charts", async (req, res) => {
    try {
      const validatedData = insertChartSchema.parse(req.body);
      const chart = await storage.createChart(validatedData);
      res.json(chart);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create chart" });
      }
    }
  });

  app.get("/api/charts", async (req, res) => {
    try {
      const { datasetId } = req.query;
      let charts;
      
      if (datasetId) {
        charts = await storage.getChartsByDataset(datasetId as string);
      } else {
        charts = await storage.getAllCharts();
      }
      
      res.json(charts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch charts" });
    }
  });

  app.get("/api/charts/:id", async (req, res) => {
    try {
      const chart = await storage.getChart(req.params.id);
      if (!chart) {
        res.status(404).json({ error: "Chart not found" });
        return;
      }
      res.json(chart);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chart" });
    }
  });

  app.put("/api/charts/:id", async (req, res) => {
    try {
      const validatedData = insertChartSchema.partial().parse(req.body);
      const chart = await storage.updateChart(req.params.id, validatedData);
      if (!chart) {
        res.status(404).json({ error: "Chart not found" });
        return;
      }
      res.json(chart);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update chart" });
      }
    }
  });

  app.delete("/api/charts/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteChart(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Chart not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete chart" });
    }
  });

  // Dashboard routes
  app.post("/api/dashboards", async (req, res) => {
    try {
      const validatedData = insertDashboardSchema.parse(req.body);
      const dashboard = await storage.createDashboard(validatedData);
      res.json(dashboard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create dashboard" });
      }
    }
  });

  app.get("/api/dashboards", async (req, res) => {
    try {
      const dashboards = await storage.getAllDashboards();
      res.json(dashboards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboards" });
    }
  });

  app.get("/api/dashboards/:id", async (req, res) => {
    try {
      const dashboard = await storage.getDashboard(req.params.id);
      if (!dashboard) {
        res.status(404).json({ error: "Dashboard not found" });
        return;
      }
      res.json(dashboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard" });
    }
  });

  app.put("/api/dashboards/:id", async (req, res) => {
    try {
      const validatedData = insertDashboardSchema.partial().parse(req.body);
      const dashboard = await storage.updateDashboard(req.params.id, validatedData);
      if (!dashboard) {
        res.status(404).json({ error: "Dashboard not found" });
        return;
      }
      res.json(dashboard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update dashboard" });
      }
    }
  });

  app.delete("/api/dashboards/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDashboard(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Dashboard not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete dashboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

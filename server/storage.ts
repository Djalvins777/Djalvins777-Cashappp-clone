import { type Dataset, type InsertDataset, type Chart, type InsertChart, type Dashboard, type InsertDashboard } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Dataset operations
  createDataset(dataset: InsertDataset): Promise<Dataset>;
  getDataset(id: string): Promise<Dataset | undefined>;
  getAllDatasets(): Promise<Dataset[]>;
  deleteDataset(id: string): Promise<boolean>;

  // Chart operations
  createChart(chart: InsertChart): Promise<Chart>;
  getChart(id: string): Promise<Chart | undefined>;
  getChartsByDataset(datasetId: string): Promise<Chart[]>;
  getAllCharts(): Promise<Chart[]>;
  updateChart(id: string, chart: Partial<InsertChart>): Promise<Chart | undefined>;
  deleteChart(id: string): Promise<boolean>;

  // Dashboard operations
  createDashboard(dashboard: InsertDashboard): Promise<Dashboard>;
  getDashboard(id: string): Promise<Dashboard | undefined>;
  getAllDashboards(): Promise<Dashboard[]>;
  updateDashboard(id: string, dashboard: Partial<InsertDashboard>): Promise<Dashboard | undefined>;
  deleteDashboard(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private datasets: Map<string, Dataset>;
  private charts: Map<string, Chart>;
  private dashboards: Map<string, Dashboard>;

  constructor() {
    this.datasets = new Map();
    this.charts = new Map();
    this.dashboards = new Map();
  }

  // Dataset operations
  async createDataset(insertDataset: InsertDataset): Promise<Dataset> {
    const id = randomUUID();
    const dataset: Dataset = {
      ...insertDataset,
      id,
      uploadedAt: new Date(),
    };
    this.datasets.set(id, dataset);
    return dataset;
  }

  async getDataset(id: string): Promise<Dataset | undefined> {
    return this.datasets.get(id);
  }

  async getAllDatasets(): Promise<Dataset[]> {
    return Array.from(this.datasets.values());
  }

  async deleteDataset(id: string): Promise<boolean> {
    return this.datasets.delete(id);
  }

  // Chart operations
  async createChart(insertChart: InsertChart): Promise<Chart> {
    const id = randomUUID();
    const chart: Chart = {
      ...insertChart,
      id,
      createdAt: new Date(),
    };
    this.charts.set(id, chart);
    return chart;
  }

  async getChart(id: string): Promise<Chart | undefined> {
    return this.charts.get(id);
  }

  async getChartsByDataset(datasetId: string): Promise<Chart[]> {
    return Array.from(this.charts.values()).filter(
      (chart) => chart.datasetId === datasetId
    );
  }

  async getAllCharts(): Promise<Chart[]> {
    return Array.from(this.charts.values());
  }

  async updateChart(id: string, updates: Partial<InsertChart>): Promise<Chart | undefined> {
    const chart = this.charts.get(id);
    if (!chart) return undefined;

    const updatedChart = { ...chart, ...updates };
    this.charts.set(id, updatedChart);
    return updatedChart;
  }

  async deleteChart(id: string): Promise<boolean> {
    return this.charts.delete(id);
  }

  // Dashboard operations
  async createDashboard(insertDashboard: InsertDashboard): Promise<Dashboard> {
    const id = randomUUID();
    const dashboard: Dashboard = {
      ...insertDashboard,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.dashboards.set(id, dashboard);
    return dashboard;
  }

  async getDashboard(id: string): Promise<Dashboard | undefined> {
    return this.dashboards.get(id);
  }

  async getAllDashboards(): Promise<Dashboard[]> {
    return Array.from(this.dashboards.values());
  }

  async updateDashboard(id: string, updates: Partial<InsertDashboard>): Promise<Dashboard | undefined> {
    const dashboard = this.dashboards.get(id);
    if (!dashboard) return undefined;

    const updatedDashboard = {
      ...dashboard,
      ...updates,
      updatedAt: new Date(),
    };
    this.dashboards.set(id, updatedDashboard);
    return updatedDashboard;
  }

  async deleteDashboard(id: string): Promise<boolean> {
    return this.dashboards.delete(id);
  }
}

export const storage = new MemStorage();

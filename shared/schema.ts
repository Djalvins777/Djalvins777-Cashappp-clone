import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Dataset schema - represents uploaded CSV/Excel files
export const datasets = pgTable("datasets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  fileName: text("file_name").notNull(),
  data: jsonb("data").notNull(), // Array of row objects
  columns: jsonb("columns").notNull(), // Array of {name, type, dataType}
  rowCount: text("row_count").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const insertDatasetSchema = createInsertSchema(datasets).omit({
  id: true,
  uploadedAt: true,
});

export type InsertDataset = z.infer<typeof insertDatasetSchema>;
export type Dataset = typeof datasets.$inferSelect;

// Chart schema - represents individual visualizations
export const charts = pgTable("charts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  datasetId: varchar("dataset_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'bar' | 'line' | 'scatter' | 'pie' | 'area'
  config: jsonb("config").notNull(), // {xAxis, yAxis, series, colors, etc}
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChartSchema = createInsertSchema(charts).omit({
  id: true,
  createdAt: true,
});

export type InsertChart = z.infer<typeof insertChartSchema>;
export type Chart = typeof charts.$inferSelect;

// Dashboard schema - represents saved dashboard layouts
export const dashboards = pgTable("dashboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  layout: jsonb("layout").notNull(), // Array of widget positions and sizes
  chartIds: jsonb("chart_ids").notNull(), // Array of chart IDs in this dashboard
  datasetIds: jsonb("dataset_ids").notNull(), // Array of dataset IDs used
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDashboardSchema = createInsertSchema(dashboards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDashboard = z.infer<typeof insertDashboardSchema>;
export type Dashboard = typeof dashboards.$inferSelect;

// TypeScript types for frontend
export interface ColumnInfo {
  name: string;
  type: 'number' | 'text' | 'date';
  dataType: string;
}

export interface ChartConfig {
  xAxis?: string;
  yAxis?: string[];
  series?: string[];
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
}

export interface WidgetLayout {
  id: string;
  type: 'chart' | 'stats' | 'table';
  chartId?: string;
  datasetId?: string;
  x: number;
  y: number;
  w: number; // width in grid columns (out of 12)
  h: number; // height in grid rows
}

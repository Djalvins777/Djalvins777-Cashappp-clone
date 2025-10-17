import { useState } from "react";
import { BarChart3, LineChart, ScatterChart, PieChart, Activity, Save, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { ColumnInfo, ChartConfig } from "@shared/schema";
import { ResponsiveContainer, BarChart as RechartsBar, LineChart as RechartsLine, ScatterChart as RechartsScatter, PieChart as RechartsPie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, Line, Scatter, Pie, Cell, Area, AreaChart as RechartsArea } from "recharts";

interface ChartBuilderProps {
  datasetId: string;
  data: any[];
  columns: ColumnInfo[];
  onSaveChart: (chart: {
    name: string;
    type: string;
    config: ChartConfig;
  }) => void;
}

const CHART_TYPES = [
  { id: 'bar', label: 'Bar', icon: BarChart3 },
  { id: 'line', label: 'Line', icon: LineChart },
  { id: 'area', label: 'Area', icon: Activity },
  { id: 'scatter', label: 'Scatter', icon: ScatterChart },
  { id: 'pie', label: 'Pie', icon: PieChart },
];

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function ChartBuilder({ datasetId, data, columns, onSaveChart }: ChartBuilderProps) {
  const [chartType, setChartType] = useState<string>('bar');
  const [chartName, setChartName] = useState('');
  const [xAxis, setXAxis] = useState<string>('');
  const [yAxis, setYAxis] = useState<string[]>([]);

  const numericColumns = columns.filter(c => c.type === 'number');
  const allColumns = columns.map(c => c.name);

  const handleSave = () => {
    if (!chartName || !xAxis || yAxis.length === 0) {
      return;
    }

    const config: ChartConfig = {
      xAxis,
      yAxis,
      colors: CHART_COLORS.slice(0, yAxis.length),
      showLegend: true,
      showGrid: true,
    };

    onSaveChart({
      name: chartName,
      type: chartType,
      config,
    });

    // Reset form
    setChartName('');
    setXAxis('');
    setYAxis([]);
  };

  const renderChart = () => {
    if (!xAxis || yAxis.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Select data to visualize</p>
          </div>
        </div>
      );
    }

    const chartData = data.slice(0, 50); // Limit for performance

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBar data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={xAxis} stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--popover-border))',
                  borderRadius: '0.375rem',
                }}
              />
              <Legend />
              {yAxis.map((key, idx) => (
                <Bar key={key} dataKey={key} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
              ))}
            </RechartsBar>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLine data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={xAxis} stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--popover-border))',
                  borderRadius: '0.375rem',
                }}
              />
              <Legend />
              {yAxis.map((key, idx) => (
                <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[idx % CHART_COLORS.length]} strokeWidth={2} />
              ))}
            </RechartsLine>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsArea data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={xAxis} stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--popover-border))',
                  borderRadius: '0.375rem',
                }}
              />
              <Legend />
              {yAxis.map((key, idx) => (
                <Area key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[idx % CHART_COLORS.length]} fill={CHART_COLORS[idx % CHART_COLORS.length]} fillOpacity={0.6} />
              ))}
            </RechartsArea>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsScatter data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={xAxis} stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey={yAxis[0]} stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--popover-border))',
                  borderRadius: '0.375rem',
                }}
              />
              <Scatter name={yAxis[0]} fill={CHART_COLORS[0]} />
            </RechartsScatter>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieData = chartData.slice(0, 10).map(item => ({
          name: item[xAxis],
          value: Number(item[yAxis[0]]) || 0,
        }));
        
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--popover-border))',
                  borderRadius: '0.375rem',
                }}
              />
              <Legend />
            </RechartsPie>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <h3 className="text-xl font-medium text-foreground">Chart Builder</h3>
        {yAxis.length > 0 && (
          <Badge variant="secondary" data-testid="badge-series">
            {yAxis.length} series selected
          </Badge>
        )}
      </div>

      {/* Chart Type Selector */}
      <div className="flex gap-2 flex-wrap">
        {CHART_TYPES.map((type) => {
          const Icon = type.icon;
          const isActive = chartType === type.id;
          return (
            <Button
              key={type.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => setChartType(type.id)}
              data-testid={`button-chart-${type.id}`}
            >
              <Icon className="h-4 w-4" />
              {type.label}
            </Button>
          );
        })}
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="chart-name">Chart Name</Label>
          <Input
            id="chart-name"
            placeholder="My Chart"
            value={chartName}
            onChange={(e) => setChartName(e.target.value)}
            data-testid="input-chart-name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="x-axis">X-Axis</Label>
          <Select value={xAxis} onValueChange={setXAxis}>
            <SelectTrigger id="x-axis" data-testid="select-x-axis">
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
              {allColumns.map(col => (
                <SelectItem key={col} value={col}>{col}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="y-axis">Y-Axis (Numeric)</Label>
          <Select
            value={yAxis[0] || ''}
            onValueChange={(value) => {
              if (!yAxis.includes(value)) {
                setYAxis([...yAxis, value]);
              }
            }}
          >
            <SelectTrigger id="y-axis" data-testid="select-y-axis">
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
              {numericColumns.map(col => (
                <SelectItem key={col.name} value={col.name}>{col.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {yAxis.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {yAxis.map(col => (
            <Badge
              key={col}
              variant="secondary"
              className="gap-2"
            >
              {col}
              <button
                onClick={() => setYAxis(yAxis.filter(c => c !== col))}
                className="text-muted-foreground hover:text-foreground"
                data-testid={`button-remove-${col}`}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Chart Preview */}
      <Card className="p-6 bg-card">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-medium text-foreground">Preview</h4>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!chartName || !xAxis || yAxis.length === 0}
            data-testid="button-save-chart"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Chart
          </Button>
        </div>
        {renderChart()}
      </Card>
    </div>
  );
}

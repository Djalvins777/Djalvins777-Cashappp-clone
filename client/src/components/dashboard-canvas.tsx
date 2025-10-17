import { useState, useEffect } from "react";
import { Trash2, GripVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GridLayout, { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import type { Chart } from "@shared/schema";
import { ResponsiveContainer, BarChart, LineChart, ScatterChart, PieChart, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, Line, Scatter, Pie, Cell, Area } from "recharts";

interface DashboardCanvasProps {
  charts: Chart[];
  datasets: Map<string, { data: any[]; columns: any[] }>;
  layout?: Layout[];
  onLayoutChange?: (layout: Layout[]) => void;
  onRemoveWidget?: (chartId: string) => void;
}

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function DashboardCanvas({ charts, datasets, layout: parentLayout, onLayoutChange, onRemoveWidget }: DashboardCanvasProps) {
  const [layout, setLayout] = useState<Layout[]>(() => 
    parentLayout && parentLayout.length > 0
      ? parentLayout
      : charts.map((chart, idx) => ({
          i: chart.id,
          x: (idx % 3) * 4,
          y: Math.floor(idx / 3) * 6,
          w: 4,
          h: 6,
        }))
  );

  // Update layout when parent layout changes
  useEffect(() => {
    if (parentLayout && parentLayout.length > 0) {
      setLayout(parentLayout);
    }
  }, [parentLayout]);

  const handleLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout);
    onLayoutChange?.(newLayout);
  };

  const renderChart = (chart: Chart) => {
    const dataset = datasets.get(chart.datasetId);
    if (!dataset) return null;

    const { data, columns } = dataset;
    const config = chart.config as any;
    const chartData = data.slice(0, 50);

    switch (chart.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={config.xAxis} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--popover-border))',
                  borderRadius: '0.375rem',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {config.yAxis?.map((key: string, idx: number) => (
                <Bar key={key} dataKey={key} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={config.xAxis} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--popover-border))',
                  borderRadius: '0.375rem',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {config.yAxis?.map((key: string, idx: number) => (
                <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[idx % CHART_COLORS.length]} strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={config.xAxis} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--popover-border))',
                  borderRadius: '0.375rem',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {config.yAxis?.map((key: string, idx: number) => (
                <Area key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[idx % CHART_COLORS.length]} fill={CHART_COLORS[idx % CHART_COLORS.length]} fillOpacity={0.6} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={config.xAxis} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis dataKey={config.yAxis?.[0]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--popover-border))',
                  borderRadius: '0.375rem',
                  fontSize: '12px',
                }}
              />
              <Scatter name={config.yAxis?.[0]} fill={CHART_COLORS[0]} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieData = chartData.slice(0, 10).map(item => ({
          name: item[config.xAxis],
          value: Number(item[config.yAxis?.[0]]) || 0,
        }));
        
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => entry.name}
                labelLine={false}
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
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  if (charts.length === 0) {
    return (
      <Card className="min-h-[400px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <GripVertical className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No charts created yet</p>
          <p className="text-sm mt-1">Create a chart to add it to your dashboard</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative">
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={60}
        width={1200}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".drag-handle"
        containerPadding={[0, 0]}
        margin={[16, 16]}
      >
        {charts.map((chart) => (
          <div key={chart.id} data-testid={`widget-${chart.id}`}>
            <Card className="h-full overflow-hidden bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="drag-handle cursor-move p-1 hover-elevate rounded">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h4 className="text-sm font-medium text-foreground truncate">{chart.name}</h4>
                </div>
                {onRemoveWidget && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onRemoveWidget(chart.id)}
                    data-testid={`button-remove-${chart.id}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="h-[calc(100%-40px)]">
                {renderChart(chart)}
              </div>
            </Card>
          </div>
        ))}
      </GridLayout>
    </div>
  );
}

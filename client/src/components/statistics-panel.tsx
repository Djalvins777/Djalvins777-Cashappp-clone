import { useMemo } from "react";
import { Hash, TrendingUp, Table, Sigma } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ColumnInfo } from "@shared/schema";

interface StatisticsPanelProps {
  data: any[];
  columns: ColumnInfo[];
}

export function StatisticsPanel({ data, columns }: StatisticsPanelProps) {
  const stats = useMemo(() => {
    const numericColumns = columns.filter(c => c.type === 'number');
    
    const calculations = numericColumns.map(col => {
      const values = data
        .map(row => Number(row[col.name]))
        .filter(v => !isNaN(v));
      
      if (values.length === 0) {
        return { column: col.name, avg: 0, sum: 0, min: 0, max: 0 };
      }
      
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      return { column: col.name, avg, sum, min, max };
    });

    return {
      totalRows: data.length,
      totalColumns: columns.length,
      numericColumns: numericColumns.length,
      calculations,
    };
  }, [data, columns]);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-medium text-foreground">Data Statistics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10">
              <Table className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Rows</p>
              <p className="text-3xl font-semibold text-foreground font-mono" data-testid="stat-rows">
                {stats.totalRows.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10">
              <Hash className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Columns</p>
              <p className="text-3xl font-semibold text-foreground font-mono" data-testid="stat-columns">
                {stats.totalColumns}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Numeric Columns</p>
              <p className="text-3xl font-semibold text-foreground font-mono" data-testid="stat-numeric">
                {stats.numericColumns}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10">
              <Sigma className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data Cells</p>
              <p className="text-3xl font-semibold text-foreground font-mono" data-testid="stat-cells">
                {(stats.totalRows * stats.totalColumns).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {stats.calculations.length > 0 && (
        <Card className="p-6 bg-card">
          <h4 className="text-base font-medium text-foreground mb-4">Numeric Column Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.calculations.map(calc => (
              <div key={calc.column} className="space-y-2">
                <p className="text-sm font-medium text-foreground truncate">{calc.column}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Avg:</span>
                    <span className="ml-2 font-mono text-foreground">{calc.avg.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sum:</span>
                    <span className="ml-2 font-mono text-foreground">{calc.sum.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Min:</span>
                    <span className="ml-2 font-mono text-foreground">{calc.min.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max:</span>
                    <span className="ml-2 font-mono text-foreground">{calc.max.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

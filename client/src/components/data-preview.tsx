import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Hash, Type, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ColumnInfo } from "@shared/schema";

interface DataPreviewProps {
  data: any[];
  columns: ColumnInfo[];
  name: string;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataPreview({ data, columns, name }: DataPreviewProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [filterText, setFilterText] = useState("");

  const getColumnIcon = (type: ColumnInfo['type']) => {
    switch (type) {
      case 'number':
        return <Hash className="h-3 w-3" />;
      case 'date':
        return <Calendar className="h-3 w-3" />;
      default:
        return <Type className="h-3 w-3" />;
    }
  };

  const sortedAndFilteredData = useMemo(() => {
    let result = [...data];

    // Filter
    if (filterText) {
      result = result.filter(row =>
        Object.values(row).some(val =>
          String(val).toLowerCase().includes(filterText.toLowerCase())
        )
      );
    }

    // Sort
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, sortColumn, sortDirection, filterText]);

  const handleSort = (columnName: string) => {
    if (sortColumn === columnName) {
      setSortDirection(current => 
        current === 'asc' ? 'desc' : current === 'desc' ? null : 'asc'
      );
      if (sortDirection === 'desc') {
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-xl font-medium text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground">
            {sortedAndFilteredData.length} rows × {columns.length} columns
          </p>
        </div>
        <Input
          placeholder="Filter data..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="max-w-xs"
          data-testid="input-filter"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-card border-b border-card-border z-10">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.name}
                    className="px-4 py-2 text-left text-sm font-medium text-foreground"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 h-auto p-0 hover-elevate"
                      onClick={() => handleSort(column.name)}
                      data-testid={`button-sort-${column.name}`}
                    >
                      <span className="flex items-center gap-2">
                        {getColumnIcon(column.type)}
                        <span className="truncate max-w-[200px]">{column.name}</span>
                      </span>
                      {sortColumn === column.name && (
                        sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </Button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredData.slice(0, 100).map((row, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? 'bg-card' : 'bg-muted/30'}
                  data-testid={`row-data-${idx}`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.name}
                      className="px-4 py-2 text-sm text-foreground truncate max-w-[200px]"
                    >
                      {row[column.name] != null ? String(row[column.name]) : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sortedAndFilteredData.length > 100 && (
          <div className="px-4 py-2 border-t border-card-border text-center text-sm text-muted-foreground">
            Showing first 100 rows of {sortedAndFilteredData.length}
          </div>
        )}
      </Card>
    </div>
  );
}

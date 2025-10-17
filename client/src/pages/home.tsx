import { useState, useEffect } from "react";
import { Upload, BarChart3, LayoutDashboard, Save, Database, FolderOpen } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/file-upload";
import { DataPreview } from "@/components/data-preview";
import { StatisticsPanel } from "@/components/statistics-panel";
import { ChartBuilder } from "@/components/chart-builder";
import { DashboardCanvas } from "@/components/dashboard-canvas";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Dataset, Chart, Dashboard, ColumnInfo } from "@shared/schema";
import type { Layout } from "react-grid-layout";

type Tab = 'upload' | 'charts' | 'dashboard';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [currentDataset, setCurrentDataset] = useState<Dataset | null>(null);
  const [dashboardName, setDashboardName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [dashboardLayout, setDashboardLayout] = useState<Layout[]>([]);
  const [selectedDashboardId, setSelectedDashboardId] = useState<string>("");
  const { toast } = useToast();

  // Fetch all datasets
  const { data: datasets = [], isLoading: datasetsLoading } = useQuery<Dataset[]>({
    queryKey: ['/api/datasets'],
  });

  // Fetch all charts
  const { data: charts = [], isLoading: chartsLoading } = useQuery<Chart[]>({
    queryKey: ['/api/charts'],
  });

  // Fetch all dashboards
  const { data: dashboards = [], isLoading: dashboardsLoading } = useQuery<Dashboard[]>({
    queryKey: ['/api/dashboards'],
  });

  // Auto-restore current dataset if available and not set
  useEffect(() => {
    if (!currentDataset && datasets.length > 0) {
      setCurrentDataset(datasets[0]);
    }
  }, [datasets, currentDataset]);

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return await response.json();
    },
    onSuccess: (dataset: Dataset) => {
      queryClient.invalidateQueries({ queryKey: ['/api/datasets'] });
      setCurrentDataset(dataset);
      setActiveTab('charts');
      toast({
        title: "File uploaded successfully",
        description: `Processed ${dataset.rowCount} rows`,
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to process file",
      });
    },
  });

  // Create chart mutation
  const createChartMutation = useMutation({
    mutationFn: async (chartData: {
      datasetId: string;
      name: string;
      type: string;
      config: any;
    }) => {
      return await apiRequest('POST', '/api/charts', chartData);
    },
    onSuccess: (chart: Chart) => {
      queryClient.invalidateQueries({ queryKey: ['/api/charts'] });
      toast({
        title: "Chart created",
        description: `${chart.name} has been added to your dashboard`,
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Failed to create chart",
        description: "Please try again",
      });
    },
  });

  // Delete chart mutation
  const deleteChartMutation = useMutation({
    mutationFn: async (chartId: string) => {
      return await apiRequest('DELETE', `/api/charts/${chartId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/charts'] });
      toast({
        title: "Chart removed",
        description: "Chart has been removed from dashboard",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Failed to remove chart",
        description: "Please try again",
      });
    },
  });

  // Create dashboard mutation
  const createDashboardMutation = useMutation({
    mutationFn: async (dashboardData: {
      name: string;
      layout: any;
    }) => {
      return await apiRequest('POST', '/api/dashboards', dashboardData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards'] });
      toast({
        title: "Dashboard saved",
        description: `${dashboardName} has been saved successfully`,
      });
      setShowSaveDialog(false);
      setDashboardName("");
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Failed to save dashboard",
        description: "Please try again",
      });
    },
  });

  // Load dashboard
  const handleLoadDashboard = async () => {
    const dashboard = dashboards.find(d => d.id === selectedDashboardId);
    if (dashboard) {
      setDashboardLayout(dashboard.layout as Layout[]);
      setSelectedDashboardId(dashboard.id); // Store loaded dashboard ID
      
      // Get dataset IDs from the saved dashboard
      const dashboardDatasetIds = (dashboard.datasetIds || []) as string[];
      
      // Find and set the first dataset
      if (dashboardDatasetIds.length > 0) {
        const firstDataset = datasets.find(d => d.id === dashboardDatasetIds[0]);
        if (firstDataset) {
          setCurrentDataset(firstDataset);
        }
      }
      
      toast({
        title: "Dashboard loaded",
        description: `${dashboard.name} has been loaded`,
      });
      setShowLoadDialog(false);
      setActiveTab('dashboard');
    }
  };

  const handleFileProcessed = (file: File) => {
    uploadFileMutation.mutate(file);
  };

  const handleSaveChart = (chartData: {
    name: string;
    type: string;
    config: any;
  }) => {
    if (!currentDataset) return;

    createChartMutation.mutate({
      datasetId: currentDataset.id,
      ...chartData,
    });
  };

  const handleRemoveChart = (chartId: string) => {
    deleteChartMutation.mutate(chartId);
  };

  const handleSaveDashboard = () => {
    if (!dashboardName) {
      toast({
        variant: "destructive",
        title: "Dashboard name required",
        description: "Please enter a name for your dashboard",
      });
      return;
    }

    // Extract chart IDs and dataset IDs
    const chartIds = charts.map(c => c.id);
    const datasetIds = [...new Set(charts.map(c => c.datasetId))];

    createDashboardMutation.mutate({
      name: dashboardName,
      layout: dashboardLayout,
      chartIds: chartIds as any,
      datasetIds: datasetIds as any,
    });
  };

  const handleLayoutChange = (newLayout: Layout[]) => {
    setDashboardLayout(newLayout);
  };

  // Build datasets map from all available datasets
  const datasets_map = new Map();
  
  // Add all datasets that are used by charts
  charts.forEach(chart => {
    const dataset = datasets.find(d => d.id === chart.datasetId);
    if (dataset && !datasets_map.has(dataset.id)) {
      datasets_map.set(dataset.id, {
        data: dataset.data,
        columns: dataset.columns,
      });
    }
  });
  
  // Also add current dataset if it exists
  if (currentDataset && !datasets_map.has(currentDataset.id)) {
    datasets_map.set(currentDataset.id, {
      data: currentDataset.data,
      columns: currentDataset.columns,
    });
  }

  const tabs = [
    { id: 'upload' as Tab, label: 'Data Upload', icon: Upload },
    { id: 'charts' as Tab, label: 'Chart Builder', icon: BarChart3, disabled: !currentDataset },
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard, disabled: !currentDataset },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary">
              <Database className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">DataViz Studio</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {currentDataset && charts.length > 0 && (
              <>
                <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" data-testid="button-load-dashboard">
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Load Dashboard
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Load Dashboard</DialogTitle>
                      <DialogDescription>
                        Select a saved dashboard to load
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="dashboard-select">Select Dashboard</Label>
                        <Select value={selectedDashboardId} onValueChange={setSelectedDashboardId}>
                          <SelectTrigger id="dashboard-select" data-testid="select-dashboard">
                            <SelectValue placeholder="Choose a dashboard" />
                          </SelectTrigger>
                          <SelectContent>
                            {dashboards.map(dashboard => (
                              <SelectItem key={dashboard.id} value={dashboard.id}>
                                {dashboard.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        onClick={handleLoadDashboard}
                        disabled={!selectedDashboardId}
                        data-testid="button-confirm-load"
                      >
                        Load
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" data-testid="button-save-dashboard">
                      <Save className="h-4 w-4 mr-2" />
                      Save Dashboard
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save Dashboard</DialogTitle>
                      <DialogDescription>
                        Give your dashboard a name to save it for later
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="dashboard-name">Dashboard Name</Label>
                        <Input
                          id="dashboard-name"
                          placeholder="My Analytics Dashboard"
                          value={dashboardName}
                          onChange={(e) => setDashboardName(e.target.value)}
                          data-testid="input-dashboard-name"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        onClick={handleSaveDashboard} 
                        disabled={createDashboardMutation.isPending}
                        data-testid="button-confirm-save"
                      >
                        {createDashboardMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && setActiveTab(tab.id)}
                  disabled={tab.disabled}
                  className={`
                    flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors
                    border-b-2 -mb-px
                    ${isActive 
                      ? 'border-primary text-primary' 
                      : tab.disabled
                        ? 'border-transparent text-muted-foreground opacity-50 cursor-not-allowed'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover-elevate'
                    }
                  `}
                  data-testid={`tab-${tab.id}`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'upload' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Upload Your Data</h2>
              <p className="text-muted-foreground">
                Upload a CSV or Excel file to get started with data visualization
              </p>
            </div>
            
            <FileUpload onFileProcessed={handleFileProcessed} />
            
            {uploadFileMutation.isPending ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : currentDataset && (
              <>
                <DataPreview
                  data={currentDataset.data as any[]}
                  columns={currentDataset.columns as ColumnInfo[]}
                  name={currentDataset.name}
                />
                <StatisticsPanel
                  data={currentDataset.data as any[]}
                  columns={currentDataset.columns as ColumnInfo[]}
                />
              </>
            )}
          </div>
        )}

        {activeTab === 'charts' && currentDataset && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Create Charts</h2>
              <p className="text-muted-foreground">
                Build interactive visualizations from your data
              </p>
            </div>
            
            <ChartBuilder
              datasetId={currentDataset.id}
              data={currentDataset.data as any[]}
              columns={currentDataset.columns as ColumnInfo[]}
              onSaveChart={handleSaveChart}
            />

            {chartsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            ) : charts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-foreground">Saved Charts ({charts.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {charts.map(chart => (
                    <div
                      key={chart.id}
                      className="p-4 rounded-lg border border-card-border bg-card hover-elevate"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{chart.name}</span>
                        <span className="text-sm text-muted-foreground capitalize">{chart.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'dashboard' && currentDataset && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Your Dashboard</h2>
              <p className="text-muted-foreground">
                Arrange and customize your charts in a dashboard layout
              </p>
            </div>
            
            {chartsLoading || datasetsLoading ? (
              <Skeleton className="h-96 w-full" />
            ) : (
              <DashboardCanvas
                charts={charts}
                datasets={datasets_map}
                layout={dashboardLayout}
                onLayoutChange={handleLayoutChange}
                onRemoveWidget={handleRemoveChart}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

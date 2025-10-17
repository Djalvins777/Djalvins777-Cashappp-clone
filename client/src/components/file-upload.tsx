import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface FileUploadProps {
  onFileProcessed: (file: File) => void;
}

export function FileUpload({ onFileProcessed }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (file: File) => {
    setIsProcessing(true);
    setProgress(50);
    
    // Simulate progress
    setTimeout(() => {
      setProgress(100);
      onFileProcessed(file);
      setIsProcessing(false);
      setProgress(0);
    }, 300);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="space-y-4">
      <Card
        className={`
          min-h-48 flex flex-col items-center justify-center gap-4 p-8
          border-2 border-dashed transition-all cursor-pointer
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover-elevate'}
          ${isProcessing ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isProcessing && document.getElementById('file-input')?.click()}
        data-testid="dropzone-upload"
      >
        <input
          id="file-input"
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileInput}
          className="hidden"
          data-testid="input-file"
        />
        
        {isProcessing ? (
          <Upload className="h-12 w-12 text-primary animate-pulse" />
        ) : (
          <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
        )}
        
        <div className="text-center">
          <p className="text-base font-medium text-foreground">
            {isProcessing ? 'Processing file...' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Supported formats: CSV, XLSX, XLS
          </p>
        </div>
      </Card>

      {isProcessing && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-center text-muted-foreground">{progress}%</p>
        </div>
      )}
    </div>
  );
}

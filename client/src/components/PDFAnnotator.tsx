import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Pen, 
  Eraser, 
  Type, 
  Highlighter, 
  Save, 
  Download, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  Circle,
  Square,
  Minus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFAnnotatorProps {
  pdfUrl: string;
  assignmentId: string;
  onSave: (annotatedFileUrl: string) => void;
  onClose: () => void;
}

type Tool = 'pen' | 'eraser' | 'text' | 'highlight' | 'circle' | 'rectangle' | 'line';

export function PDFAnnotator({ pdfUrl, assignmentId, onSave, onClose }: PDFAnnotatorProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // E-ink optimized styles
  const eInkStyles = {
    card: "bg-white border-2 border-black rounded-none",
    button: "bg-white border-2 border-black text-black hover:bg-gray-100 rounded-none h-12 px-4",
    activeButton: "bg-black text-white border-2 border-black hover:bg-gray-800 rounded-none h-12 px-4",
    toolbar: "bg-white border-2 border-black p-4 space-x-2",
  };

  // Initialize canvas when PDF loads
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setTimeout(initializeCanvas, 500);
  };

  const initializeCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800 * scale;
    canvas.height = 1100 * scale;
    
    // Configure context for high-quality drawing
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
  }, [scale]);

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'text') return; // Text handled separately
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Configure brush for current tool
    switch (activeTool) {
      case 'pen':
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        break;
      case 'highlight':
        ctx.globalCompositeOperation = 'multiply';
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.lineWidth = 20;
        break;
      case 'eraser':
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 20;
        break;
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Touch support for mobile/tablet
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvasRef.current?.dispatchEvent(mouseEvent);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvasRef.current?.dispatchEvent(mouseEvent);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent("mouseup", {});
    canvasRef.current?.dispatchEvent(mouseEvent);
  };

  // Tool handlers
  const handleToolChange = (tool: Tool) => {
    setActiveTool(tool);
  };

  const addText = () => {
    const text = prompt("Enter text:");
    if (!text || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'source-over';
    ctx.font = '16px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText(text, 100, 100);
  };

  const addShape = (shape: 'circle' | 'rectangle' | 'line') => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    switch (shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(150, 150, 30, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      case 'rectangle':
        ctx.strokeRect(100, 100, 100, 60);
        break;
      case 'line':
        ctx.beginPath();
        ctx.moveTo(100, 100);
        ctx.lineTo(200, 100);
        ctx.stroke();
        break;
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Save annotated PDF
  const handleSave = async () => {
    if (!canvasRef.current || isSaving) return;

    setIsSaving(true);
    try {
      // Get canvas data
      const canvasDataURL = canvasRef.current.toDataURL('image/png');
      
      // Convert to blob
      const response = await fetch(canvasDataURL);
      const blob = await response.blob();
      
      // Upload the annotated image
      const uploadResponse = await apiRequest('/api/objects/upload', 'POST');
      
      const uploadResult = await fetch(uploadResponse.uploadURL, {
        method: 'PUT',
        body: blob,
      });

      if (uploadResult.ok) {
        const fileUrl = uploadResponse.uploadURL.split('?')[0];
        const objectPath = fileUrl.includes('/uploads/') 
          ? fileUrl.split('/uploads/')[1] 
          : fileUrl.split('/').pop();
        
        // Set metadata
        await apiRequest('/api/objects/metadata', 'POST', {
          objectPath,
          metadata: {
            originalFilename: `annotated-assignment-${assignmentId}.png`,
            annotated: true
          }
        });
        
        onSave(fileUrl);
        toast({
          title: "Assignment saved successfully",
          description: "Your annotated assignment has been saved.",
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Failed to save",
        description: "There was an error saving your annotated assignment.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `annotated-assignment-${assignmentId}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  // Zoom controls
  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  // Initialize canvas on scale change
  useEffect(() => {
    initializeCanvas();
  }, [initializeCanvas]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-black">Assignment Editor</h1>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className={eInkStyles.activeButton}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Work'}
            </Button>
            <Button
              onClick={onClose}
              className={eInkStyles.button}
            >
              Close
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Toolbar */}
          <Card className={`${eInkStyles.card} col-span-12 md:col-span-3`}>
            <div className="p-4 space-y-4">
              <h3 className="font-semibold text-lg">Tools</h3>
              
              {/* Drawing Tools */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Drawing</h4>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={() => handleToolChange('pen')}
                    className={activeTool === 'pen' ? eInkStyles.activeButton : eInkStyles.button}
                  >
                    <Pen className="h-4 w-4 mr-2" />
                    Pen
                  </Button>
                  <Button
                    onClick={() => handleToolChange('highlight')}
                    className={activeTool === 'highlight' ? eInkStyles.activeButton : eInkStyles.button}
                  >
                    <Highlighter className="h-4 w-4 mr-2" />
                    Highlight
                  </Button>
                  <Button
                    onClick={() => handleToolChange('eraser')}
                    className={activeTool === 'eraser' ? eInkStyles.activeButton : eInkStyles.button}
                  >
                    <Eraser className="h-4 w-4 mr-2" />
                    Eraser
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Shape Tools */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Shapes</h4>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={() => addShape('circle')}
                    className={eInkStyles.button}
                  >
                    <Circle className="h-4 w-4 mr-2" />
                    Circle
                  </Button>
                  <Button
                    onClick={() => addShape('rectangle')}
                    className={eInkStyles.button}
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Rectangle
                  </Button>
                  <Button
                    onClick={() => addShape('line')}
                    className={eInkStyles.button}
                  >
                    <Minus className="h-4 w-4 mr-2" />
                    Line
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Text Tool */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Text</h4>
                <Button
                  onClick={addText}
                  className={eInkStyles.button}
                >
                  <Type className="h-4 w-4 mr-2" />
                  Add Text
                </Button>
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Actions</h4>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={clearCanvas}
                    className={eInkStyles.button}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                  <Button
                    onClick={handleDownload}
                    className={eInkStyles.button}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Zoom Controls */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Zoom</h4>
                <div className="flex gap-2">
                  <Button
                    onClick={zoomOut}
                    className={eInkStyles.button}
                    size="sm"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="flex items-center px-2 text-sm">
                    {Math.round(scale * 100)}%
                  </span>
                  <Button
                    onClick={zoomIn}
                    className={eInkStyles.button}
                    size="sm"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* PDF and Canvas Container */}
          <Card className={`${eInkStyles.card} col-span-12 md:col-span-9`}>
            <div className="p-4">
              <div className="relative" ref={containerRef}>
                {/* PDF Document */}
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="relative"
                >
                  <Page
                    pageNumber={currentPage}
                    scale={scale}
                    className="shadow-lg"
                  />
                </Document>

                {/* Annotation Canvas Overlay */}
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 border-2 border-dashed border-gray-300 opacity-90 cursor-crosshair"
                  style={{
                    width: `${800 * scale}px`,
                    height: `${1100 * scale}px`,
                    pointerEvents: 'all',
                  }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />
              </div>

              {/* Page Navigation */}
              {numPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage <= 1}
                    className={eInkStyles.button}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {numPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
                    disabled={currentPage >= numPages}
                    className={eInkStyles.button}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
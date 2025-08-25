import React, { useState, useRef, useEffect, useCallback } from 'react';
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

interface PDFAnnotatorProps {
  pdfUrl: string;
  assignmentId: string;
  onSave: (annotatedFileUrl: string) => void;
  onClose: () => void;
}

type Tool = 'pen' | 'eraser' | 'text' | 'highlight' | 'circle' | 'rectangle' | 'line';

export function PDFAnnotator({ pdfUrl, assignmentId, onSave, onClose }: PDFAnnotatorProps) {
  const [scale, setScale] = useState<number>(1.0);
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfViewerRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // E-ink optimized styles
  const eInkStyles = {
    card: "bg-white border-2 border-black rounded-none",
    button: "bg-white border-2 border-black text-black hover:bg-gray-100 rounded-none h-12 px-4",
    activeButton: "bg-black text-white border-2 border-black hover:bg-gray-800 rounded-none h-12 px-4",
    toolbar: "bg-white border-2 border-black p-4 space-x-2",
  };

  // Initialize canvas
  const initializeCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    canvas.width = 800;
    canvas.height = 800;
    
    // Configure context for high-quality drawing
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    // Clear canvas and set transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;
  }, [scale]);

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'text') {
      addTextAtPosition(e);
      return;
    }
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Configure brush for current tool
    switch (activeTool) {
      case 'pen':
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3 * scale;
        break;
      case 'highlight':
        ctx.globalCompositeOperation = 'multiply';
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.lineWidth = 20 * scale;
        break;
      case 'eraser':
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 20 * scale;
        break;
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Touch support for mobile/tablet devices
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const fakeEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY
    } as React.MouseEvent<HTMLCanvasElement>;
    
    startDrawing(fakeEvent);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const fakeEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY
    } as React.MouseEvent<HTMLCanvasElement>;
    
    draw(fakeEvent);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    stopDrawing();
  };

  // Tool handlers
  const handleToolChange = (tool: Tool) => {
    setActiveTool(tool);
  };

  const addTextAtPosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const text = prompt("Enter text:");
    if (!text || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    ctx.globalCompositeOperation = 'source-over';
    ctx.font = `${16 * scale}px Arial`;
    ctx.fillStyle = '#000000';
    ctx.fillText(text, x, y);
  };

  const addShape = (shape: 'circle' | 'rectangle' | 'line') => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2 * scale;
    ctx.fillStyle = 'transparent';

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    switch (shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(centerX, centerY, 50 * scale, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      case 'rectangle':
        ctx.strokeRect(centerX - 75 * scale, centerY - 40 * scale, 150 * scale, 80 * scale);
        break;
      case 'line':
        ctx.beginPath();
        ctx.moveTo(centerX - 75 * scale, centerY);
        ctx.lineTo(centerX + 75 * scale, centerY);
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

  // Save annotated work
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
        headers: {
          'Content-Type': 'image/png'
        }
      });

      if (uploadResult.ok) {
        const fileUrl = uploadResponse.uploadURL.split('?')[0];
        const objectPath = fileUrl.includes('/uploads/') 
          ? fileUrl.split('/uploads/')[1] 
          : fileUrl.split('/').pop();
        
        // Set metadata for the annotated file
        try {
          await apiRequest('/api/objects/metadata', 'POST', {
            objectPath,
            metadata: {
              originalFilename: `annotated-assignment-${assignmentId}.png`,
              annotated: true,
              assignmentId: assignmentId
            }
          });
        } catch (metadataError) {
          console.warn('Failed to set metadata, but upload succeeded:', metadataError);
        }
        
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
  const zoomIn = () => {
    setScale(prev => {
      const newScale = Math.min(prev + 0.2, 3);
      setTimeout(initializeCanvas, 100);
      return newScale;
    });
  };

  const zoomOut = () => {
    setScale(prev => {
      const newScale = Math.max(prev - 0.2, 0.5);
      setTimeout(initializeCanvas, 100);
      return newScale;
    });
  };

  // Initialize canvas
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
              
              {/* Navigation Mode */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Mode</h4>
                <Button
                  onClick={() => setActiveTool(null)}
                  className={activeTool === null ? eInkStyles.activeButton : eInkStyles.button}
                >
                  <span className="h-4 w-4 mr-2">📄</span>
                  Navigate PDF
                </Button>
              </div>

              <Separator />

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
                  onClick={() => handleToolChange('text')}
                  className={activeTool === 'text' ? eInkStyles.activeButton : eInkStyles.button}
                >
                  <Type className="h-4 w-4 mr-2" />
                  Add Text
                </Button>
                <p className="text-xs text-gray-600">Click on canvas to add text</p>
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
                <div className="flex gap-2 items-center">
                  <Button
                    onClick={zoomOut}
                    className={eInkStyles.button}
                    size="sm"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="flex items-center px-2 text-sm min-w-[60px] text-center">
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
              <div className="relative bg-white border rounded overflow-hidden" ref={containerRef}>
                {/* Container that moves together */}
                <div 
                  className="relative"
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    width: `${100 / scale}%`,
                    height: `${800 / scale}px`,
                  }}
                >
                  {/* PDF Iframe */}
                  <iframe
                    ref={pdfViewerRef}
                    src={`${pdfUrl}#view=FitH`}
                    className="w-full h-[800px] border-0 block"
                    onLoad={() => setPdfLoaded(true)}
                  />

                  {/* Annotation Canvas Overlay - positioned relative to PDF */}
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 opacity-90"
                    width={800}
                    height={800}
                    style={{
                      width: '100%',
                      height: '800px',
                      cursor: activeTool === 'text' ? 'text' : activeTool === 'eraser' ? 'grab' : activeTool === 'pen' || activeTool === 'highlight' ? 'crosshair' : 'default',
                      pointerEvents: activeTool === 'pen' || activeTool === 'highlight' || activeTool === 'text' || activeTool === 'eraser' ? 'auto' : 'none',
                      zIndex: activeTool === 'pen' || activeTool === 'highlight' || activeTool === 'text' || activeTool === 'eraser' ? 10 : 1,
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
              </div>

              {/* Instructions */}
              <div className="mt-4 p-3 bg-gray-50 border rounded text-sm">
                <h4 className="font-medium mb-2">How to use:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Select a tool from the toolbar on the left</li>
                  <li>• Draw directly on the document with your mouse, stylus, or finger</li>
                  <li>• Use the Text tool to click and add typed text anywhere</li>
                  <li>• Use Zoom controls to get closer for detailed work</li>
                  <li>• Click "Save Work" when finished to submit your annotated assignment</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
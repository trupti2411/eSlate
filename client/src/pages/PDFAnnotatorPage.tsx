import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Save, X, Pen, Highlighter, Eraser, Type, RotateCcw, Download, ZoomIn, ZoomOut, Home } from 'lucide-react';

type Tool = 'pen' | 'eraser' | 'text' | 'highlight';

export function PDFAnnotatorPage() {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const pdfViewerRef = useRef<HTMLIFrameElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const pdfUrl = urlParams.get('pdf') || '';
  const assignmentId = urlParams.get('assignmentId') || '';

  // Submit assignment mutation
  const submitAssignmentMutation = useMutation({
    mutationFn: async (fileUrl: string) => {
      return apiRequest('/api/submissions', 'POST', {
        assignmentId: assignmentId,
        fileUrls: [fileUrl],
        textResponse: "",
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      toast({
        title: "Assignment Submitted Successfully",
        description: "Your annotated assignment has been saved and submitted.",
      });
    },
    onError: (error) => {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit your assignment. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Initialize canvas with proper sizing and scrolling sync
  const initializeCanvas = useCallback(() => {
    if (!canvasRef.current || !pdfContainerRef.current) return;

    const canvas = canvasRef.current;
    const container = pdfContainerRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match the PDF container
    const rect = container.getBoundingClientRect();
    canvas.width = container.scrollWidth;
    canvas.height = container.scrollHeight;
    
    // Position canvas to overlay perfectly on PDF
    canvas.style.width = container.scrollWidth + 'px';
    canvas.style.height = container.scrollHeight + 'px';
    
    // Configure context for high-quality drawing
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 1.0;
  }, []);

  // Get coordinate relative to PDF content accounting for scroll
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !pdfContainerRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const container = pdfContainerRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Get mouse position relative to canvas
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    // Account for container scroll position
    const scrollX = container.scrollLeft;
    const scrollY = container.scrollTop;
    
    return {
      x: x + scrollX,
      y: y + scrollY
    };
  };

  // Drawing functions with proper coordinate handling
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'text') {
      addTextAtPosition(e);
      return;
    }
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const coords = getCanvasCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    
    // Configure brush for current tool
    switch (activeTool) {
      case 'pen':
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3 / scale; // Adjust line width for zoom
        break;
      case 'highlight':
        ctx.globalCompositeOperation = 'multiply';
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.lineWidth = 20 / scale;
        break;
      case 'eraser':
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 20 / scale;
        break;
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const coords = getCanvasCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const addTextAtPosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const text = prompt('Enter text:');
    if (!text) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoordinates(e);

    ctx.globalCompositeOperation = 'source-over';
    ctx.font = `${18 / scale}px Arial`; // Adjust font size for zoom
    ctx.fillStyle = '#000000';
    ctx.fillText(text, coords.x, coords.y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `annotated-assignment-${assignmentId}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const zoomIn = () => setScale(prev => Math.min(prev * 1.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.5));

  // Save annotated work with proper error handling
  const handleSave = async () => {
    if (!canvasRef.current || isSaving) return;

    setIsSaving(true);
    console.log('Starting save process...');
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Check if canvas has any annotations
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      let hasContent = false;
      if (imageData) {
        const data = imageData.data;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] !== 0) {
            hasContent = true;
            break;
          }
        }
      }

      if (!hasContent) {
        toast({
          title: "No Annotations Found",
          description: "Please add some annotations before saving your work.",
          variant: "destructive",
        });
        return;
      }

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        }, 'image/png', 1.0);
      });

      console.log('Canvas blob created:', blob.size, 'bytes');

      // Create FormData for upload
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const file = new File([blob], `annotated-assignment-${assignmentId}-${timestamp}.png`, { 
        type: 'image/png' 
      });

      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading file:', file.name);
      
      const response = await fetch('/api/objects/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      
      if (!result.uploadURL) {
        throw new Error('No upload URL received');
      }

      // Clean URL and submit assignment
      const cleanUrl = result.uploadURL.replace(/\?.*$/, '');
      console.log('Submitting assignment with URL:', cleanUrl);
      
      await submitAssignmentMutation.mutateAsync(cleanUrl);

    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: `There was an error saving your work: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle tool change
  const handleToolChange = (tool: Tool) => {
    setActiveTool(tool);
  };

  // Sync canvas with PDF on load and resize
  useEffect(() => {
    if (pdfLoaded) {
      setTimeout(initializeCanvas, 100);
    }
  }, [pdfLoaded, initializeCanvas, scale]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setTimeout(initializeCanvas, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initializeCanvas]);

  // Sync canvas on PDF container scroll
  useEffect(() => {
    const container = pdfContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Canvas stays in sync automatically due to positioning
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">PDF Annotation</h1>
          <div className="text-sm text-gray-600">
            Assignment ID: {assignmentId}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save & Submit'}
          </Button>
          <Button
            onClick={() => window.close()}
            variant="outline"
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          <Button
            onClick={() => window.open('/student', '_blank')}
            variant="outline"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Portal
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Toolbar */}
        <div className="w-64 bg-white border-r p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Mode Selection */}
            <div>
              <h3 className="font-medium mb-3">Mode</h3>
              <Button
                onClick={() => setActiveTool(null)}
                className={`w-full justify-start ${activeTool === null ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              >
                📄 Navigate PDF
              </Button>
            </div>

            {/* Drawing Tools */}
            <div>
              <h3 className="font-medium mb-3">Drawing Tools</h3>
              <div className="space-y-2">
                <Button
                  onClick={() => handleToolChange('pen')}
                  className={`w-full justify-start ${activeTool === 'pen' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                >
                  <Pen className="h-4 w-4 mr-2" />
                  Pen
                </Button>
                <Button
                  onClick={() => handleToolChange('highlight')}
                  className={`w-full justify-start ${activeTool === 'highlight' ? 'bg-yellow-400 text-black' : 'bg-gray-100'}`}
                >
                  <Highlighter className="h-4 w-4 mr-2" />
                  Highlight
                </Button>
                <Button
                  onClick={() => handleToolChange('eraser')}
                  className={`w-full justify-start ${activeTool === 'eraser' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}
                >
                  <Eraser className="h-4 w-4 mr-2" />
                  Eraser
                </Button>
                <Button
                  onClick={() => handleToolChange('text')}
                  className={`w-full justify-start ${activeTool === 'text' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
                >
                  <Type className="h-4 w-4 mr-2" />
                  Add Text
                </Button>
              </div>
            </div>

            {/* Zoom Controls */}
            <div>
              <h3 className="font-medium mb-3">Zoom</h3>
              <div className="flex items-center gap-2 mb-2">
                <Button onClick={zoomOut} size="sm" variant="outline">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="flex-1 text-center text-sm">{Math.round(scale * 100)}%</span>
                <Button onClick={zoomIn} size="sm" variant="outline">
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div>
              <h3 className="font-medium mb-3">Actions</h3>
              <div className="space-y-2">
                <Button onClick={clearCanvas} className="w-full justify-start" variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
                <Button onClick={handleDownload} className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PNG
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 relative">
          <div 
            ref={pdfContainerRef}
            className="relative w-full h-full overflow-auto bg-gray-50"
            style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}
          >
            <iframe
              ref={pdfViewerRef}
              src={pdfUrl}
              className="w-full h-full border-0 block"
              style={{ minHeight: '100vh' }}
              onLoad={() => {
                setPdfLoaded(true);
                setTimeout(initializeCanvas, 200);
              }}
            />
            
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 pointer-events-auto"
              style={{
                cursor: activeTool === 'text' ? 'text' : 
                       activeTool === 'eraser' ? 'grab' : 
                       activeTool === 'pen' || activeTool === 'highlight' ? 'crosshair' : 'default',
                pointerEvents: activeTool ? 'auto' : 'none',
                zIndex: activeTool ? 10 : 1
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t p-2 text-sm text-gray-600 flex justify-between items-center">
        <div>
          Current Tool: {activeTool ? activeTool.charAt(0).toUpperCase() + activeTool.slice(1) : 'Navigate'} | 
          PDF Status: {pdfLoaded ? 'Loaded' : 'Loading...'}
        </div>
        <div>
          Tip: Select "Navigate PDF" to scroll, then choose a tool to annotate
        </div>
      </div>
    </div>
  );
}
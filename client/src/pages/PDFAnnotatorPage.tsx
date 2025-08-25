import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Save, Send, X, Pen, Highlighter, Eraser, Type, RotateCcw, Download, ZoomIn, ZoomOut, Home } from 'lucide-react';

type Tool = 'pen' | 'eraser' | 'text' | 'highlight';

export function PDFAnnotatorPage() {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const [annotations, setAnnotations] = useState<Array<{
    type: 'stroke' | 'text';
    points?: Array<{x: number, y: number}>;
    text?: string;
    x?: number;
    y?: number;
    style: {
      color: string;
      lineWidth: number;
      globalCompositeOperation: string;
    };
  }>>([]);
  const [currentStroke, setCurrentStroke] = useState<Array<{x: number, y: number}>>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const pdfViewerRef = useRef<HTMLIFrameElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get URL parameters and construct proper PDF URL
  const urlParams = new URLSearchParams(window.location.search);
  const rawPdfUrl = urlParams.get('pdf') || '';
  const assignmentId = urlParams.get('assignmentId') || '';
  
  // Ensure PDF URL is properly constructed
  const pdfUrl = rawPdfUrl.startsWith('/') ? rawPdfUrl : `/${rawPdfUrl}`;
  
  console.log('PDF Annotator initialized:', { pdfUrl, assignmentId });

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

  // Initialize fixed canvas overlay
  const initializeCanvas = useCallback(() => {
    if (!canvasRef.current || !pdfContainerRef.current) return;

    const canvas = canvasRef.current;
    const container = pdfContainerRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to match container viewport (not scroll area)
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Configure context for high-quality drawing
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 1.0;
    
    // Load and redraw all annotations
    loadSavedWork();
    redrawAnnotations();
    
    console.log('Canvas initialized as fixed overlay:', { width: canvas.width, height: canvas.height });
  }, []);

  // Check if mouse is over scrollbar area
  const isOverScrollbar = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!pdfContainerRef.current) return false;
    
    const container = pdfContainerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Check if cursor is near right edge (vertical scrollbar area)
    const isNearRightEdge = e.clientX > rect.right - 20;
    // Check if cursor is near bottom edge (horizontal scrollbar area)  
    const isNearBottomEdge = e.clientY > rect.bottom - 20;
    
    return isNearRightEdge || isNearBottomEdge;
  };

  // Get viewport coordinates and convert to absolute PDF coordinates
  const getAbsoluteCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !pdfContainerRef.current) return { x: 0, y: 0 };
    
    const container = pdfContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // Get mouse position relative to the PDF container (not canvas)
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;
    
    // Add scroll offset to get absolute position in PDF document
    return {
      x: x + container.scrollLeft,
      y: y + container.scrollTop
    };
  };

  // Convert absolute PDF coordinates to current viewport coordinates
  const absoluteToViewport = (absoluteX: number, absoluteY: number) => {
    if (!pdfContainerRef.current) return { x: 0, y: 0 };
    
    const container = pdfContainerRef.current;
    return {
      x: absoluteX - container.scrollLeft,
      y: absoluteY - container.scrollTop
    };
  };

  // Redraw all annotations on the current viewport
  const redrawAnnotations = useCallback(() => {
    if (!canvasRef.current || !pdfContainerRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw each annotation
    annotations.forEach(annotation => {
      ctx.save();
      ctx.globalCompositeOperation = annotation.style.globalCompositeOperation as GlobalCompositeOperation;
      ctx.strokeStyle = annotation.style.color;
      ctx.lineWidth = annotation.style.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (annotation.type === 'stroke' && annotation.points) {
        ctx.beginPath();
        annotation.points.forEach((point, index) => {
          const viewportCoords = absoluteToViewport(point.x, point.y);
          if (index === 0) {
            ctx.moveTo(viewportCoords.x, viewportCoords.y);
          } else {
            ctx.lineTo(viewportCoords.x, viewportCoords.y);
          }
        });
        ctx.stroke();
      } else if (annotation.type === 'text' && annotation.text && annotation.x !== undefined && annotation.y !== undefined) {
        const viewportCoords = absoluteToViewport(annotation.x, annotation.y);
        ctx.fillStyle = annotation.style.color;
        ctx.font = '18px Arial';
        ctx.fillText(annotation.text, viewportCoords.x, viewportCoords.y);
      }
      
      ctx.restore();
    });
  }, [annotations]);

  // Drawing functions with absolute coordinate storage
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Don't draw if over scrollbar or no tool selected
    if (!activeTool || isOverScrollbar(e)) return;
    
    if (activeTool === 'text') {
      addTextAtPosition(e);
      return;
    }
    
    setIsDrawing(true);
    const coords = getAbsoluteCoordinates(e);
    setCurrentStroke([coords]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !activeTool || isOverScrollbar(e)) return;
    
    const coords = getAbsoluteCoordinates(e);
    setCurrentStroke(prev => [...prev, coords]);
    
    // Draw current stroke in real-time
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    // Redraw everything to show current stroke
    redrawAnnotations();
    
    // Draw current stroke
    if (currentStroke.length > 0) {
      ctx.save();
      switch (activeTool) {
        case 'pen':
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 3;
          break;
        case 'highlight':
          ctx.globalCompositeOperation = 'multiply';
          ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
          ctx.lineWidth = 20;
          break;
        case 'eraser':
          ctx.globalCompositeOperation = 'destination-out';
          ctx.lineWidth = 20;
          break;
      }
      
      ctx.beginPath();
      [...currentStroke, coords].forEach((point, index) => {
        const viewportCoords = absoluteToViewport(point.x, point.y);
        if (index === 0) {
          ctx.moveTo(viewportCoords.x, viewportCoords.y);
        } else {
          ctx.lineTo(viewportCoords.x, viewportCoords.y);
        }
      });
      ctx.stroke();
      ctx.restore();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing || currentStroke.length === 0 || !activeTool) return;
    
    // Save the completed stroke
    const newAnnotation = {
      type: 'stroke' as const,
      points: [...currentStroke],
      style: {
        color: activeTool === 'pen' ? '#000000' : 
               activeTool === 'highlight' ? 'rgba(255, 255, 0, 0.5)' : '#000000',
        lineWidth: activeTool === 'pen' ? 3 : 20,
        globalCompositeOperation: activeTool === 'eraser' ? 'destination-out' : 'source-over'
      }
    };
    
    setAnnotations(prev => [...prev, newAnnotation]);
    setCurrentStroke([]);
    setIsDrawing(false);
  };

  const addTextAtPosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Don't add text if over scrollbar
    if (isOverScrollbar(e)) return;
    
    const text = prompt('Enter text:');
    if (!text) return;

    const coords = getAbsoluteCoordinates(e);
    
    const newAnnotation = {
      type: 'text' as const,
      text,
      x: coords.x,
      y: coords.y,
      style: {
        color: '#000000',
        lineWidth: 0,
        globalCompositeOperation: 'source-over'
      }
    };
    
    setAnnotations(prev => [...prev, newAnnotation]);
  };

  const clearCanvas = () => {
    setAnnotations([]);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Save work to localStorage
  const saveWork = async () => {
    if (isSaving || annotations.length === 0) return;

    setIsSaving(true);
    try {
      // Save annotations data structure instead of image
      const saveKey = `pdf-annotation-data-${assignmentId}`;
      localStorage.setItem(saveKey, JSON.stringify(annotations));
      
      toast({
        title: "Work Saved",
        description: "Your annotations have been saved locally. You can continue working later.",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save your work locally.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Load saved work from localStorage
  const loadSavedWork = () => {
    if (!assignmentId) return;

    const saveKey = `pdf-annotation-data-${assignmentId}`;
    const savedData = localStorage.getItem(saveKey);
    
    if (savedData) {
      try {
        const savedAnnotations = JSON.parse(savedData);
        setAnnotations(savedAnnotations);
        console.log('Loaded saved annotations:', savedAnnotations.length);
      } catch (error) {
        console.error('Failed to load saved annotations:', error);
      }
    }
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

  // Submit assignment (separate from save)
  const handleSubmit = async () => {
    if (!canvasRef.current || isSubmitting) return;

    setIsSubmitting(true);
    console.log('Starting submission process...');
    
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
          title: "No Work to Submit",
          description: "Please add some annotations before submitting your assignment.",
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

      console.log('Canvas blob created for submission:', blob.size, 'bytes');

      // Create FormData for upload
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const file = new File([blob], `submitted-assignment-${assignmentId}-${timestamp}.png`, { 
        type: 'image/png' 
      });

      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading final submission:', file.name);
      
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

      // Clear saved work after successful submission
      const saveKey = `pdf-annotation-data-${assignmentId}`;
      localStorage.removeItem(saveKey);

    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: `There was an error submitting your assignment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle tool change
  const handleToolChange = (tool: Tool) => {
    setActiveTool(tool);
  };

  // Sync canvas with PDF on load and resize
  useEffect(() => {
    if (pdfLoaded) {
      const timer = setTimeout(initializeCanvas, 100);
      return () => clearTimeout(timer);
    }
  }, [pdfLoaded, initializeCanvas]);

  // Re-initialize canvas when scale changes
  useEffect(() => {
    if (pdfLoaded) {
      const timer = setTimeout(initializeCanvas, 100);
      return () => clearTimeout(timer);
    }
  }, [scale, pdfLoaded, initializeCanvas]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setTimeout(initializeCanvas, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initializeCanvas]);

  // Redraw annotations when scrolling to keep them synchronized
  useEffect(() => {
    const container = pdfContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Redraw annotations at their correct positions relative to current viewport
      redrawAnnotations();
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [redrawAnnotations]);

  // Redraw annotations when annotations change
  useEffect(() => {
    redrawAnnotations();
  }, [annotations, redrawAnnotations]);

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
            onClick={saveWork}
            disabled={isSaving}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Work'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
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

            {/* Drawing Tools */}
            <div>
              <h3 className="font-medium mb-3">Drawing Tools</h3>
              <div className="space-y-2">
                <Button
                  onClick={() => handleToolChange('pen')}
                  variant={activeTool === 'pen' ? 'default' : 'outline'}
                  className={`w-full justify-start text-black ${activeTool === 'pen' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
                >
                  <Pen className="h-4 w-4 mr-2" />
                  <span className="font-medium">Pen</span>
                </Button>
                <Button
                  onClick={() => handleToolChange('highlight')}
                  variant={activeTool === 'highlight' ? 'default' : 'outline'}
                  className={`w-full justify-start text-black ${activeTool === 'highlight' ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
                >
                  <Highlighter className="h-4 w-4 mr-2" />
                  <span className="font-medium">Highlight</span>
                </Button>
                <Button
                  onClick={() => handleToolChange('eraser')}
                  variant={activeTool === 'eraser' ? 'default' : 'outline'}
                  className={`w-full justify-start text-black ${activeTool === 'eraser' ? 'bg-red-600 text-white border-red-600' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
                >
                  <Eraser className="h-4 w-4 mr-2" />
                  <span className="font-medium">Eraser</span>
                </Button>
                <Button
                  onClick={() => handleToolChange('text')}
                  variant={activeTool === 'text' ? 'default' : 'outline'}
                  className={`w-full justify-start text-black ${activeTool === 'text' ? 'bg-green-600 text-white border-green-600' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
                >
                  <Type className="h-4 w-4 mr-2" />
                  <span className="font-medium">Add Text</span>
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
        <div className="flex-1 relative bg-gray-200">
          <div 
            ref={pdfContainerRef}
            className="relative w-full h-full overflow-auto"
            style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}
          >
            <iframe
              ref={pdfViewerRef}
              src={pdfUrl}
              className="w-full border-0 block bg-white"
              style={{ 
                height: '100vh',
                minHeight: '800px',
                width: '100%'
              }}
              onLoad={() => {
                setPdfLoaded(true);
                setTimeout(initializeCanvas, 500);
              }}
              title="PDF Document"
            />
            
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
              style={{
                cursor: activeTool === 'text' ? 'text' : 
                       activeTool === 'eraser' ? 'crosshair' : 
                       activeTool === 'pen' || activeTool === 'highlight' ? 'crosshair' : 'default',
                pointerEvents: 'none',
                zIndex: 2
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            
            {/* Invisible overlay for drawing events only */}
            <div
              className="absolute top-0 left-0 w-full h-full"
              style={{
                pointerEvents: activeTool ? 'auto' : 'none',
                zIndex: 3,
                cursor: activeTool === 'text' ? 'text' : 
                       activeTool === 'eraser' ? 'crosshair' : 
                       activeTool === 'pen' || activeTool === 'highlight' ? 'crosshair' : 'default'
              }}
              onMouseDown={(e) => {
                const canvasEvent = {
                  ...e,
                  currentTarget: canvasRef.current
                } as any;
                startDrawing(canvasEvent);
              }}
              onMouseMove={(e) => {
                const canvasEvent = {
                  ...e,
                  currentTarget: canvasRef.current
                } as any;
                draw(canvasEvent);
              }}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t p-2 text-sm text-gray-600 flex justify-between items-center">
        <div>
          Current Tool: {activeTool ? activeTool.charAt(0).toUpperCase() + activeTool.slice(1) : 'None'} | 
          PDF Status: {pdfLoaded ? 'Loaded' : 'Loading...'}
        </div>
        <div>
          Tip: Select a drawing tool to annotate, scroll naturally to navigate the PDF
        </div>
      </div>
    </div>
  );
}
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Save, Send, X, Pen, Highlighter, Eraser, Type, RotateCcw, Download, ZoomIn, ZoomOut, Home } from 'lucide-react';

type Tool = 'pen' | 'eraser' | 'text' | 'highlight';

interface Annotation {
  type: 'stroke' | 'text';
  points?: Array<{x: number, y: number}>;
  text?: string;
  x?: number;
  y?: number;
  page: number;
  style: {
    color: string;
    lineWidth: number;
    globalCompositeOperation: string;
  };
}

export function PDFAnnotatorPage() {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [isAnnotationMode, setIsAnnotationMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [scale, setScale] = useState(1.2);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Array<{x: number, y: number}>>([]);
  
  const pdfViewerRef = useRef<HTMLIFrameElement>(null);
  const annotationCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const rawPdfUrl = urlParams.get('pdf') || '';
  const assignmentId = urlParams.get('assignmentId') || '';
  
  // Construct proper Google Cloud Storage URL
  const pdfUrl = rawPdfUrl.includes('http') 
    ? rawPdfUrl 
    : `https://storage.googleapis.com/replit-objstore-792cd13a-ccaf-496a-97b4-c254b4221184/${rawPdfUrl.replace(/^\/+/, '')}`;

  // Load PDF in iframe
  const loadPDF = useCallback(() => {
    if (!pdfUrl) return;
    
    console.log('Loading PDF:', pdfUrl);
    setPdfLoaded(true);
    setTotalPages(1); // Simplified for iframe approach
    setCurrentPage(1);
  }, [pdfUrl]);

  // Initialize canvas overlay
  const initializeCanvas = useCallback(() => {
    if (!annotationCanvasRef.current || !containerRef.current) return;
    
    const canvas = annotationCanvasRef.current;
    const container = containerRef.current;
    
    // Match canvas size to container
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    console.log('Canvas initialized:', { width: canvas.width, height: canvas.height });
  }, []);

  // Redraw all annotations
  const redrawAnnotations = useCallback(() => {
    if (!annotationCanvasRef.current) return;
    
    const canvas = annotationCanvasRef.current;
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
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      } else if (annotation.type === 'text' && annotation.text && annotation.x !== undefined && annotation.y !== undefined) {
        ctx.fillStyle = annotation.style.color;
        ctx.font = '18px Arial';
        ctx.fillText(annotation.text, annotation.x, annotation.y);
      }
      
      ctx.restore();
    });
  }, [annotations]);

  // Get coordinates relative to canvas
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!annotationCanvasRef.current) return { x: 0, y: 0 };
    
    const canvas = annotationCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeTool || !isAnnotationMode) return;
    
    if (activeTool === 'text') {
      addTextAtPosition(e);
      return;
    }
    
    setIsDrawing(true);
    const coords = getCanvasCoordinates(e);
    setCurrentStroke([coords]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !activeTool || !isAnnotationMode) return;
    
    const coords = getCanvasCoordinates(e);
    setCurrentStroke(prev => [...prev, coords]);
    
    // Draw current stroke in real-time
    const canvas = annotationCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    // Redraw annotations
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
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
      ctx.restore();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing || currentStroke.length === 0 || !activeTool) return;
    
    // Save the completed stroke
    const newAnnotation: Annotation = {
      type: 'stroke',
      points: [...currentStroke],
      page: currentPage,
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
    const text = prompt('Enter text:');
    if (!text) return;

    const coords = getCanvasCoordinates(e);
    
    const newAnnotation: Annotation = {
      type: 'text',
      text,
      x: coords.x,
      y: coords.y,
      page: currentPage,
      style: {
        color: '#000000',
        lineWidth: 0,
        globalCompositeOperation: 'source-over'
      }
    };
    
    setAnnotations(prev => [...prev, newAnnotation]);
  };

  // Tool and mode functions
  const toggleMode = () => {
    const newMode = !isAnnotationMode;
    setIsAnnotationMode(newMode);
    if (!newMode) {
      setActiveTool(null);
    } else {
      setActiveTool('pen');
    }
  };

  const handleToolChange = (tool: Tool) => {
    if (!isAnnotationMode) {
      setIsAnnotationMode(true);
    }
    setActiveTool(tool);
  };

  // Clear all annotations
  const clearCanvas = () => {
    setAnnotations([]);
  };

  // Save work to localStorage
  const saveWork = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const saveKey = `pdf-annotation-data-${assignmentId}`;
      const saveData = {
        annotations,
        currentPage,
        scale
      };
      localStorage.setItem(saveKey, JSON.stringify(saveData));
      
      toast({
        title: "Work Saved",
        description: "Your annotations have been saved locally.",
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

  // Load saved work
  const loadSavedWork = () => {
    if (!assignmentId) return;

    const saveKey = `pdf-annotation-data-${assignmentId}`;
    const savedData = localStorage.getItem(saveKey);
    
    if (savedData) {
      try {
        const { annotations: savedAnnotations, currentPage: savedPage, scale: savedScale } = JSON.parse(savedData);
        setAnnotations(savedAnnotations || []);
        if (savedPage) setCurrentPage(savedPage);
        if (savedScale) setScale(savedScale);
      } catch (error) {
        console.error('Failed to load saved work:', error);
      }
    }
  };

  // Submit assignment mutation
  const submitAssignmentMutation = useMutation({
    mutationFn: async (submissionUrl: string) => {
      return await apiRequest('/api/submissions', 'POST', {
        assignmentId,
        submissionUrl,
        submissionText: 'PDF annotation completed',
        status: 'submitted'
      });
    },
    onSuccess: () => {
      toast({
        title: "Assignment Submitted",
        description: "Your annotated assignment has been submitted successfully!",
      });
    },
    onError: (error) => {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed", 
        description: "There was an error submitting your assignment.",
        variant: "destructive",
      });
    }
  });

  // Submit assignment
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Create canvas with current annotations for submission
      const canvas = annotationCanvasRef.current;
      if (!canvas) throw new Error('No canvas available');
      
      // Convert to blob and upload
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Failed to create image blob');
        
        const formData = new FormData();
        formData.append('file', blob, 'annotated-assignment.png');
        formData.append('path', 'uploads');
        
        const result = await apiRequest('/api/objects/upload', 'POST', formData);
        
        const cleanUrl = result.uploadURL.replace(/\?.*$/, '');
        await submitAssignmentMutation.mutateAsync(cleanUrl);
        
        // Clear saved work
        const saveKey = `pdf-annotation-data-${assignmentId}`;
        localStorage.removeItem(saveKey);
      }, 'image/png');
      
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your assignment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize PDF when component mounts
  useEffect(() => {
    loadSavedWork();
    loadPDF();
  }, [loadPDF]);

  // Initialize canvas when PDF loads
  useEffect(() => {
    if (pdfLoaded) {
      const timer = setTimeout(initializeCanvas, 100);
      return () => clearTimeout(timer);
    }
  }, [pdfLoaded, initializeCanvas]);

  // Redraw annotations when they change
  useEffect(() => {
    redrawAnnotations();
  }, [annotations, redrawAnnotations]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setTimeout(initializeCanvas, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initializeCanvas]);

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">PDF Annotation - Assignment {assignmentId}</h1>
        <div className="flex gap-2">
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
          <Button onClick={() => window.close()} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Toolbar */}
        <div className="w-64 bg-white border-r p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Mode Toggle */}
            <div>
              <Button
                onClick={toggleMode}
                variant={isAnnotationMode ? 'default' : 'outline'}
                className={`w-full justify-center mb-6 text-sm font-medium ${
                  isAnnotationMode 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white border-gray-300 hover:bg-gray-50 text-black'
                }`}
              >
                {isAnnotationMode ? '✏️ ANNOTATION MODE' : '👀 VIEW MODE (Click to Annotate)'}
              </Button>
            </div>

            {/* Drawing Tools - Only show when in annotation mode */}
            {isAnnotationMode && (
              <div>
                <h3 className="font-medium mb-3">Drawing Tools</h3>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleToolChange('pen')}
                    variant={activeTool === 'pen' ? 'default' : 'outline'}
                    className={`w-full justify-start ${activeTool === 'pen' ? 'bg-blue-600 text-white' : ''}`}
                  >
                    <Pen className="h-4 w-4 mr-2" />
                    Pen
                  </Button>
                  <Button
                    onClick={() => handleToolChange('highlight')}
                    variant={activeTool === 'highlight' ? 'default' : 'outline'}
                    className={`w-full justify-start ${activeTool === 'highlight' ? 'bg-yellow-400 text-black' : ''}`}
                  >
                    <Highlighter className="h-4 w-4 mr-2" />
                    Highlight
                  </Button>
                  <Button
                    onClick={() => handleToolChange('eraser')}
                    variant={activeTool === 'eraser' ? 'default' : 'outline'}
                    className={`w-full justify-start ${activeTool === 'eraser' ? 'bg-red-600 text-white' : ''}`}
                  >
                    <Eraser className="h-4 w-4 mr-2" />
                    Eraser
                  </Button>
                  <Button
                    onClick={() => handleToolChange('text')}
                    variant={activeTool === 'text' ? 'default' : 'outline'}
                    className={`w-full justify-start ${activeTool === 'text' ? 'bg-green-600 text-white' : ''}`}
                  >
                    <Type className="h-4 w-4 mr-2" />
                    Add Text
                  </Button>
                </div>
              </div>
            )}

            {/* Zoom Controls */}
            <div>
              <h3 className="font-medium mb-3">Zoom</h3>
              <div className="flex items-center gap-2 mb-2">
                <Button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} size="sm" variant="outline">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="flex-1 text-center text-sm">{Math.round(scale * 100)}%</span>
                <Button onClick={() => setScale(s => Math.min(3, s + 0.2))} size="sm" variant="outline">
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
              </div>
            </div>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 relative bg-gray-200 overflow-auto" ref={containerRef}>
          {/* PDF iframe */}
          <iframe
            ref={pdfViewerRef}
            src={pdfUrl}
            className="w-full h-full bg-white"
            title="PDF Document"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left'
            }}
          />
          
          {/* Annotation Canvas Overlay */}
          <canvas
            ref={annotationCanvasRef}
            className="absolute top-0 left-0"
            style={{
              pointerEvents: isAnnotationMode ? 'auto' : 'none',
              cursor: isAnnotationMode && activeTool ? 
                (activeTool === 'text' ? 'text' : 'crosshair') : 'default',
              zIndex: isAnnotationMode ? 10 : 5
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t p-2 text-sm text-gray-600 flex justify-between items-center">
        <div>
          Mode: {isAnnotationMode ? `Annotating (${activeTool?.toUpperCase()})` : 'Viewing'} | 
          PDF Status: {pdfLoaded ? 'Loaded' : 'Loading...'}
        </div>
        <div>
          {isAnnotationMode 
            ? 'Draw on the PDF with your selected tool. Switch to View Mode to scroll freely.' 
            : 'Click "VIEW MODE" button to switch to Annotation Mode for drawing.'
          }
        </div>
      </div>
    </div>
  );
}
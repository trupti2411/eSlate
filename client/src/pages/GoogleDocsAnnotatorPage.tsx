import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Pen, Highlighter, Eraser, Type, RotateCcw, Save, Send } from 'lucide-react';

type Tool = 'pen' | 'highlight' | 'eraser' | 'text';

interface Annotation {
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
}

export default function GoogleDocsAnnotatorPage() {
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [docLoaded, setDocLoaded] = useState(false);
  const [scale, setScale] = useState(1.0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Array<{x: number, y: number}>>([]);
  const [documentType, setDocumentType] = useState('Document');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const { toast } = useToast();

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const assignmentId = urlParams.get('assignmentId') || '';
  
  // Create Google Docs Viewer URL
  const documentUrl = assignmentId ? `/api/pdf-proxy/${assignmentId}` : '';
  const googleDocsViewerUrl = documentUrl ? 
    `https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + documentUrl)}&embedded=true` : '';

  // Load document with Google Docs Viewer
  const loadDocument = useCallback(async () => {
    if (!documentUrl) return;
    
    try {
      console.log('Loading document with Google Docs Viewer:', googleDocsViewerUrl);
      
      // Detect document type
      try {
        const response = await fetch(documentUrl, { method: 'HEAD' });
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/pdf')) {
          setDocumentType('PDF');
        } else if (contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
          setDocumentType('Word Document');
        } else if (contentType.includes('application/msword')) {
          setDocumentType('Word Document');
        } else if (contentType.includes('application/vnd.ms-excel') || 
                   contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
          setDocumentType('Excel Spreadsheet');
        } else if (contentType.includes('application/vnd.ms-powerpoint') ||
                   contentType.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation')) {
          setDocumentType('PowerPoint Presentation');
        }
      } catch (detectionError) {
        console.log('Document type detection failed, using default');
      }
      
      setDocLoaded(true);
      
      // Initialize canvas overlay after iframe loads
      setTimeout(() => {
        initializeCanvas();
      }, 2000);
      
      toast({
        title: `${documentType} Loaded`,
        description: `${documentType} loaded with Google Docs Viewer. Annotation tools are ready.`,
      });
      
    } catch (error) {
      console.error('Error loading document:', error);
      toast({
        title: "Loading Failed",
        description: "Could not load the document.",
        variant: "destructive",
      });
    }
  }, [documentUrl, googleDocsViewerUrl, documentType]);

  // Initialize canvas overlay
  const initializeCanvas = useCallback(() => {
    if (canvasRef.current && containerRef.current) {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      
      // Set canvas to match container size
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      console.log('Canvas overlay initialized for annotation');
    }
  }, []);

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    console.log('Google Docs Viewer iframe loaded');
    setTimeout(() => {
      initializeCanvas();
    }, 1000);
  }, [initializeCanvas]);

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'text') return;
    if (e.buttons !== 1) return;
    
    setIsDrawing(true);
    const coords = getCanvasCoordinates(e);
    setCurrentStroke([coords]);
    
    e.preventDefault();
    e.stopPropagation();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool === 'text') return;
    
    const coords = getCanvasCoordinates(e);
    setCurrentStroke(prev => [...prev, coords]);
    
    // Draw current stroke in real-time
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    // Clear canvas and redraw all annotations
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAnnotations(ctx);
    
    // Draw current stroke
    if (currentStroke.length > 0) {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
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
    
    e.preventDefault();
    e.stopPropagation();
  };

  const stopDrawing = () => {
    if (!isDrawing || currentStroke.length === 0) return;
    
    // Save the completed stroke
    const newAnnotation: Annotation = {
      type: 'stroke',
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

  // Add text annotation
  const addTextAnnotation = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'text') return;
    
    const text = prompt('Enter text:');
    if (!text) return;

    const coords = getCanvasCoordinates(e);
    
    const newAnnotation: Annotation = {
      type: 'text',
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

  // Get coordinates relative to canvas
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  // Draw all annotations on canvas
  const drawAnnotations = useCallback((ctx: CanvasRenderingContext2D) => {
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

  // Save work
  const saveWork = async () => {
    setIsSaving(true);
    try {
      // Save annotations to localStorage for now
      localStorage.setItem(`annotations_${assignmentId}`, JSON.stringify(annotations));
      
      toast({
        title: "Work Saved",
        description: "Your annotations have been saved locally.",
      });
    } catch (error) {
      console.error('Error saving work:', error);
      toast({
        title: "Save Failed",
        description: "Could not save your work. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Submit assignment
  const submitAssignment = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Implement actual submission logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Assignment Submitted",
        description: "Your annotated assignment has been submitted successfully.",
      });
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast({
        title: "Submission Failed",
        description: "Could not submit your assignment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear all annotations
  const clearAnnotations = () => {
    setAnnotations([]);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  // Load document on mount
  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  // Load saved annotations
  useEffect(() => {
    const savedAnnotations = localStorage.getItem(`annotations_${assignmentId}`);
    if (savedAnnotations) {
      try {
        setAnnotations(JSON.parse(savedAnnotations));
      } catch (error) {
        console.error('Error loading saved annotations:', error);
      }
    }
  }, [assignmentId]);

  // Redraw canvas when annotations change
  useEffect(() => {
    if (canvasRef.current && annotations.length > 0) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        drawAnnotations(ctx);
      }
    }
  }, [annotations, drawAnnotations]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        initializeCanvas();
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initializeCanvas]);

  if (!docLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Document...</h2>
          <p className="text-gray-500 mt-2">Setting up Google Docs Viewer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">
          Document Annotation - Assignment {assignmentId}
        </h1>
        <div className="flex gap-2">
          <Button 
            onClick={saveWork} 
            disabled={isSaving}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Work'}
          </Button>
          <Button 
            onClick={submitAssignment}
            disabled={isSubmitting || annotations.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
          </Button>
          <Button 
            onClick={() => window.close()}
            variant="outline"
          >
            Close
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 border-r p-4">
          <div className="space-y-6">
            {/* Drawing Tools */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Drawing Tools</h3>
              <div className="space-y-2">
                <Button
                  variant={activeTool === 'pen' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setActiveTool('pen')}
                >
                  <Pen className="h-4 w-4 mr-2" />
                  Pen
                </Button>
                <Button
                  variant={activeTool === 'highlight' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setActiveTool('highlight')}
                >
                  <Highlighter className="h-4 w-4 mr-2" />
                  Highlight
                </Button>
                <Button
                  variant={activeTool === 'eraser' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setActiveTool('eraser')}
                >
                  <Eraser className="h-4 w-4 mr-2" />
                  Eraser
                </Button>
                <Button
                  variant={activeTool === 'text' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setActiveTool('text')}
                >
                  <Type className="h-4 w-4 mr-2" />
                  Add Text
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={clearAnnotations}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>

            {/* Document Info */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Document Info</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Type:</strong> {documentType}</p>
                <p><strong>Annotations:</strong> {annotations.length}</p>
                <p><strong>Viewer:</strong> Google Docs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Document Viewer */}
        <div className="flex-1 relative" ref={containerRef}>
          {/* Google Docs Viewer iframe */}
          <iframe
            ref={iframeRef}
            src={googleDocsViewerUrl}
            className="w-full h-full border-0"
            title="Document Viewer"
            onLoad={handleIframeLoad}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
          />
          
          {/* Annotation canvas overlay */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 pointer-events-auto"
            style={{
              cursor: activeTool === 'text' ? 'text' : 'crosshair',
              zIndex: 10
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onClick={addTextAnnotation}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t p-2 text-sm text-gray-600 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span>Tool: {activeTool}</span>
          <span>Annotations: {annotations.length}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{documentType} loaded with Google Docs Viewer</span>
          <span>Status: Ready</span>
        </div>
      </div>
    </div>
  );
}
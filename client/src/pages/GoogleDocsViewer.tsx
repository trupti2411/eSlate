import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Pen, Highlighter, Eraser, Type, RotateCcw, Save, Send, Download, RefreshCw } from 'lucide-react';

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

export default function GoogleDocsViewer() {
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [docLoaded, setDocLoaded] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Array<{x: number, y: number}>>([]);
  const [documentType, setDocumentType] = useState('Document');
  const [viewerReady, setViewerReady] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [scrollOffset, setScrollOffset] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { toast } = useToast();

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const assignmentId = urlParams.get('assignmentId') || '';
  
  // Use public document URL for Google Docs Viewer
  const publicDocumentUrl = assignmentId ? `/api/public-doc/${assignmentId}` : '';
  const fallbackUrl = assignmentId ? `/api/pdf-proxy/${assignmentId}` : '';
  
  // Google Docs Viewer URL
  const googleDocsViewerUrl = publicDocumentUrl ? 
    `https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + publicDocumentUrl)}&embedded=true` : '';

  // Load document with Google Docs Viewer
  const loadDocument = useCallback(async () => {
    if (!publicDocumentUrl) return;
    
    try {
      console.log('Loading document with Google Docs Viewer');
      console.log('Public URL:', publicDocumentUrl);
      console.log('Google Docs URL:', googleDocsViewerUrl);
      
      // Check if public document is accessible
      try {
        const response = await fetch(publicDocumentUrl, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`Public document not accessible: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type') || '';
        console.log('Document content type:', contentType);
        
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
        } else {
          setDocumentType('Document');
        }
      } catch (checkError) {
        console.error('Error checking public document:', checkError);
        setDocumentType('Document');
      }
      
      setDocLoaded(true);
      
      // Set a timeout to detect if Google Docs Viewer is working
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      
      loadTimeoutRef.current = setTimeout(() => {
        if (!viewerReady) {
          console.log('Google Docs Viewer timeout - may not be loading properly');
          toast({
            title: "Viewer Timeout",
            description: "Google Docs Viewer is taking longer than expected. The document may still load.",
          });
        }
      }, 15000); // 15 second timeout
      
      toast({
        title: `${documentType} Loading`,
        description: "Loading document with Google Docs Viewer...",
      });
      
    } catch (error) {
      console.error('Error loading document:', error);
      toast({
        title: "Loading Failed",
        description: "Could not load the document.",
        variant: "destructive",
      });
    }
  }, [publicDocumentUrl, googleDocsViewerUrl, documentType, viewerReady, toast]);

  // Initialize canvas overlay
  const initializeCanvas = useCallback(() => {
    if (canvasRef.current && containerRef.current) {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      
      const rect = container.getBoundingClientRect();
      // Make canvas large enough to cover scrollable content
      canvas.width = rect.width;
      canvas.height = Math.max(rect.height, 2000); // Larger canvas for scrolling
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${Math.max(rect.height, 2000)}px`;
      
      console.log('Canvas overlay initialized for Google Docs Viewer:', rect.width, 'x', Math.max(rect.height, 2000));
    }
  }, []);

  // Handle container scroll
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop;
      const scrollLeft = containerRef.current.scrollLeft;
      setScrollOffset({ x: scrollLeft, y: scrollTop });
      
      // Update canvas position to follow scroll
      if (canvasRef.current) {
        canvasRef.current.style.transform = `translate(${-scrollLeft}px, ${-scrollTop}px)`;
      }
    }
  }, []);

  // Set up scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    console.log('Google Docs Viewer iframe loaded');
    setViewerReady(true);
    
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    
    setTimeout(() => {
      initializeCanvas();
    }, 2000); // Give Google Docs Viewer more time to fully render
    
    toast({
      title: `${documentType} Ready`,
      description: "Google Docs Viewer loaded successfully. Annotation tools are active.",
    });
  }, [initializeCanvas, documentType, toast]);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    console.error('Google Docs Viewer iframe failed to load');
    setViewerReady(false);
    
    toast({
      title: "Viewer Error",
      description: "Google Docs Viewer failed to load. Try refreshing or use download option.",
      variant: "destructive",
    });
  }, [toast]);

  // Retry loading
  const retryLoading = useCallback(() => {
    setLoadAttempts(prev => prev + 1);
    setViewerReady(false);
    setDocLoaded(false);
    
    // Force iframe reload
    if (iframeRef.current) {
      iframeRef.current.src = googleDocsViewerUrl + `&t=${Date.now()}`;
    }
    
    loadDocument();
  }, [googleDocsViewerUrl, loadDocument]);

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement | HTMLDivElement>) => {
    if (activeTool === 'text' || !viewerReady) return;
    if (e.buttons !== 1) return;
    
    setIsDrawing(true);
    const coords = getCanvasCoordinates(e);
    setCurrentStroke([coords]);
    
    // Enable canvas pointer events while drawing
    if (canvasRef.current) {
      canvasRef.current.style.pointerEvents = 'auto';
    }
    
    e.preventDefault();
    e.stopPropagation();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement | HTMLDivElement>) => {
    if (!isDrawing || activeTool === 'text' || !viewerReady) return;
    
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
    if (!isDrawing || currentStroke.length === 0) {
      setIsDrawing(false);
      return;
    }
    
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
    
    // Disable canvas pointer events after drawing
    if (canvasRef.current) {
      canvasRef.current.style.pointerEvents = 'none';
    }
  };

  // Add text annotation
  const addTextAnnotation = (e: React.MouseEvent<HTMLCanvasElement | HTMLDivElement>) => {
    if (activeTool !== 'text' || !viewerReady) return;
    
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

  // Get coordinates relative to canvas, accounting for scroll
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement | HTMLDivElement>) => {
    if (!canvasRef.current || !containerRef.current) return { x: 0, y: 0 };
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    return {
      x: e.clientX - containerRect.left + container.scrollLeft,
      y: e.clientY - containerRect.top + container.scrollTop
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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

  // Download original document
  const downloadDocument = () => {
    window.open(fallbackUrl, '_blank');
  };

  // Load document on mount
  useEffect(() => {
    loadDocument();
    
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
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
          <h2 className="text-xl font-semibold text-gray-700">Loading with Google Docs Viewer...</h2>
          <p className="text-gray-500 mt-2">Preparing document for viewing and annotation...</p>
          <p className="text-sm text-gray-400 mt-1">Attempt #{loadAttempts + 1}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">
          Google Docs Document Viewer - Assignment {assignmentId}
        </h1>
        <div className="flex gap-2">
          <Button 
            onClick={retryLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
          <Button 
            onClick={downloadDocument}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Original
          </Button>
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
            disabled={isSubmitting}
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
                  disabled={!viewerReady}
                >
                  <Pen className="h-4 w-4 mr-2" />
                  Pen
                </Button>
                <Button
                  variant={activeTool === 'highlight' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setActiveTool('highlight')}
                  disabled={!viewerReady}
                >
                  <Highlighter className="h-4 w-4 mr-2" />
                  Highlight
                </Button>
                <Button
                  variant={activeTool === 'eraser' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setActiveTool('eraser')}
                  disabled={!viewerReady}
                >
                  <Eraser className="h-4 w-4 mr-2" />
                  Eraser
                </Button>
                <Button
                  variant={activeTool === 'text' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setActiveTool('text')}
                  disabled={!viewerReady}
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
                  disabled={!viewerReady}
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
                <p><strong>Status:</strong> {viewerReady ? 'Ready' : 'Loading...'}</p>
                <p><strong>Scroll:</strong> {scrollOffset.x}, {scrollOffset.y}</p>
                <p><strong>Attempts:</strong> {loadAttempts + 1}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Document Viewer */}
        <div className="flex-1 relative overflow-auto" ref={containerRef}>
          {/* Google Docs Viewer iframe */}
          <iframe
            ref={iframeRef}
            src={googleDocsViewerUrl}
            className="w-full h-full border-0"
            title="Google Docs Viewer"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              minHeight: '200vh' // Make iframe taller to enable scrolling
            }}
          />
          
          {/* Loading overlay */}
          {!viewerReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-5">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading Google Docs Viewer...</p>
                <p className="text-sm text-gray-500 mt-1">This may take a moment</p>
              </div>
            </div>
          )}
          
          {/* Annotation canvas overlay */}
          <canvas
            ref={canvasRef}
            className="absolute"
            style={{
              cursor: isDrawing || activeTool !== 'text' ? (activeTool === 'text' ? 'text' : 'crosshair') : 'default',
              zIndex: 20,
              backgroundColor: 'transparent',
              pointerEvents: isDrawing ? 'auto' : 'none', // Only capture events when drawing
              top: 0,
              left: 0,
              transform: `translate(${-scrollOffset.x}px, ${-scrollOffset.y}px)`,
              transformOrigin: 'top left'
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onClick={addTextAnnotation}
          />
          
          {/* Annotation activation overlay - captures initial click to start drawing */}
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              zIndex: 15,
              backgroundColor: 'transparent',
              pointerEvents: viewerReady && !isDrawing ? 'auto' : 'none'
            }}
            onMouseDown={(e) => {
              // Pass the event to canvas for drawing
              if (canvasRef.current) {
                const canvas = canvasRef.current;
                const rect = canvas.getBoundingClientRect();
                const syntheticEvent = {
                  ...e,
                  currentTarget: canvas,
                  target: canvas,
                  clientX: e.clientX,
                  clientY: e.clientY,
                  preventDefault: () => e.preventDefault(),
                  stopPropagation: () => e.stopPropagation(),
                  buttons: e.buttons
                } as any;
                
                startDrawing(syntheticEvent);
              }
            }}
            onMouseMove={(e) => {
              if (isDrawing && canvasRef.current) {
                const canvas = canvasRef.current;
                const syntheticEvent = {
                  ...e,
                  currentTarget: canvas,
                  target: canvas,
                  clientX: e.clientX,
                  clientY: e.clientY,
                  preventDefault: () => e.preventDefault(),
                  stopPropagation: () => e.stopPropagation(),
                  buttons: e.buttons
                } as any;
                
                draw(syntheticEvent);
              }
            }}
            onMouseUp={() => {
              if (isDrawing) {
                stopDrawing();
              }
            }}
            onClick={(e) => {
              if (activeTool === 'text' && canvasRef.current) {
                const canvas = canvasRef.current;
                const syntheticEvent = {
                  ...e,
                  currentTarget: canvas,
                  target: canvas,
                  clientX: e.clientX,
                  clientY: e.clientY,
                  preventDefault: () => e.preventDefault(),
                  stopPropagation: () => e.stopPropagation()
                } as any;
                
                addTextAnnotation(syntheticEvent);
              }
            }}
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
          <span>Status: {viewerReady ? 'Ready for annotation' : 'Loading viewer...'}</span>
        </div>
      </div>
    </div>
  );
}
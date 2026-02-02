import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Save, Send, X, Pen, Highlighter, Eraser, Type, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

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
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [scale, setScale] = useState(1.0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Array<{x: number, y: number}>>([]);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const assignmentId = urlParams.get('assignmentId') || '';
  
  // Use server proxy endpoint to serve authenticated documents
  const pdfUrl = assignmentId ? `/api/pdf-proxy/${assignmentId}` : '';

  // Load any document type with annotation support
  const loadPDF = useCallback(async () => {
    if (!pdfUrl) return;
    
    try {
      console.log('Loading document:', pdfUrl);
      
      // First, check if this is actually a PDF by trying to fetch headers
      const response = await fetch(pdfUrl, { method: 'HEAD' });
      const contentType = response.headers.get('content-type') || '';
      
      console.log('Content type:', contentType);
      
      // Check if it's a PDF file
      if (contentType.includes('application/pdf')) {
        // Try PDF.js for actual PDF files
        try {
          const pdfjsLib = await import('pdfjs-dist');
          
          // Try different worker setup approaches
          try {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          } catch {
            try {
              pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
            } catch {
              pdfjsLib.GlobalWorkerOptions.workerSrc = '';
            }
          }
          
          const loadingTask = pdfjsLib.getDocument(pdfUrl);
          const pdf = await loadingTask.promise;
          
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          setPdfLoaded(true);
          
          console.log(`PDF loaded successfully with PDF.js. Pages: ${pdf.numPages}`);
          await renderPage(pdf, 1);
          
          toast({
            title: "PDF Loaded",
            description: "PDF loaded with high-quality rendering. Full annotation support available.",
          });
          return;
        } catch (pdfError) {
          console.error('PDF.js failed:', pdfError);
        }
      }
      
      // Determine document type for user feedback
      let documentType = 'Document';
      if (contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        documentType = 'Word Document';
      } else if (contentType.includes('application/msword')) {
        documentType = 'Word Document';
      } else if (contentType.includes('application/vnd.ms-excel') || 
                 contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
        documentType = 'Excel Spreadsheet';
      } else if (contentType.includes('application/vnd.ms-powerpoint') ||
                 contentType.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation')) {
        documentType = 'PowerPoint Presentation';
      }
      
      // Universal fallback - use iframe for all document types
      console.log(`Loading ${documentType} with iframe method...`);
      setPdfLoaded(true);
      setTotalPages(1);
      
      // Initialize canvas overlay for iframe
      setTimeout(() => {
        if (canvasRef.current && containerRef.current) {
          const canvas = canvasRef.current;
          const container = containerRef.current;
          const rect = container.getBoundingClientRect();
          canvas.width = rect.width;
          canvas.height = rect.height;
          canvas.style.width = `${rect.width}px`;
          canvas.style.height = `${rect.height}px`;
          console.log('Canvas overlay initialized for document annotation');
        }
      }, 500);
      
      toast({
        title: `${documentType} Loaded`,
        description: `${documentType} loaded successfully. Annotation tools are available for marking up the document.`,
      });
      
    } catch (error) {
      console.error('Error loading document:', error);
      
      // Even if detection fails, try to load the document
      console.log('Detection failed, attempting to load document anyway...');
      setPdfLoaded(true);
      setTotalPages(1);
      
      toast({
        title: "Document Loaded",
        description: "Document loaded. Annotation tools are available.",
      });
    }
  }, [pdfUrl]);

  // Render PDF page
  const renderPage = useCallback(async (pdf: any, pageNum: number) => {
    if (!pdf || !canvasRef.current) return;
    
    try {
      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      const overlayCanvas = overlayCanvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;
      
      // Calculate viewport
      const viewport = page.getViewport({ scale });
      
      // Set canvas dimensions
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      
      // Set overlay canvas dimensions to match
      if (overlayCanvas) {
        overlayCanvas.width = viewport.width;
        overlayCanvas.height = viewport.height;
        overlayCanvas.style.width = `${viewport.width}px`;
        overlayCanvas.style.height = `${viewport.height}px`;
      }
      
      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Render PDF page
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      
      await page.render(renderContext).promise;
      
      // Draw saved annotations on overlay
      if (overlayCanvas) {
        const overlayCtx = overlayCanvas.getContext('2d');
        if (overlayCtx) {
          overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
          drawAnnotations(overlayCtx);
        }
      }
      
      console.log(`Page ${pageNum} rendered at scale ${scale}`);
      
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  }, [scale, annotations]);

  // Draw all annotations on canvas
  const drawAnnotations = useCallback((ctx: CanvasRenderingContext2D) => {
    // Draw each annotation
    annotations.filter(annotation => annotation.page === currentPage).forEach(annotation => {
      ctx.save();
      ctx.globalCompositeOperation = annotation.style.globalCompositeOperation as GlobalCompositeOperation;
      ctx.strokeStyle = annotation.style.color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (annotation.type === 'stroke' && annotation.points) {
        ctx.beginPath();
        
        if (pdfDoc) {
          // For PDF.js rendering, apply scale
          ctx.lineWidth = annotation.style.lineWidth * scale;
          annotation.points.forEach((point, index) => {
            const scaledX = point.x * scale;
            const scaledY = point.y * scale;
            if (index === 0) {
              ctx.moveTo(scaledX, scaledY);
            } else {
              ctx.lineTo(scaledX, scaledY);
            }
          });
        } else {
          // For iframe fallback, use direct coordinates
          ctx.lineWidth = annotation.style.lineWidth;
          annotation.points.forEach((point, index) => {
            if (index === 0) {
              ctx.moveTo(point.x, point.y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          });
        }
        ctx.stroke();
      } else if (annotation.type === 'text' && annotation.text && annotation.x !== undefined && annotation.y !== undefined) {
        ctx.fillStyle = annotation.style.color;
        
        if (pdfDoc) {
          ctx.font = `${18 * scale}px Arial`;
          ctx.fillText(annotation.text, annotation.x * scale, annotation.y * scale);
        } else {
          ctx.font = '18px Arial';
          ctx.fillText(annotation.text, annotation.x, annotation.y);
        }
      }
      
      ctx.restore();
    });
  }, [annotations, currentPage, scale, pdfDoc]);

  // Get coordinates relative to canvas
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = overlayCanvasRef.current || canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    
    // For PDF.js rendering, convert to PDF coordinate space
    if (pdfDoc) {
      return {
        x: (e.clientX - rect.left) / scale,
        y: (e.clientY - rect.top) / scale
      };
    } else {
      // For iframe fallback, use direct canvas coordinates
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Only handle drawing tools, allow scroll otherwise
    if (activeTool !== 'pen' && activeTool !== 'highlight' && activeTool !== 'eraser' && activeTool !== 'text') {
      return; // Allow default behavior (scrolling)
    }
    
    console.log('startDrawing called, buttons:', e.buttons, 'activeTool:', activeTool);
    
    if (activeTool === 'text') {
      addTextAtPosition(e);
      e.preventDefault();
      return;
    }
    
    setIsDrawing(true);
    const coords = getCanvasCoordinates(e);
    console.log('Starting stroke at:', coords);
    setCurrentStroke([coords]);
    
    e.preventDefault();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || e.buttons !== 1) return;
    
    const coords = getCanvasCoordinates(e);
    const prevCoords = currentStroke.length > 0 ? currentStroke[currentStroke.length - 1] : coords;
    setCurrentStroke(prev => [...prev, coords]);
    
    // Draw directly on the PDF canvas (incremental drawing - no re-render)
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    console.log('draw called, canvas:', canvas?.width, 'x', canvas?.height, 'ctx:', !!ctx);
    if (!canvas || !ctx) return;
    
    // Draw current stroke
    // Draw incrementally - just draw a line from previous point to current point
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    switch (activeTool) {
      case 'pen':
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = pdfDoc ? 3 * scale : 3;
        break;
      case 'highlight':
        ctx.globalCompositeOperation = 'multiply';
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.lineWidth = pdfDoc ? 20 * scale : 20;
        break;
      case 'eraser':
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = pdfDoc ? 20 * scale : 20;
        break;
    }
    
    ctx.beginPath();
    if (pdfDoc) {
      ctx.moveTo(prevCoords.x * scale, prevCoords.y * scale);
      ctx.lineTo(coords.x * scale, coords.y * scale);
    } else {
      ctx.moveTo(prevCoords.x, prevCoords.y);
      ctx.lineTo(coords.x, coords.y);
    }
    ctx.stroke();
    ctx.restore();
    
    e.preventDefault();
  };

  const stopDrawing = () => {
    if (!isDrawing || currentStroke.length === 0) return;
    
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

  // Clear all annotations
  const clearCanvas = () => {
    setAnnotations([]);
    if (pdfDoc) {
      renderPage(pdfDoc, currentPage);
    }
  };

  // Change scale and re-render
  const changeScale = (newScale: number) => {
    setScale(newScale);
    if (pdfDoc) {
      renderPage(pdfDoc, currentPage);
    }
  };

  // Save work to localStorage
  const saveWork = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const saveKey = `pdf-annotation-data-${assignmentId}`;
      const saveData = {
        annotations,
        scale,
        currentPage
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
        const { annotations: savedAnnotations, scale: savedScale, currentPage: savedPage } = JSON.parse(savedData);
        setAnnotations(savedAnnotations || []);
        if (savedScale) setScale(savedScale);
        if (savedPage) setCurrentPage(savedPage);
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
      const pdfCanvas = canvasRef.current;
      const overlayCanvas = overlayCanvasRef.current;
      if (!pdfCanvas) throw new Error('No canvas available');
      
      // Create a combined canvas with PDF + annotations
      const combinedCanvas = document.createElement('canvas');
      combinedCanvas.width = pdfCanvas.width;
      combinedCanvas.height = pdfCanvas.height;
      const ctx = combinedCanvas.getContext('2d');
      
      if (!ctx) throw new Error('Failed to create context');
      
      // Draw PDF first
      ctx.drawImage(pdfCanvas, 0, 0);
      
      // Draw annotations on top
      if (overlayCanvas) {
        ctx.drawImage(overlayCanvas, 0, 0);
      }
      
      combinedCanvas.toBlob(async (blob) => {
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

  // Re-render when scale changes
  useEffect(() => {
    if (pdfDoc && pdfLoaded) {
      renderPage(pdfDoc, currentPage);
    }
  }, [scale, currentPage, pdfDoc, pdfLoaded, renderPage]);

  // Re-render when annotations change
  useEffect(() => {
    if (pdfDoc && pdfLoaded) {
      renderPage(pdfDoc, currentPage);
    }
  }, [annotations, pdfDoc, pdfLoaded, currentPage, renderPage]);

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
            {/* Drawing Tools */}
            <div>
              <h3 className="font-medium mb-3">Drawing Tools</h3>
              <div className="space-y-2">
                <Button
                  onClick={() => setActiveTool('pen')}
                  variant={activeTool === 'pen' ? 'default' : 'outline'}
                  className={`w-full justify-start ${activeTool === 'pen' ? 'bg-blue-600 text-white' : ''}`}
                >
                  <Pen className="h-4 w-4 mr-2" />
                  Pen
                </Button>
                <Button
                  onClick={() => setActiveTool('highlight')}
                  variant={activeTool === 'highlight' ? 'default' : 'outline'}
                  className={`w-full justify-start ${activeTool === 'highlight' ? 'bg-yellow-400 text-black' : ''}`}
                >
                  <Highlighter className="h-4 w-4 mr-2" />
                  Highlight
                </Button>
                <Button
                  onClick={() => setActiveTool('eraser')}
                  variant={activeTool === 'eraser' ? 'default' : 'outline'}
                  className={`w-full justify-start ${activeTool === 'eraser' ? 'bg-red-600 text-white' : ''}`}
                >
                  <Eraser className="h-4 w-4 mr-2" />
                  Eraser
                </Button>
                <Button
                  onClick={() => setActiveTool('text')}
                  variant={activeTool === 'text' ? 'default' : 'outline'}
                  className={`w-full justify-start ${activeTool === 'text' ? 'bg-green-600 text-white' : ''}`}
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
                <Button onClick={() => changeScale(Math.max(0.5, scale - 0.2))} size="sm" variant="outline">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="flex-1 text-center text-sm">{Math.round(scale * 100)}%</span>
                <Button onClick={() => changeScale(Math.min(3, scale + 0.2))} size="sm" variant="outline">
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
          {pdfDoc ? (
            // PDF.js direct rendering with overlay canvas
            <div className="flex justify-center items-start p-4">
              {/* PDF Canvas with direct drawing */}
              <canvas
                ref={canvasRef}
                className="border border-gray-300 bg-white shadow-lg"
                style={{
                  cursor: activeTool === 'text' ? 'text' : 'crosshair',
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
          ) : (
            // Fallback iframe with simple annotation overlay
            <>
              <iframe
                src={pdfUrl}
                className="w-full h-full bg-white"
                title="PDF Document"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left'
                }}
                onLoad={() => {
                  if (!pdfDoc) {
                    setTimeout(() => {
                      // Initialize simple canvas overlay for iframe fallback
                      if (canvasRef.current && containerRef.current) {
                        const canvas = canvasRef.current;
                        const container = containerRef.current;
                        const rect = container.getBoundingClientRect();
                        canvas.width = rect.width;
                        canvas.height = rect.height;
                        canvas.style.width = `${rect.width}px`;
                        canvas.style.height = `${rect.height}px`;
                      }
                    }, 200);
                  }
                }}
              />
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
              />
            </>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t p-2 text-sm text-gray-600 flex justify-between items-center">
        <div>
          Tool: {activeTool?.toUpperCase()} | Page: {currentPage}/{totalPages} | PDF Status: {pdfLoaded ? 'Loaded' : 'Loading...'}
        </div>
        <div className="text-green-600 font-medium">
          ✓ PDF.js direct rendering - annotations locked to content
        </div>
      </div>
    </div>
  );
}
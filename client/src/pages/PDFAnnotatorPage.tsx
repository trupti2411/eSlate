import { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Save, Send, X, Pen, Highlighter, Eraser, Type, RotateCcw, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { Canvas as FabricCanvas, Path, Text as FabricText, PencilBrush } from 'fabric';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

type Tool = 'pen' | 'eraser' | 'text' | 'highlight' | null;

interface StudentAnnotation {
  id: string;
  type: 'stroke' | 'text';
  pageNum: number;
  fabricJSON?: any;
  text?: string;
  x?: number;
  y?: number;
  toolType: 'pen' | 'highlight' | 'eraser' | 'text';
}

export function PDFAnnotatorPage() {
  const [activeTool, setActiveTool] = useState<Tool>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.2);
  const [annotations, setAnnotations] = useState<StudentAnnotation[]>([]);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  const urlParams = new URLSearchParams(window.location.search);
  const assignmentId = urlParams.get('assignmentId') || '';
  const pdfUrl = assignmentId ? `/api/pdf-proxy/${assignmentId}` : '';

  // Load existing submission/annotations for this assignment
  const { data: existingSubmission } = useQuery({
    queryKey: ['/api/assignments', assignmentId, 'my-submission'],
    queryFn: async () => {
      const response = await fetch(`/api/assignments/${assignmentId}/my-submission`, {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch submission');
      }
      return response.json();
    },
    enabled: !!assignmentId
  });

  // Load saved annotations when submission data is available
  useEffect(() => {
    if (existingSubmission?.annotations && Array.isArray(existingSubmission.annotations)) {
      setAnnotations(existingSubmission.annotations);
    }
  }, [existingSubmission]);

  useEffect(() => {
    if (!pdfUrl) return;
    
    const loadPDF = async () => {
      try {
        setPdfError(null);
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        setPdfLoaded(true);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setPdfError('Failed to load PDF.');
      }
    };
    loadPDF();
    
    return () => {
      if (pdfDocRef.current) pdfDocRef.current.destroy();
    };
  }, [pdfUrl]);

  const renderPDFPage = useCallback(async (pageNum: number) => {
    if (!pdfDocRef.current) return;
    
    try {
      const page = await pdfDocRef.current.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const pdfCanvas = pdfCanvasRef.current;
      const overlayCanvas = overlayCanvasRef.current;

      if (pdfCanvas) {
        pdfCanvas.width = viewport.width;
        pdfCanvas.height = viewport.height;
        const ctx = pdfCanvas.getContext('2d');
        if (ctx) {
          await page.render({
            canvasContext: ctx,
            viewport: viewport,
            canvas: pdfCanvas
          } as any).promise;
        }
      }

      if (overlayCanvas) {
        overlayCanvas.width = viewport.width;
        overlayCanvas.height = viewport.height;
        
        if (!fabricCanvasRef.current) {
          console.log('Creating new Fabric canvas with dimensions:', viewport.width, 'x', viewport.height);
          const newCanvas = new FabricCanvas(overlayCanvas, {
            width: viewport.width,
            height: viewport.height,
            isDrawingMode: false,
            preserveObjectStacking: true,
            selection: true,
          });
          newCanvas.freeDrawingBrush = new PencilBrush(newCanvas);
          fabricCanvasRef.current = newCanvas;
          console.log('Fabric canvas created:', !!newCanvas, 'brush:', !!newCanvas.freeDrawingBrush);
          
          const wrapper = newCanvas.wrapperEl;
          console.log('Fabric wrapper:', !!wrapper);
          if (wrapper) {
            wrapper.style.position = 'absolute';
            wrapper.style.top = '0';
            wrapper.style.left = '0';
            wrapper.style.zIndex = '10';
            wrapper.style.pointerEvents = 'none';
          }
          
          newCanvas.on('path:created', (e: any) => {
            console.log('Path created event fired');
            const path = e.path;
            if (!path) return;
            
            const newAnnotation: StudentAnnotation = {
              id: `stroke-${Date.now()}`,
              type: 'stroke',
              pageNum: currentPage,
              toolType: 'pen',
              fabricJSON: path.toJSON()
            };
            
            setAnnotations(prev => [...prev, newAnnotation]);
          });
        } else {
          fabricCanvasRef.current.setWidth(viewport.width);
          fabricCanvasRef.current.setHeight(viewport.height);
          fabricCanvasRef.current.renderAll();
        }
      }
    } catch (error) {
      console.error(`Error rendering page ${pageNum}:`, error);
    }
  }, [scale]);

  useEffect(() => {
    if (!pdfLoaded || !pdfDocRef.current || numPages === 0) return;
    
    const timer = setTimeout(async () => {
      await renderPDFPage(currentPage);
      renderAnnotationsOnCanvas();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [pdfLoaded, numPages, currentPage, scale, renderPDFPage]);

  useEffect(() => {
    const fabricCanvas = fabricCanvasRef.current;
    console.log('Tool effect - activeTool:', activeTool, 'fabricCanvas exists:', !!fabricCanvas);
    if (!fabricCanvas) return;

    if (activeTool === 'pen') {
      fabricCanvas.isDrawingMode = true;
      console.log('Pen mode - isDrawingMode:', fabricCanvas.isDrawingMode, 'brush:', !!fabricCanvas.freeDrawingBrush);
      if (fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush.color = '#000000';
        fabricCanvas.freeDrawingBrush.width = 3;
      }
    } else if (activeTool === 'highlight') {
      fabricCanvas.isDrawingMode = true;
      if (fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush.color = 'rgba(255, 255, 0, 0.5)';
        fabricCanvas.freeDrawingBrush.width = 20;
      }
    } else if (activeTool === 'eraser') {
      fabricCanvas.isDrawingMode = true;
      if (fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush.color = '#FFFFFF';
        fabricCanvas.freeDrawingBrush.width = 20;
      }
    } else {
      fabricCanvas.isDrawingMode = false;
    }
    
    const wrapper = fabricCanvas.wrapperEl;
    console.log('Wrapper element:', !!wrapper, 'setting pointerEvents:', activeTool ? 'auto' : 'none');
    if (wrapper) {
      wrapper.style.position = 'absolute';
      wrapper.style.top = '0';
      wrapper.style.left = '0';
      wrapper.style.zIndex = '10';
      wrapper.style.pointerEvents = activeTool ? 'auto' : 'none';
    }
    
    fabricCanvas.renderAll();
  }, [activeTool]);

  useEffect(() => {
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas) return;

    const handlePathCreated = (e: any) => {
      const path = e.path;
      if (!path) return;
      
      const newAnnotation: StudentAnnotation = {
        id: `stroke-${Date.now()}`,
        type: 'stroke',
        pageNum: currentPage,
        toolType: activeTool as 'pen' | 'highlight' | 'eraser',
        fabricJSON: path.toJSON()
      };
      
      setAnnotations(prev => [...prev, newAnnotation]);
    };

    fabricCanvas.on('path:created', handlePathCreated);
    
    return () => {
      fabricCanvas.off('path:created', handlePathCreated);
    };
  }, [currentPage, activeTool]);

  const renderAnnotationsOnCanvas = useCallback(() => {
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas) return;

    fabricCanvas.clear();
    
    const pageAnnotations = annotations.filter(a => a.pageNum === currentPage);
    for (const annotation of pageAnnotations) {
      if (annotation.type === 'stroke' && annotation.fabricJSON) {
        Path.fromObject(annotation.fabricJSON).then((path: any) => {
          fabricCanvas.add(path);
          fabricCanvas.renderAll();
        });
      } else if (annotation.type === 'text' && annotation.text) {
        const text = new FabricText(annotation.text, {
          left: annotation.x || 0,
          top: annotation.y || 0,
          fontSize: 16,
          fill: '#000000',
          fontFamily: 'Arial',
          selectable: true,
          evented: true
        });
        fabricCanvas.add(text);
      }
    }
    fabricCanvas.renderAll();
  }, [annotations, currentPage]);

  useEffect(() => {
    renderAnnotationsOnCanvas();
  }, [renderAnnotationsOnCanvas]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== 'text') return;
    
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const text = prompt('Enter text:');
    if (text) {
      const textObj = new FabricText(text, {
        left: x,
        top: y,
        fontSize: 16,
        fill: '#000000',
        fontFamily: 'Arial',
        selectable: true,
        evented: true
      });
      fabricCanvas.add(textObj);
      fabricCanvas.renderAll();
      
      const newAnnotation: StudentAnnotation = {
        id: `text-${Date.now()}`,
        type: 'text',
        pageNum: currentPage,
        text,
        x,
        y,
        toolType: 'text'
      };
      setAnnotations(prev => [...prev, newAnnotation]);
    }
  };

  const clearAnnotations = () => {
    setAnnotations(prev => prev.filter(a => a.pageNum !== currentPage));
    const fabricCanvas = fabricCanvasRef.current;
    if (fabricCanvas) {
      fabricCanvas.clear();
    }
  };

  const handleZoomIn = () => setScale(s => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.25, 0.5));
  const goToPrevPage = () => setCurrentPage(p => Math.max(p - 1, 1));
  const goToNextPage = () => setCurrentPage(p => Math.min(p + 1, numPages));

  const saveSubmission = useMutation({
    mutationFn: async (status: 'draft' | 'submitted') => {
      setIsSaving(status === 'draft');
      setIsSubmitting(status === 'submitted');
      
      const fabricCanvas = fabricCanvasRef.current;
      const pdfCanvas = pdfCanvasRef.current;
      
      if (!fabricCanvas || !pdfCanvas) {
        throw new Error('Canvas not available');
      }

      const mergedCanvas = document.createElement('canvas');
      mergedCanvas.width = pdfCanvas.width;
      mergedCanvas.height = pdfCanvas.height;
      const mergedCtx = mergedCanvas.getContext('2d');
      
      if (mergedCtx) {
        mergedCtx.drawImage(pdfCanvas, 0, 0);
        const fabricEl = fabricCanvas.getElement();
        mergedCtx.drawImage(fabricEl, 0, 0);
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        mergedCanvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to create blob'));
        }, 'image/png');
      });

      const formData = new FormData();
      formData.append('file', blob, `submission-${assignmentId}.png`);
      formData.append('assignmentId', assignmentId);
      formData.append('status', status);
      formData.append('annotations', JSON.stringify(annotations));

      const response = await fetch('/api/submissions/annotated', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to save submission');
      }

      return response.json();
    },
    onSuccess: (_, status) => {
      toast({
        title: status === 'submitted' ? 'Assignment Submitted' : 'Draft Saved',
        description: status === 'submitted' 
          ? 'Your assignment has been submitted successfully.' 
          : 'Your work has been saved as a draft.',
      });
      if (status === 'submitted') {
        window.close();
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSaving(false);
      setIsSubmitting(false);
    }
  });

  const handleClose = () => {
    if (annotations.length > 0) {
      if (confirm('You have unsaved work. Are you sure you want to close?')) {
        window.close();
      }
    } else {
      window.close();
    }
  };

  if (pdfError) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">{pdfError}</p>
          <Button onClick={handleClose}>Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Button
            variant={activeTool === 'pen' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool(activeTool === 'pen' ? null : 'pen')}
            title="Pen"
          >
            <Pen className="h-4 w-4" />
          </Button>
          <Button
            variant={activeTool === 'highlight' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool(activeTool === 'highlight' ? null : 'highlight')}
            title="Highlighter"
          >
            <Highlighter className="h-4 w-4" />
          </Button>
          <Button
            variant={activeTool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool(activeTool === 'eraser' ? null : 'eraser')}
            title="Eraser"
          >
            <Eraser className="h-4 w-4" />
          </Button>
          <Button
            variant={activeTool === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool(activeTool === 'text' ? null : 'text')}
            title="Text"
          >
            <Type className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <Button variant="outline" size="sm" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600 min-w-[50px] text-center">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="sm" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <Button variant="outline" size="sm" onClick={clearAnnotations} title="Clear Page">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Page Navigation */}
        {numPages > 1 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPrevPage} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">Page {currentPage} of {numPages}</span>
            <Button variant="outline" size="sm" onClick={goToNextPage} disabled={currentPage === numPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveSubmission.mutate('draft')}
            disabled={isSaving || isSubmitting}
          >
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            size="sm"
            onClick={() => saveSubmission.mutate('submitted')}
            disabled={isSaving || isSubmitting}
          >
            <Send className="h-4 w-4 mr-1" />
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Viewer with Fabric.js Overlay */}
      <div className="flex-1 overflow-auto bg-gray-200" ref={containerRef}>
        {!pdfLoaded ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600">Loading PDF...</p>
          </div>
        ) : (
          <div className="flex justify-center p-4">
            <div 
              className="relative inline-block"
              onClick={handleCanvasClick}
              style={{ cursor: activeTool === 'text' ? 'text' : activeTool ? 'crosshair' : 'default' }}
            >
              {/* PDF Canvas (background) */}
              <canvas
                ref={pdfCanvasRef}
                className="border border-gray-300 bg-white shadow-lg block"
              />
              {/* Fabric.js Overlay Canvas */}
              <canvas
                ref={overlayCanvasRef}
                className="absolute top-0 left-0"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PDFAnnotatorPage;

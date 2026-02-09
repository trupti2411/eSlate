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
  scale?: number;
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
  const annotationsRef = useRef<StudentAnnotation[]>([]);
  const scaleRef = useRef(scale);
  const currentPageRef = useRef(currentPage);
  const activeToolRef = useRef<Tool>(null);
  
  const { toast } = useToast();

  useEffect(() => { annotationsRef.current = annotations; }, [annotations]);
  useEffect(() => { scaleRef.current = scale; }, [scale]);
  useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);
  useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);

  const urlParams = new URLSearchParams(window.location.search);
  const assignmentId = urlParams.get('assignmentId') || '';
  const pdfUrl = assignmentId ? `/api/pdf-proxy/${assignmentId}` : '';

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
          const newCanvas = new FabricCanvas(overlayCanvas, {
            width: viewport.width,
            height: viewport.height,
            isDrawingMode: false,
            preserveObjectStacking: true,
            selection: false,
            renderOnAddRemove: false,
            enableRetinaScaling: false,
          });

          const brush = new PencilBrush(newCanvas);
          brush.decimate = 4;
          brush.strokeLineCap = 'round';
          brush.strokeLineJoin = 'round';
          newCanvas.freeDrawingBrush = brush;
          
          fabricCanvasRef.current = newCanvas;
          
          const wrapper = newCanvas.wrapperEl;
          if (wrapper) {
            wrapper.style.position = 'absolute';
            wrapper.style.top = '0';
            wrapper.style.left = '0';
            wrapper.style.zIndex = '10';
            wrapper.style.pointerEvents = 'none';
            wrapper.style.touchAction = 'none';
          }

          const upperCanvas = newCanvas.upperCanvasEl;
          if (upperCanvas) {
            upperCanvas.style.touchAction = 'none';
            upperCanvas.style.willChange = 'transform';
          }
          
          newCanvas.on('path:created', (e: any) => {
            const path = e.path;
            if (!path) return;
            
            path.objectCaching = false;

            const newAnnotation: StudentAnnotation = {
              id: `stroke-${Date.now()}`,
              type: 'stroke',
              pageNum: currentPageRef.current,
              toolType: activeToolRef.current as 'pen' | 'highlight' | 'eraser' || 'pen',
              fabricJSON: path.toJSON(),
              scale: scaleRef.current
            };
            
            setAnnotations(prev => [...prev, newAnnotation]);
          });
        } else {
          fabricCanvasRef.current.setWidth(viewport.width);
          fabricCanvasRef.current.setHeight(viewport.height);
          fabricCanvasRef.current.requestRenderAll();
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
      setTimeout(() => {
        renderAnnotationsOnCanvas();
      }, 50);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [pdfLoaded, numPages, currentPage, scale, renderPDFPage, annotations]);

  useEffect(() => {
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas) return;

    if (activeTool === 'pen') {
      fabricCanvas.isDrawingMode = true;
      fabricCanvas.selection = false;
      if (fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush.color = '#000000';
        fabricCanvas.freeDrawingBrush.width = 2;
        fabricCanvas.freeDrawingBrush.decimate = 4;
      }
    } else if (activeTool === 'highlight') {
      fabricCanvas.isDrawingMode = true;
      fabricCanvas.selection = false;
      if (fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush.color = 'rgba(255, 255, 0, 0.5)';
        fabricCanvas.freeDrawingBrush.width = 16;
        fabricCanvas.freeDrawingBrush.decimate = 6;
      }
    } else if (activeTool === 'eraser') {
      fabricCanvas.isDrawingMode = true;
      fabricCanvas.selection = false;
      if (fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush.color = '#FFFFFF';
        fabricCanvas.freeDrawingBrush.width = 16;
        fabricCanvas.freeDrawingBrush.decimate = 6;
      }
    } else {
      fabricCanvas.isDrawingMode = false;
    }
    
    const wrapper = fabricCanvas.wrapperEl;
    if (wrapper) {
      wrapper.style.position = 'absolute';
      wrapper.style.top = '0';
      wrapper.style.left = '0';
      wrapper.style.zIndex = '10';
      wrapper.style.pointerEvents = activeTool ? 'auto' : 'none';
      wrapper.style.touchAction = activeTool ? 'none' : 'auto';
    }

    const upperCanvas = fabricCanvas.upperCanvasEl;
    if (upperCanvas) {
      upperCanvas.style.touchAction = activeTool ? 'none' : 'auto';
    }
    
    fabricCanvas.requestRenderAll();
  }, [activeTool]);

  const renderAnnotationsOnCanvas = useCallback(() => {
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas) return;

    fabricCanvas.clear();
    
    const pageAnnotations = annotations.filter(a => a.pageNum === currentPage);
    let pending = pageAnnotations.length;
    
    if (pending === 0) {
      fabricCanvas.requestRenderAll();
      return;
    }

    for (const annotation of pageAnnotations) {
      if (annotation.type === 'stroke' && annotation.fabricJSON) {
        Path.fromObject(annotation.fabricJSON).then((path: any) => {
          const savedScale = annotation.scale || 1.2;
          if (savedScale !== scale) {
            const scaleRatio = scale / savedScale;
            path.scaleX = (path.scaleX || 1) * scaleRatio;
            path.scaleY = (path.scaleY || 1) * scaleRatio;
            path.left = (path.left || 0) * scaleRatio;
            path.top = (path.top || 0) * scaleRatio;
            path.setCoords();
          }
          path.objectCaching = false;
          fabricCanvas.add(path);
          pending--;
          if (pending <= 0) fabricCanvas.requestRenderAll();
        });
      } else if (annotation.type === 'text' && annotation.text) {
        const savedScale = annotation.scale || 1.2;
        const scaleRatio = scale / savedScale;
        const text = new FabricText(annotation.text, {
          left: (annotation.x || 0) * scaleRatio,
          top: (annotation.y || 0) * scaleRatio,
          fontSize: 16 * scaleRatio,
          fill: '#000000',
          fontFamily: 'Arial',
          selectable: false,
          evented: false,
          objectCaching: false
        });
        fabricCanvas.add(text);
        pending--;
        if (pending <= 0) fabricCanvas.requestRenderAll();
      }
    }
  }, [annotations, currentPage, scale]);

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
        selectable: false,
        evented: false,
        objectCaching: false
      });
      fabricCanvas.add(textObj);
      fabricCanvas.requestRenderAll();
      
      const newAnnotation: StudentAnnotation = {
        id: `text-${Date.now()}`,
        type: 'text',
        pageNum: currentPage,
        text,
        x,
        y,
        toolType: 'text',
        scale: scale
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
    <div className="h-screen flex flex-col bg-white" style={{ touchAction: 'manipulation' }}>
      {/* Toolbar - larger touch targets for e-ink devices */}
      <div className="flex items-center justify-between p-2 border-b-2 border-black bg-white">
        <div className="flex items-center gap-1">
          <Button
            variant={activeTool === 'pen' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool(activeTool === 'pen' ? null : 'pen')}
            className="min-w-[44px] min-h-[44px]"
            title="Pen"
          >
            <Pen className="h-5 w-5" />
          </Button>
          <Button
            variant={activeTool === 'highlight' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool(activeTool === 'highlight' ? null : 'highlight')}
            className="min-w-[44px] min-h-[44px]"
            title="Highlighter"
          >
            <Highlighter className="h-5 w-5" />
          </Button>
          <Button
            variant={activeTool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool(activeTool === 'eraser' ? null : 'eraser')}
            className="min-w-[44px] min-h-[44px]"
            title="Eraser"
          >
            <Eraser className="h-5 w-5" />
          </Button>
          <Button
            variant={activeTool === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool(activeTool === 'text' ? null : 'text')}
            className="min-w-[44px] min-h-[44px]"
            title="Text"
          >
            <Type className="h-5 w-5" />
          </Button>
          <div className="w-px h-8 bg-black mx-1" />
          <Button variant="outline" size="sm" onClick={handleZoomOut} title="Zoom Out" className="min-w-[44px] min-h-[44px]">
            <ZoomOut className="h-5 w-5" />
          </Button>
          <span className="text-sm font-bold text-black min-w-[50px] text-center">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="sm" onClick={handleZoomIn} title="Zoom In" className="min-w-[44px] min-h-[44px]">
            <ZoomIn className="h-5 w-5" />
          </Button>
          <div className="w-px h-8 bg-black mx-1" />
          <Button variant="outline" size="sm" onClick={clearAnnotations} title="Clear Page" className="min-w-[44px] min-h-[44px]">
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        {numPages > 1 && (
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={goToPrevPage} disabled={currentPage === 1} className="min-w-[44px] min-h-[44px]">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm font-bold">Page {currentPage}/{numPages}</span>
            <Button variant="outline" size="sm" onClick={goToNextPage} disabled={currentPage === numPages} className="min-w-[44px] min-h-[44px]">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveSubmission.mutate('draft')}
            disabled={isSaving || isSubmitting}
            className="min-w-[44px] min-h-[44px]"
          >
            <Save className="h-5 w-5 mr-1" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            size="sm"
            onClick={() => saveSubmission.mutate('submitted')}
            disabled={isSaving || isSubmitting}
            className="min-w-[44px] min-h-[44px]"
          >
            <Send className="h-5 w-5 mr-1" />
            {isSubmitting ? '...' : 'Submit'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClose} className="min-w-[44px] min-h-[44px]">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* PDF Viewer with Fabric.js Overlay */}
      <div
        className="flex-1 overflow-auto bg-gray-100"
        ref={containerRef}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {!pdfLoaded ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-black font-bold">Loading PDF...</p>
          </div>
        ) : (
          <div className="flex justify-center p-4">
            <div 
              className="relative inline-block"
              onClick={handleCanvasClick}
              style={{
                cursor: activeTool === 'text' ? 'text' : activeTool ? 'crosshair' : 'default',
                touchAction: activeTool ? 'none' : 'auto'
              }}
            >
              <canvas
                ref={pdfCanvasRef}
                className="border-2 border-black bg-white block"
                style={{ touchAction: 'none' }}
              />
              <canvas
                ref={overlayCanvasRef}
                className="absolute top-0 left-0"
                style={{ touchAction: 'none' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PDFAnnotatorPage;

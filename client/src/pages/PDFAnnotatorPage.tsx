import { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Save, Send, X, Pen, Highlighter, Eraser, Type, RotateCcw, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

type Tool = 'pen' | 'eraser' | 'text' | 'highlight' | null;

interface Point {
  x: number;
  y: number;
}

interface StrokeData {
  points: Point[];
  color: string;
  width: number;
  compositeOp: string;
}

interface StudentAnnotation {
  id: string;
  type: 'stroke' | 'text';
  pageNum: number;
  stroke?: StrokeData;
  fabricJSON?: any;
  text?: string;
  x?: number;
  y?: number;
  toolType: 'pen' | 'highlight' | 'eraser' | 'text';
  scale?: number;
}

function convertFabricToStroke(fabricJSON: any): StrokeData | null {
  try {
    if (!fabricJSON || !fabricJSON.path) return null;
    const points: Point[] = [];
    for (const cmd of fabricJSON.path) {
      if (cmd.length >= 3) {
        points.push({ x: (fabricJSON.left || 0) + cmd[1], y: (fabricJSON.top || 0) + cmd[2] });
      }
    }
    if (points.length < 2) return null;
    return {
      points,
      color: fabricJSON.stroke || '#000000',
      width: fabricJSON.strokeWidth || 2,
      compositeOp: 'source-over'
    };
  } catch {
    return null;
  }
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
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentStrokeRef = useRef<Point[]>([]);
  const lastPointRef = useRef<Point | null>(null);
  const rafRef = useRef<number>(0);
  const isDrawingRef = useRef(false);
  const annotationsRef = useRef<StudentAnnotation[]>([]);
  
  annotationsRef.current = annotations;

  const { toast } = useToast();

  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isDrawingRef.current) {
        isDrawingRef.current = false;
        setIsDrawing(false);
        lastPointRef.current = null;
        currentStrokeRef.current = [];
      }
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, []);

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
    return () => { if (pdfDocRef.current) pdfDocRef.current.destroy(); };
  }, [pdfUrl]);

  const getToolSettings = useCallback((tool: Tool) => {
    switch (tool) {
      case 'pen': return { color: '#000000', width: 2, compositeOp: 'source-over' };
      case 'highlight': return { color: 'rgba(255, 255, 0, 0.4)', width: 14, compositeOp: 'source-over' };
      case 'eraser': return { color: 'rgba(0,0,0,1)', width: 16, compositeOp: 'destination-out' };
      default: return { color: '#000000', width: 2, compositeOp: 'source-over' };
    }
  }, []);

  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: StrokeData, scaleRatio: number = 1) => {
    if (stroke.points.length < 2) return;
    
    ctx.save();
    ctx.globalCompositeOperation = stroke.compositeOp as GlobalCompositeOperation;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width * scaleRatio;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x * scaleRatio, stroke.points[0].y * scaleRatio);
    
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x * scaleRatio, stroke.points[i].y * scaleRatio);
    }
    
    ctx.stroke();
    ctx.restore();
  }, []);

  const redrawAnnotations = useCallback((pageNum: number, currentScale: number) => {
    const canvas = drawCanvasRef.current;
    if (!canvas || canvas.width === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const pageAnnotations = annotationsRef.current.filter(a => a.pageNum === pageNum);
    
    for (const annotation of pageAnnotations) {
      if (annotation.type === 'stroke' && (annotation.stroke || annotation.fabricJSON)) {
        const savedScale = annotation.scale || 1.2;
        const scaleRatio = currentScale / savedScale;
        let strokeData = annotation.stroke;
        if (!strokeData && annotation.fabricJSON) {
          strokeData = convertFabricToStroke(annotation.fabricJSON) || undefined;
        }
        if (strokeData) {
          drawStroke(ctx, strokeData, scaleRatio);
        }
      } else if (annotation.type === 'text' && annotation.text) {
        const savedScale = annotation.scale || 1.2;
        const scaleRatio = currentScale / savedScale;
        ctx.save();
        ctx.font = `${16 * scaleRatio}px Arial`;
        ctx.fillStyle = '#000000';
        ctx.fillText(annotation.text, (annotation.x || 0) * scaleRatio, (annotation.y || 0) * scaleRatio);
        ctx.restore();
      }
    }
  }, [drawStroke]);

  useEffect(() => {
    if (!pdfLoaded || !pdfDocRef.current || numPages === 0) return;
    
    let cancelled = false;
    const renderPage = async () => {
      try {
        const page = await pdfDocRef.current!.getPage(currentPage);
        const viewport = page.getViewport({ scale });
        
        if (cancelled) return;
        
        const pdfCanvas = pdfCanvasRef.current;
        const drawCanvas = drawCanvasRef.current;

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

        if (drawCanvas && !cancelled) {
          drawCanvas.width = viewport.width;
          drawCanvas.height = viewport.height;
          setCanvasSize({ width: viewport.width, height: viewport.height });
        }
      } catch (error) {
        if (!cancelled) console.error(`Error rendering page ${currentPage}:`, error);
      }
    };
    
    renderPage();
    return () => { cancelled = true; };
  }, [pdfLoaded, numPages, currentPage, scale]);

  useEffect(() => {
    if (canvasSize.width === 0) return;
    redrawAnnotations(currentPage, scale);
  }, [annotations, canvasSize, redrawAnnotations, currentPage, scale]);

  const getPointerPos = useCallback((e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = drawCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!activeTool || activeTool === 'text') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    
    const point = getPointerPos(e);
    currentStrokeRef.current = [point];
    lastPointRef.current = point;
    isDrawingRef.current = true;
    setIsDrawing(true);
  }, [activeTool, getPointerPos]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !activeTool || activeTool === 'text') return;
    
    e.preventDefault();
    
    const point = getPointerPos(e);
    const lastPoint = lastPointRef.current;
    if (!lastPoint) return;
    
    const dx = point.x - lastPoint.x;
    const dy = point.y - lastPoint.y;
    if (dx * dx + dy * dy < 4) return;
    
    currentStrokeRef.current.push(point);
    const prevPoint = lastPoint;
    lastPointRef.current = point;
    
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const canvas = drawCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const settings = getToolSettings(activeTool);
      ctx.save();
      ctx.globalCompositeOperation = settings.compositeOp as GlobalCompositeOperation;
      ctx.strokeStyle = settings.color;
      ctx.lineWidth = settings.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(prevPoint.x, prevPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      ctx.restore();
    });
  }, [isDrawing, activeTool, getPointerPos, getToolSettings]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !activeTool || activeTool === 'text') return;
    
    e.preventDefault();
    isDrawingRef.current = false;
    setIsDrawing(false);
    lastPointRef.current = null;
    
    const points = currentStrokeRef.current;
    if (points.length < 2) {
      currentStrokeRef.current = [];
      return;
    }
    
    const settings = getToolSettings(activeTool);
    const newAnnotation: StudentAnnotation = {
      id: `stroke-${Date.now()}`,
      type: 'stroke',
      pageNum: currentPage,
      toolType: activeTool as 'pen' | 'highlight' | 'eraser',
      stroke: {
        points: [...points],
        color: settings.color,
        width: settings.width,
        compositeOp: settings.compositeOp
      },
      scale: scale
    };
    
    setAnnotations(prev => [...prev, newAnnotation]);
    currentStrokeRef.current = [];
  }, [isDrawing, activeTool, currentPage, scale, getToolSettings]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== 'text') return;
    
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const text = prompt('Enter text:');
    if (text) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = '16px Arial';
        ctx.fillStyle = '#000000';
        ctx.fillText(text, x, y);
      }
      
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
  };

  const handleZoomIn = () => setScale(s => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.25, 0.5));
  const goToPrevPage = () => setCurrentPage(p => Math.max(p - 1, 1));
  const goToNextPage = () => setCurrentPage(p => Math.min(p + 1, numPages));

  const saveSubmission = useMutation({
    mutationFn: async (status: 'draft' | 'submitted') => {
      setIsSaving(status === 'draft');
      setIsSubmitting(status === 'submitted');
      
      const pdfCanvas = pdfCanvasRef.current;
      const drawCanvas = drawCanvasRef.current;
      
      if (!drawCanvas || !pdfCanvas) {
        throw new Error('Canvas not available');
      }

      const mergedCanvas = document.createElement('canvas');
      mergedCanvas.width = pdfCanvas.width;
      mergedCanvas.height = pdfCanvas.height;
      const mergedCtx = mergedCanvas.getContext('2d');
      
      if (mergedCtx) {
        mergedCtx.drawImage(pdfCanvas, 0, 0);
        mergedCtx.drawImage(drawCanvas, 0, 0);
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
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-black font-bold mb-4">{pdfError}</p>
          <Button onClick={handleClose}>Close</Button>
        </div>
      </div>
    );
  }

  const toolBtnClass = "min-w-[48px] min-h-[48px] text-base font-bold";

  return (
    <div className="h-screen flex flex-col bg-white select-none" style={{ touchAction: 'manipulation' }}>
      <div className="flex items-center justify-between p-2 border-b-2 border-black bg-white">
        <div className="flex items-center gap-1">
          <Button
            variant={activeTool === 'pen' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool(activeTool === 'pen' ? null : 'pen')}
            className={toolBtnClass}
          >
            <Pen className="h-5 w-5" />
          </Button>
          <Button
            variant={activeTool === 'highlight' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool(activeTool === 'highlight' ? null : 'highlight')}
            className={toolBtnClass}
          >
            <Highlighter className="h-5 w-5" />
          </Button>
          <Button
            variant={activeTool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool(activeTool === 'eraser' ? null : 'eraser')}
            className={toolBtnClass}
          >
            <Eraser className="h-5 w-5" />
          </Button>
          <Button
            variant={activeTool === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool(activeTool === 'text' ? null : 'text')}
            className={toolBtnClass}
          >
            <Type className="h-5 w-5" />
          </Button>
          <div className="w-px h-8 bg-black mx-1" />
          <Button variant="outline" size="sm" onClick={handleZoomOut} className={toolBtnClass}>
            <ZoomOut className="h-5 w-5" />
          </Button>
          <span className="text-sm font-bold text-black min-w-[50px] text-center">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="sm" onClick={handleZoomIn} className={toolBtnClass}>
            <ZoomIn className="h-5 w-5" />
          </Button>
          <div className="w-px h-8 bg-black mx-1" />
          <Button variant="outline" size="sm" onClick={clearAnnotations} className={toolBtnClass}>
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        {numPages > 1 && (
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={goToPrevPage} disabled={currentPage === 1} className={toolBtnClass}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm font-bold">{currentPage}/{numPages}</span>
            <Button variant="outline" size="sm" onClick={goToNextPage} disabled={currentPage === numPages} className={toolBtnClass}>
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
            className={toolBtnClass}
          >
            <Save className="h-5 w-5 mr-1" />
            {isSaving ? '...' : 'Save'}
          </Button>
          <Button
            size="sm"
            onClick={() => saveSubmission.mutate('submitted')}
            disabled={isSaving || isSubmitting}
            className={toolBtnClass}
          >
            <Send className="h-5 w-5 mr-1" />
            {isSubmitting ? '...' : 'Submit'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClose} className={toolBtnClass}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

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
              className="relative inline-block border-2 border-black"
              onClick={handleCanvasClick}
              style={{
                cursor: activeTool === 'text' ? 'text' : activeTool ? 'crosshair' : 'default',
                width: canvasSize.width > 0 ? `${canvasSize.width}px` : undefined,
                height: canvasSize.height > 0 ? `${canvasSize.height}px` : undefined,
              }}
            >
              <canvas
                ref={pdfCanvasRef}
                className="bg-white block"
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
              <canvas
                ref={drawCanvasRef}
                className="absolute top-0 left-0"
                style={{
                  touchAction: 'none',
                  pointerEvents: activeTool ? 'auto' : 'none',
                  width: '100%',
                  height: '100%',
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PDFAnnotatorPage;

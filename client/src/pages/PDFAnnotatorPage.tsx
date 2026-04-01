import { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, getCsrfToken, queryClient } from '@/lib/queryClient';
import { Save, Send, Eraser, RotateCcw, RotateCw, Undo2, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useLocation } from 'wouter';
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
  rotation?: number; // viewRotation when annotation was drawn (0/90/180/270)
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
  const [, navigate] = useLocation();
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [pinchTransform, setPinchTransform] = useState(1);
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
  const [viewRotation, setViewRotation] = useState(0); // manual rotation: 0, 90, 180, 270
  const viewRotationRef = useRef(0); // mirror of viewRotation for use in callbacks
  viewRotationRef.current = viewRotation;

  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentStrokeRef = useRef<Point[]>([]);
  const lastPointRef = useRef<Point | null>(null);
  const smoothPointRef = useRef<Point | null>(null);
  const rafRef = useRef<number>(0);
  const isDrawingRef = useRef(false);
  const annotationsRef = useRef<StudentAnnotation[]>([]);
  const activeToolRef = useRef<Tool>(null);
  const currentPageRef = useRef(1);
  const scaleRef = useRef(1.2);

  annotationsRef.current = annotations;
  activeToolRef.current = activeTool;
  currentPageRef.current = currentPage;
  scaleRef.current = scale;

  const touchPointsRef = useRef<Map<number, Point>>(new Map());
  const initialTouchDistRef = useRef(0);
  const initialScaleRef = useRef(1.2);
  const pinchScaleRef = useRef(1);
  const lastScrollRef = useRef<Point | null>(null);

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const initialLoadRef = useRef(0);

  const { toast } = useToast();
  const DPR = Math.min(window.devicePixelRatio || 1, 3);

  useEffect(() => {
    const handleGlobalPointerUp = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        touchPointsRef.current.delete(e.pointerId);
        if (touchPointsRef.current.size === 0) {
          if (pinchScaleRef.current !== 1) {
            const newScale = Math.min(3, Math.max(0.5, initialScaleRef.current * pinchScaleRef.current));
            setScale(newScale);
            setPinchTransform(1);
            pinchScaleRef.current = 1;
          }
          lastScrollRef.current = null;
        }
        return;
      }
      if (isDrawingRef.current) {
        isDrawingRef.current = false;
        setIsDrawing(false);
        lastPointRef.current = null;
        smoothPointRef.current = null;
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
  const docIndex = urlParams.get('docIndex') || '0';
  const returnTo = urlParams.get('returnTo') || '/';
  const pdfUrl = assignmentId ? `/api/pdf-proxy/${assignmentId}?docIndex=${docIndex}` : '';

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

  // Load stored page rotations for this assignment
  const { data: assignmentData } = useQuery({
    queryKey: ['/api/assignments', assignmentId],
    queryFn: async () => {
      const response = await fetch(`/api/assignments/${assignmentId}`, { credentials: 'include' });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!assignmentId
  });

  // In-memory map of page rotations (updated on rotate, seeded from DB)
  const pageRotationsMapRef = useRef<Record<string, number>>({});

  // Seed the in-memory map once assignment data loads
  useEffect(() => {
    if (assignmentData?.pageRotations) {
      pageRotationsMapRef.current = assignmentData.pageRotations;
      // Apply stored rotation for the current page
      const stored = assignmentData.pageRotations[String(currentPage)] ?? 0;
      setViewRotation(stored);
    }
  }, [assignmentData]);

  useEffect(() => {
    if (existingSubmission?.annotations && Array.isArray(existingSubmission.annotations)) {
      setAnnotations(existingSubmission.annotations);
      initialLoadRef.current = existingSubmission.annotations.length;
    }
  }, [existingSubmission]);

  useEffect(() => {
    if (annotations.length === 0 || !assignmentId) return;
    if (initialLoadRef.current > 0) {
      initialLoadRef.current = 0;
      return;
    }

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        setAutoSaveStatus('saving');
        await apiRequest('/api/submissions/auto-save-annotations', 'POST', {
          assignmentId,
          annotations: JSON.stringify(annotations),
        });
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } catch {
        setAutoSaveStatus('idle');
      }
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [annotations, assignmentId]);

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
    const S = DPR * scaleRatio;

    ctx.save();
    ctx.globalCompositeOperation = stroke.compositeOp as GlobalCompositeOperation;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width * S;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const pts = stroke.points;
    ctx.beginPath();
    ctx.moveTo(pts[0].x * S, pts[0].y * S);

    if (pts.length === 2) {
      ctx.lineTo(pts[1].x * S, pts[1].y * S);
    } else {
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2 * S;
        const my = (pts[i].y + pts[i + 1].y) / 2 * S;
        ctx.quadraticCurveTo(pts[i].x * S, pts[i].y * S, mx, my);
      }
      ctx.lineTo(pts[pts.length - 1].x * S, pts[pts.length - 1].y * S);
    }

    ctx.stroke();
    ctx.restore();
  }, [DPR]);

  const redrawAnnotations = useCallback((pageNum: number, currentScale: number) => {
    const canvas = drawCanvasRef.current;
    if (!canvas || canvas.width === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const pageAnnotations = annotationsRef.current.filter(a =>
      a.pageNum === pageNum &&
      // Show annotation only if it matches current rotation, or it predates the rotation field (rotation undefined)
      (a.rotation === undefined || a.rotation === viewRotationRef.current)
    );
    
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
        const S = DPR * scaleRatio;
        ctx.save();
        ctx.font = `${16 * S}px Arial`;
        ctx.fillStyle = '#000000';
        ctx.fillText(annotation.text, (annotation.x || 0) * S, (annotation.y || 0) * S);
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
        // Combine the PDF's own rotation metadata with any manual view rotation
        // so users can fix sideways PDFs that have no rotation metadata (rotate: 0)
        const pageRotation = page.rotate ?? 0;
        const totalRotation = (pageRotation + viewRotation) % 360;
        const viewport = page.getViewport({ scale: scale * DPR, rotation: totalRotation });
        const logicalW = Math.round(viewport.width / DPR);
        const logicalH = Math.round(viewport.height / DPR);

        if (cancelled) return;

        const pdfCanvas = pdfCanvasRef.current;
        const drawCanvas = drawCanvasRef.current;

        if (pdfCanvas) {
          pdfCanvas.width = viewport.width;   // physical pixels
          pdfCanvas.height = viewport.height;
          pdfCanvas.style.width = `${logicalW}px`;
          pdfCanvas.style.height = `${logicalH}px`;
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
          drawCanvas.width = viewport.width;   // physical pixels
          drawCanvas.height = viewport.height;
          drawCanvas.style.width = `${logicalW}px`;
          drawCanvas.style.height = `${logicalH}px`;
          setCanvasSize({ width: logicalW, height: logicalH });
        }
      } catch (error) {
        if (!cancelled) console.error(`Error rendering page ${currentPage}:`, error);
      }
    };
    
    renderPage();
    return () => { cancelled = true; };
  }, [pdfLoaded, numPages, currentPage, scale, viewRotation]);

  useEffect(() => {
    if (canvasSize.width === 0) return;
    redrawAnnotations(currentPage, scale);
  }, [annotations, canvasSize, redrawAnnotations, currentPage, scale]);

  const getPointerPos = useCallback((e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = drawCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    // Return logical (CSS) coordinates — DPR is applied when drawing
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === 'touch') {
      e.preventDefault();
      touchPointsRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touchPointsRef.current.size === 1) {
        lastScrollRef.current = { x: e.clientX, y: e.clientY };
      } else if (touchPointsRef.current.size === 2) {
        const pts = Array.from(touchPointsRef.current.values());
        initialTouchDistRef.current = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        initialScaleRef.current = scaleRef.current;
        pinchScaleRef.current = 1;
        lastScrollRef.current = null;
      }
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    const canvas = drawCanvasRef.current;
    if (!canvas) return;

    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    const point = getPointerPos(e);
    currentStrokeRef.current = [point];
    lastPointRef.current = point;
    smoothPointRef.current = point;
    isDrawingRef.current = true;
    setIsDrawing(true);
  }, [getPointerPos]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === 'touch') {
      e.preventDefault();
      touchPointsRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const container = containerRef.current;
      if (touchPointsRef.current.size === 1 && container && lastScrollRef.current) {
        const dx = lastScrollRef.current.x - e.clientX;
        const dy = lastScrollRef.current.y - e.clientY;
        container.scrollLeft += dx;
        container.scrollTop += dy;
        lastScrollRef.current = { x: e.clientX, y: e.clientY };
      } else if (touchPointsRef.current.size === 2 && initialTouchDistRef.current > 0) {
        const pts = Array.from(touchPointsRef.current.values());
        const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        const ratio = dist / initialTouchDistRef.current;
        pinchScaleRef.current = ratio;
        setPinchTransform(ratio);
      }
      return;
    }

    if (!isDrawingRef.current || !activeToolRef.current) return;

    e.preventDefault();

    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tool = activeToolRef.current;
    const rect = canvas.getBoundingClientRect();

    // Collect all sub-frame stylus positions (120–240 Hz on modern tablets)
    const nativeEvts: PointerEvent[] = (e.nativeEvent as any).getCoalescedEvents?.() ?? [e.nativeEvent];

    for (const nEvt of nativeEvts) {
      // Raw position in logical CSS pixels
      const rawX = nEvt.clientX - rect.left;
      const rawY = nEvt.clientY - rect.top;

      // Exponential moving average — dampens jitter without noticeable lag
      const prev = smoothPointRef.current;
      const smoothX = prev ? 0.4 * rawX + 0.6 * prev.x : rawX;
      const smoothY = prev ? 0.4 * rawY + 0.6 * prev.y : rawY;
      smoothPointRef.current = { x: smoothX, y: smoothY };

      const lastPoint = lastPointRef.current;
      if (!lastPoint) continue;

      currentStrokeRef.current.push({ x: smoothX, y: smoothY });
      lastPointRef.current = { x: smoothX, y: smoothY };
    }

    // Redraw entire current stroke each frame — identical to final saved result
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const canvas2 = drawCanvasRef.current;
      if (!canvas2) return;
      const ctx2 = canvas2.getContext('2d');
      if (!ctx2) return;

      ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

      // Repaint all completed strokes on this page
      const pg = currentPageRef.current;
      const sc = scaleRef.current;
      for (const ann of annotationsRef.current) {
        if (ann.pageNum !== pg) continue;
        if (ann.type === 'stroke') {
          const sr = sc / (ann.scale || 1.2);
          const sd = ann.stroke ?? (ann.fabricJSON ? convertFabricToStroke(ann.fabricJSON) ?? undefined : undefined);
          if (sd) drawStroke(ctx2, sd, sr);
        } else if (ann.type === 'text' && ann.text) {
          const S = DPR * sc / (ann.scale || 1.2);
          ctx2.save();
          ctx2.font = `${16 * S}px Arial`;
          ctx2.fillStyle = '#000000';
          ctx2.fillText(ann.text, (ann.x || 0) * S, (ann.y || 0) * S);
          ctx2.restore();
        }
      }

      // Paint the in-progress stroke using the same smooth bezier algorithm
      const pts = currentStrokeRef.current;
      if (pts.length >= 2) {
        const settings = getToolSettings(tool);
        drawStroke(ctx2, { points: pts, color: settings.color, width: settings.width, compositeOp: settings.compositeOp }, 1);
      }
    });
  }, [drawStroke, getToolSettings, DPR]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === 'touch') {
      e.preventDefault();
      touchPointsRef.current.delete(e.pointerId);
      if (touchPointsRef.current.size === 0) {
        if (pinchScaleRef.current !== 1) {
          const newScale = Math.min(3, Math.max(0.5, initialScaleRef.current * pinchScaleRef.current));
          setScale(newScale);
          setPinchTransform(1);
          pinchScaleRef.current = 1;
        }
        lastScrollRef.current = null;
      } else if (touchPointsRef.current.size === 1) {
        const remaining = Array.from(touchPointsRef.current.values())[0];
        lastScrollRef.current = remaining;
      }
      return;
    }

    if (!isDrawing || !activeTool) return;

    e.preventDefault();
    isDrawingRef.current = false;
    setIsDrawing(false);
    lastPointRef.current = null;
    smoothPointRef.current = null;

    const points = currentStrokeRef.current;

    // Single tap (dot) — no movement recorded; duplicate the point so drawStroke
    // renders a round-capped zero-length line which appears as a filled circle
    if (points.length === 1) {
      points.push({ ...points[0] });
    }

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
      scale: scale,
      rotation: viewRotationRef.current
    };
    
    setAnnotations(prev => [...prev, newAnnotation]);
    currentStrokeRef.current = [];
  }, [isDrawing, activeTool, currentPage, scale, getToolSettings]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== 'text') return;

    const canvas = drawCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Store in logical CSS coords; DPR applied when drawing
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const text = prompt('Enter text:');
    if (text) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = `${16 * DPR}px Arial`;
        ctx.fillStyle = '#000000';
        ctx.fillText(text, x * DPR, y * DPR);
      }
      
      const newAnnotation: StudentAnnotation = {
        id: `text-${Date.now()}`,
        type: 'text',
        pageNum: currentPage,
        text,
        x,
        y,
        toolType: 'text',
        scale: scale,
        rotation: viewRotationRef.current
      };
      setAnnotations(prev => [...prev, newAnnotation]);
    }
  };

  const clearAnnotations = () => {
    setAnnotations(prev => prev.filter(a => a.pageNum !== currentPage));
  };

  const handleUndo = () => {
    setAnnotations(prev => {
      const pageAnns = prev.filter(a => a.pageNum === currentPage);
      if (pageAnns.length === 0) return prev;
      const lastId = pageAnns[pageAnns.length - 1].id;
      return prev.filter(a => a.id !== lastId);
    });
  };

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setScale(s => Math.min(3, Math.max(0.5, s - e.deltaY * 0.001)));
  }, []);
  const goToPrevPage = () => {
    const next = Math.max(currentPage - 1, 1);
    setCurrentPage(next);
    setViewRotation(pageRotationsMapRef.current[String(next)] ?? 0);
  };
  const goToNextPage = () => {
    const next = Math.min(currentPage + 1, numPages);
    setCurrentPage(next);
    setViewRotation(pageRotationsMapRef.current[String(next)] ?? 0);
  };
  const rotateView = async () => {
    const next = (viewRotation + 90) % 360;
    setViewRotation(next);
    // Persist to the in-memory map and DB
    pageRotationsMapRef.current[String(currentPage)] = next;
    if (assignmentId) {
      const csrfToken = await getCsrfToken();
      fetch(`/api/assignments/${assignmentId}/page-rotation`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}) },
        credentials: 'include',
        body: JSON.stringify({ pageNum: currentPage, rotation: next }),
      }).then(() => {
        // Bust cache so the saved rotation is re-loaded when the PDF is reopened
        queryClient.invalidateQueries({ queryKey: ['/api/assignments', assignmentId] });
      }).catch(err => console.warn('Failed to save page rotation:', err));
    }
  };

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

      const csrfToken = await getCsrfToken();
      const response = await fetch('/api/submissions/annotated', {
        method: 'POST',
        headers: csrfToken ? { 'x-csrf-token': csrfToken } : {},
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to save submission');
      }

      return response.json();
    },
    onSuccess: (_, status) => {
      // Mark current annotation count as saved so Home button won't prompt "unsaved work"
      initialLoadRef.current = annotationsRef.current.length;
      // Bust the cache so annotations reload fresh when the PDF is reopened
      queryClient.invalidateQueries({ queryKey: ['/api/assignments', assignmentId, 'my-submission'] });
      toast({
        title: status === 'submitted' ? 'Assignment Submitted' : 'Draft Saved',
        description: status === 'submitted' 
          ? 'Your assignment has been submitted successfully.' 
          : 'Your work has been saved as a draft.',
      });
      // Always navigate back after saving (draft or submitted)
      navigate(returnTo);
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
    if (annotations.length > initialLoadRef.current) {
      if (confirm('You have unsaved work. Are you sure you want to leave?')) {
        navigate(returnTo);
      }
    } else {
      navigate(returnTo);
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

        {/* Left: Home + annotation tools */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="min-w-[48px] min-h-[48px] text-base font-bold flex items-center gap-1.5 px-3"
            title="Back to dashboard"
          >
            <Home className="h-4 w-4" />
            <span className="text-xs hidden sm:inline">Home</span>
          </Button>
          <div className="w-px h-8 bg-gray-300 mx-1" />
          <Button
            variant={activeTool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool(activeTool === 'eraser' ? 'pen' : 'eraser')}
            className={toolBtnClass}
            title={activeTool === 'eraser' ? 'Switch to pen' : 'Switch to eraser'}
          >
            <Eraser className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleUndo} className={toolBtnClass} title="Undo last stroke">
            <Undo2 className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="sm" onClick={clearAnnotations} className={toolBtnClass} title="Clear page">
            <RotateCcw className="h-5 w-5" />
          </Button>
          <Button
            variant={viewRotation !== 0 ? 'default' : 'outline'}
            size="sm"
            onClick={rotateView}
            className={toolBtnClass}
            title={`Rotate page (currently ${viewRotation}°)`}
          >
            <RotateCw className="h-5 w-5" />
          </Button>
          <div className="w-px h-8 bg-black mx-1" />
          <span className="text-xs font-medium text-gray-600 px-1">
            {activeTool === 'eraser' ? 'Erasing' : 'Writing'}
          </span>
          <span className="text-xs text-gray-400">{Math.round(scale * 100)}%</span>
        </div>

        {/* Centre: page navigation */}
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

        {/* Right: Save + Submit */}
        <div className="flex items-center gap-1">
          {autoSaveStatus !== 'idle' && (
            <span className="text-xs text-gray-500 mr-1">
              {autoSaveStatus === 'saving' ? 'Saving...' : 'Saved ✓'}
            </span>
          )}
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
        </div>
      </div>

      <div
        className="flex-1 overflow-auto bg-gray-100"
        ref={containerRef}
        onWheel={handleWheel}
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
              style={{
                cursor: activeTool === 'eraser' ? 'cell' : 'crosshair',
                width: canvasSize.width > 0 ? `${canvasSize.width}px` : undefined,
                height: canvasSize.height > 0 ? `${canvasSize.height}px` : undefined,
                transform: pinchTransform !== 1 ? `scale(${pinchTransform})` : undefined,
                transformOrigin: 'center top',
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
                  pointerEvents: 'auto',
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

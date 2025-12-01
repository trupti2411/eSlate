import { useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Save, X, Pen, Highlighter, Eraser, Type, RotateCcw, Download, Send, Move } from 'lucide-react';

interface PDFAnnotatorProps {
  pdfUrl: string;
  assignmentId: string;
  onSave: (annotatedFileUrl: string) => Promise<void>;
  onClose: () => void;
  isSubmitted?: boolean;
  documentUrl?: string;
}

type Tool = 'pen' | 'eraser' | 'text' | 'highlight' | null;

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  tool: 'pen' | 'highlight' | 'eraser';
  color: string;
  lineWidth: number;
  compositeOperation: GlobalCompositeOperation;
}

interface TextAnnotation {
  x: number;
  y: number;
  text: string;
}

// Global store for strokes
const strokeStore: Map<string, { strokes: Stroke[]; texts: TextAnnotation[] }> = new Map();

function CanvasOverlay({ canvasRef, activeTool, onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onTouchStart, onTouchMove, onTouchEnd }: any) {
  return createPortal(
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        cursor: activeTool === 'text' ? 'text' : activeTool === 'eraser' ? 'grab' : activeTool === 'pen' || activeTool === 'highlight' ? 'crosshair' : 'default',
        pointerEvents: activeTool ? 'auto' : 'none',
        zIndex: 99999,
        touchAction: activeTool ? 'none' : 'auto',
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    />,
    document.body
  );
}

function PDFAnnotatorContent({ pdfUrl, assignmentId, onSave, onClose, isSubmitted = false, documentUrl }: PDFAnnotatorProps) {
  const [activeTool, setActiveTool] = useState<Tool>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  
  const storeKey = `${assignmentId}-${documentUrl || pdfUrl}`;
  const [strokes, setStrokes] = useState<Stroke[]>(() => strokeStore.get(storeKey)?.strokes || []);
  const [texts, setTexts] = useState<TextAnnotation[]>(() => strokeStore.get(storeKey)?.texts || []);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfViewerRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const strokesRef = useRef(strokes);
  const textsRef = useRef(texts);
  const currentStrokeRef = useRef(currentStroke);
  
  const { toast } = useToast();

  useEffect(() => {
    strokeStore.set(storeKey, { strokes, texts });
  }, [strokes, texts, storeKey]);

  useEffect(() => {
    strokesRef.current = strokes;
  }, [strokes]);

  useEffect(() => {
    textsRef.current = texts;
  }, [texts]);

  useEffect(() => {
    currentStrokeRef.current = currentStroke;
  }, [currentStroke]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const currentStrokes = strokesRef.current;
    const currentTexts = textsRef.current;
    const currentDrawingStroke = currentStrokeRef.current;

    currentStrokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      
      ctx.beginPath();
      ctx.globalCompositeOperation = stroke.compositeOperation;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });

    if (currentDrawingStroke && currentDrawingStroke.points.length >= 2) {
      ctx.beginPath();
      ctx.globalCompositeOperation = currentDrawingStroke.compositeOperation;
      ctx.strokeStyle = currentDrawingStroke.color;
      ctx.lineWidth = currentDrawingStroke.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.moveTo(currentDrawingStroke.points[0].x, currentDrawingStroke.points[0].y);
      for (let i = 1; i < currentDrawingStroke.points.length; i++) {
        ctx.lineTo(currentDrawingStroke.points[i].x, currentDrawingStroke.points[i].y);
      }
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.font = '18px Arial';
    ctx.fillStyle = '#000000';
    currentTexts.forEach(textAnnotation => {
      ctx.fillText(textAnnotation.text, textAnnotation.x, textAnnotation.y);
    });
  }, []);

  const initializeCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [strokes, texts, currentStroke, redrawCanvas]);

  const getToolSettings = (tool: Tool): Pick<Stroke, 'color' | 'lineWidth' | 'compositeOperation'> => {
    switch (tool) {
      case 'pen':
        return { color: '#000000', lineWidth: 3, compositeOperation: 'source-over' };
      case 'highlight':
        return { color: 'rgba(255, 255, 0, 0.5)', lineWidth: 20, compositeOperation: 'multiply' };
      case 'eraser':
        return { color: '#ffffff', lineWidth: 20, compositeOperation: 'destination-out' };
      default:
        return { color: '#000000', lineWidth: 3, compositeOperation: 'source-over' };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!activeTool || activeTool === 'text') {
      if (activeTool === 'text') {
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        const text = prompt('Enter text:');
        if (text) {
          setTexts(prev => [...prev, { x: clientX, y: clientY, text }]);
        }
      }
      return;
    }
    
    e.preventDefault();
    setIsDrawing(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const settings = getToolSettings(activeTool);
    setCurrentStroke({
      points: [{ x: clientX, y: clientY }],
      tool: activeTool as 'pen' | 'highlight' | 'eraser',
      ...settings
    });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke) return;
    
    e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    setCurrentStroke(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        points: [...prev.points, { x: clientX, y: clientY }]
      };
    });
  };

  const stopDrawing = () => {
    if (currentStroke && currentStroke.points.length >= 2) {
      setStrokes(prev => [...prev, currentStroke]);
    }
    setCurrentStroke(null);
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    setStrokes([]);
    setTexts([]);
    strokeStore.delete(storeKey);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `annotated-assignment-${assignmentId}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const hasAnnotations = strokes.length > 0 || texts.length > 0;

  const handleSaveAndSubmit = async (submitAfterSave: boolean = false) => {
    if (!canvasRef.current || isSaving || isSubmitting) return;

    const isSubmittingNow = isSaving ? false : submitAfterSave;
    if (isSubmittingNow) setIsSubmitting(true);
    setIsSaving(true);
    
    try {
      if (!hasAnnotations) {
        toast({
          title: "No Annotations",
          description: "Please add some annotations before saving.",
          variant: "destructive",
        });
        setIsSaving(false);
        if (isSubmittingNow) setIsSubmitting(false);
        return;
      }

      redrawCanvas();

      const canvas = canvasRef.current;
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        }, 'image/png', 1.0);
      });

      const uploadResponse = await fetch('/api/objects/upload', {
        method: 'POST',
        credentials: 'include'
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const uploadData = await uploadResponse.json();
      
      const putResponse = await fetch(uploadData.uploadURL, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': 'image/png'
        }
      });

      if (!putResponse.ok) {
        throw new Error('Failed to upload file');
      }

      const urlParts = uploadData.uploadURL.split('/');
      const objectKey = urlParts[urlParts.length - 1].split('?')[0];
      const annotatedFileUrl = `/api/public-objects/uploads/${objectKey}`;

      await onSave(annotatedFileUrl);

      if (isSubmittingNow) {
        strokeStore.delete(storeKey);
      }

      toast({
        title: isSubmittingNow ? "Assignment Submitted" : "Work Saved",
        description: isSubmittingNow 
          ? "Your annotated work has been submitted successfully."
          : "Your annotations have been saved. You can continue working or submit when ready.",
      });

      if (isSubmittingNow) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving annotations:', error);
      toast({
        title: "Error",
        description: "Failed to save annotations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      if (isSubmittingNow) setIsSubmitting(false);
    }
  };

  const handleToolChange = (tool: Tool) => {
    setActiveTool(tool);
  };

  useEffect(() => {
    initializeCanvas();
    
    const handleResize = () => {
      setTimeout(initializeCanvas, 50);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initializeCanvas]);

  return (
    <>
      <CanvasOverlay 
        canvasRef={canvasRef}
        activeTool={activeTool}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9998]">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] w-full mx-4 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <h2 className="text-xl font-bold text-black">Annotate Document</h2>
            <div className="flex items-center gap-2">
              {!isSubmitted && (
                <>
                  <Button
                    onClick={() => handleSaveAndSubmit(false)}
                    disabled={isSaving || isSubmitting || !hasAnnotations}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    data-testid="button-save-work"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving && !isSubmitting ? 'Saving...' : 'Save Work'}
                  </Button>
                  <Button
                    onClick={() => handleSaveAndSubmit(true)}
                    disabled={isSaving || isSubmitting || !hasAnnotations}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    data-testid="button-submit-assignment"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                  </Button>
                </>
              )}
              <Button onClick={onClose} variant="ghost" data-testid="button-close-annotator">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex h-[calc(90vh-180px)]">
            {/* Tool Sidebar */}
            <div className="w-48 bg-gray-100 border-r p-4 flex flex-col gap-4">
              <div>
                <h4 className="font-medium mb-2">Mode</h4>
                <Button
                  onClick={() => handleToolChange(null)}
                  className={`w-full justify-start ${activeTool === null ? 'bg-black text-white' : 'bg-white'}`}
                >
                  <Move className="h-4 w-4 mr-2" />
                  Navigate PDF
                </Button>
              </div>

              <div>
                <h4 className="font-medium mb-2">Drawing</h4>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleToolChange('pen')}
                    className={`w-full justify-start ${activeTool === 'pen' ? 'bg-black text-white' : 'bg-white'}`}
                  >
                    <Pen className="h-4 w-4 mr-2" />
                    Pen
                  </Button>
                  <Button
                    onClick={() => handleToolChange('highlight')}
                    className={`w-full justify-start ${activeTool === 'highlight' ? 'bg-black text-white' : 'bg-white'}`}
                  >
                    <Highlighter className="h-4 w-4 mr-2" />
                    Highlight
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Eraser</h4>
                <Button
                  onClick={() => handleToolChange('eraser')}
                  className={`w-full justify-start ${activeTool === 'eraser' ? 'bg-black text-white' : 'bg-white'}`}
                >
                  <Eraser className="h-4 w-4 mr-2" />
                  Eraser
                </Button>
              </div>

              <div>
                <h4 className="font-medium mb-2">Text</h4>
                <Button
                  onClick={() => handleToolChange('text')}
                  className={`w-full justify-start ${activeTool === 'text' ? 'bg-black text-white' : 'bg-white'}`}
                >
                  <Type className="h-4 w-4 mr-2" />
                  Add Text
                </Button>
              </div>

              <div>
                <h4 className="font-medium mb-2">Actions</h4>
                <div className="space-y-2">
                  <Button onClick={clearCanvas} className="w-full justify-start" variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                  <Button onClick={handleDownload} className="w-full justify-start" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 relative">
              <div 
                ref={containerRef}
                className="relative w-full h-full overflow-auto bg-gray-100"
              >
                <iframe
                  ref={pdfViewerRef}
                  src={pdfUrl}
                  className="w-full h-full border-0"
                  onLoad={() => {
                    setPdfLoaded(true);
                    setTimeout(initializeCanvas, 100);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 border-t bg-gray-50 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <strong>Instructions:</strong> Select "Navigate PDF" to scroll and read, then choose a tool to annotate. Click "Save Work" when finished.
                {hasAnnotations && <span className="ml-2 text-green-600 font-medium">({strokes.length} strokes, {texts.length} text annotations)</span>}
              </div>
              {!pdfLoaded && (
                <div className="flex items-center text-gray-600">
                  Loading PDF...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function PDFAnnotator(props: PDFAnnotatorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <PDFAnnotatorContent {...props} />,
    document.body
  );
}

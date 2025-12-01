import { useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Save, X, Pen, Highlighter, Eraser, Type, RotateCcw, Download, Send, Move, ZoomIn, ZoomOut } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
  pageIndex: number;
}

interface TextAnnotation {
  x: number;
  y: number;
  text: string;
  pageIndex: number;
}

// Global store for strokes
const strokeStore: Map<string, { strokes: Stroke[]; texts: TextAnnotation[] }> = new Map();

function PDFAnnotatorContent({ pdfUrl, assignmentId, onSave, onClose, isSubmitted = false, documentUrl }: PDFAnnotatorProps) {
  const [activeTool, setActiveTool] = useState<Tool>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [currentPage, setCurrentPage] = useState(0);
  
  const storeKey = `${assignmentId}-${documentUrl || pdfUrl}`;
  const [strokes, setStrokes] = useState<Stroke[]>(() => strokeStore.get(storeKey)?.strokes || []);
  const [texts, setTexts] = useState<TextAnnotation[]>(() => strokeStore.get(storeKey)?.texts || []);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const pageCanvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const annotationCanvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  
  const strokesRef = useRef(strokes);
  const textsRef = useRef(texts);
  const currentStrokeRef = useRef(currentStroke);
  
  const { toast } = useToast();

  useEffect(() => {
    strokeStore.set(storeKey, { strokes, texts });
    strokesRef.current = strokes;
  }, [strokes, texts, storeKey]);

  useEffect(() => {
    textsRef.current = texts;
  }, [texts]);

  useEffect(() => {
    currentStrokeRef.current = currentStroke;
  }, [currentStroke]);

  // Load PDF
  useEffect(() => {
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
        setPdfError('Failed to load PDF. The file may be inaccessible or in an unsupported format.');
        setPdfLoaded(false);
      }
    };

    loadPDF();

    return () => {
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
        pdfDocRef.current = null;
      }
    };
  }, [pdfUrl]);

  // Render a single page
  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdfDocRef.current) return;

    try {
      const page = await pdfDocRef.current.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const pdfCanvas = pageCanvasRefs.current.get(pageNum);
      const annotationCanvas = annotationCanvasRefs.current.get(pageNum);

      if (pdfCanvas) {
        const context = pdfCanvas.getContext('2d');
        if (context) {
          pdfCanvas.width = viewport.width;
          pdfCanvas.height = viewport.height;
          
          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: pdfCanvas
          } as any).promise;
        }
      }

      if (annotationCanvas) {
        annotationCanvas.width = viewport.width;
        annotationCanvas.height = viewport.height;
        redrawAnnotationsForPage(pageNum - 1);
      }
    } catch (error) {
      console.error(`Error rendering page ${pageNum}:`, error);
    }
  }, [scale]);

  // Render all pages
  useEffect(() => {
    if (!pdfLoaded || !pdfDocRef.current) return;

    const renderAllPages = async () => {
      for (let i = 1; i <= numPages; i++) {
        await renderPage(i);
      }
    };

    renderAllPages();
  }, [pdfLoaded, numPages, scale, renderPage]);

  // Redraw annotations for a specific page
  const redrawAnnotationsForPage = useCallback((pageIndex: number) => {
    const canvas = annotationCanvasRefs.current.get(pageIndex + 1);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const currentStrokes = strokesRef.current.filter(s => s.pageIndex === pageIndex);
    const currentTexts = textsRef.current.filter(t => t.pageIndex === pageIndex);
    const drawingStroke = currentStrokeRef.current;

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

    if (drawingStroke && drawingStroke.pageIndex === pageIndex && drawingStroke.points.length >= 2) {
      ctx.beginPath();
      ctx.globalCompositeOperation = drawingStroke.compositeOperation;
      ctx.strokeStyle = drawingStroke.color;
      ctx.lineWidth = drawingStroke.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.moveTo(drawingStroke.points[0].x, drawingStroke.points[0].y);
      for (let i = 1; i < drawingStroke.points.length; i++) {
        ctx.lineTo(drawingStroke.points[i].x, drawingStroke.points[i].y);
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

  // Redraw all annotations when they change
  useEffect(() => {
    for (let i = 0; i < numPages; i++) {
      redrawAnnotationsForPage(i);
    }
  }, [strokes, texts, currentStroke, numPages, redrawAnnotationsForPage]);

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

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const getPageIndexFromCanvas = (canvas: HTMLCanvasElement): number => {
    const entries = Array.from(annotationCanvasRefs.current.entries());
    for (const [pageNum, canvasEl] of entries) {
      if (canvasEl === canvas) {
        return pageNum - 1;
      }
    }
    return 0;
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget as HTMLCanvasElement;
    const pageIndex = getPageIndexFromCanvas(canvas);
    const { x, y } = getCanvasCoordinates(e, canvas);

    if (activeTool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        setTexts(prev => [...prev, { x, y, text, pageIndex }]);
      }
      return;
    }

    if (!activeTool) return;
    
    e.preventDefault();
    setIsDrawing(true);
    setCurrentPage(pageIndex);

    const settings = getToolSettings(activeTool);
    setCurrentStroke({
      points: [{ x, y }],
      tool: activeTool as 'pen' | 'highlight' | 'eraser',
      pageIndex,
      ...settings
    });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke) return;
    
    e.preventDefault();
    const canvas = e.currentTarget as HTMLCanvasElement;
    const { x, y } = getCanvasCoordinates(e, canvas);

    setCurrentStroke(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        points: [...prev.points, { x, y }]
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
    for (let i = 0; i < numPages; i++) {
      redrawAnnotationsForPage(i);
    }
  };

  const handleDownload = async () => {
    if (!pdfDocRef.current) return;
    
    // Create a combined canvas with all pages and annotations
    const combinedCanvas = document.createElement('canvas');
    const ctx = combinedCanvas.getContext('2d');
    if (!ctx) return;

    let totalHeight = 0;
    let maxWidth = 0;
    const pageData: { pdfCanvas: HTMLCanvasElement; annotCanvas: HTMLCanvasElement; height: number }[] = [];

    for (let i = 1; i <= numPages; i++) {
      const pdfCanvas = pageCanvasRefs.current.get(i);
      const annotCanvas = annotationCanvasRefs.current.get(i);
      if (pdfCanvas && annotCanvas) {
        pageData.push({ pdfCanvas, annotCanvas, height: pdfCanvas.height });
        totalHeight += pdfCanvas.height + 10; // 10px gap between pages
        maxWidth = Math.max(maxWidth, pdfCanvas.width);
      }
    }

    combinedCanvas.width = maxWidth;
    combinedCanvas.height = totalHeight;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);

    let yOffset = 0;
    for (const { pdfCanvas, annotCanvas, height } of pageData) {
      ctx.drawImage(pdfCanvas, 0, yOffset);
      ctx.drawImage(annotCanvas, 0, yOffset);
      yOffset += height + 10;
    }

    const link = document.createElement('a');
    link.download = `annotated-assignment-${assignmentId}.png`;
    link.href = combinedCanvas.toDataURL('image/png');
    link.click();
  };

  const hasAnnotations = strokes.length > 0 || texts.length > 0;

  const handleSaveAndSubmit = async (submitAfterSave: boolean = false) => {
    if (!pdfDocRef.current || isSaving || isSubmitting) return;

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

      // Create combined canvas
      const combinedCanvas = document.createElement('canvas');
      const ctx = combinedCanvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      let totalHeight = 0;
      let maxWidth = 0;
      const pageData: { pdfCanvas: HTMLCanvasElement; annotCanvas: HTMLCanvasElement; height: number }[] = [];

      for (let i = 1; i <= numPages; i++) {
        const pdfCanvas = pageCanvasRefs.current.get(i);
        const annotCanvas = annotationCanvasRefs.current.get(i);
        if (pdfCanvas && annotCanvas) {
          pageData.push({ pdfCanvas, annotCanvas, height: pdfCanvas.height });
          totalHeight += pdfCanvas.height;
          maxWidth = Math.max(maxWidth, pdfCanvas.width);
        }
      }

      combinedCanvas.width = maxWidth;
      combinedCanvas.height = totalHeight;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);

      let yOffset = 0;
      for (const { pdfCanvas, annotCanvas, height } of pageData) {
        ctx.drawImage(pdfCanvas, 0, yOffset);
        ctx.drawImage(annotCanvas, 0, yOffset);
        yOffset += height;
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        combinedCanvas.toBlob((blob) => {
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

  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl max-h-[95vh] w-full mx-4 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 shrink-0">
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
        <div className="flex flex-1 overflow-hidden">
          {/* Tool Sidebar */}
          <div className="w-48 bg-gray-100 border-r p-4 flex flex-col gap-4 shrink-0 overflow-y-auto">
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
              <h4 className="font-medium mb-2">Zoom</h4>
              <div className="flex gap-2">
                <Button onClick={zoomOut} variant="outline" className="flex-1">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button onClick={zoomIn} variant="outline" className="flex-1">
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center text-sm text-gray-600 mt-1">
                {Math.round(scale * 100)}%
              </div>
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

          {/* PDF Viewer with annotations */}
          <div 
            ref={containerRef}
            className="flex-1 overflow-auto bg-gray-300 p-4"
          >
            {pdfError ? (
              <div className="flex items-center justify-center h-full">
                <div className="bg-white p-6 rounded-lg shadow text-center">
                  <div className="text-red-600 text-lg font-medium mb-2">Error Loading PDF</div>
                  <div className="text-gray-600">{pdfError}</div>
                </div>
              </div>
            ) : !pdfLoaded ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <div className="text-gray-600">Loading PDF...</div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                  <div 
                    key={pageNum} 
                    className="relative bg-white shadow-lg"
                    style={{ 
                      cursor: activeTool === 'text' ? 'text' : 
                              activeTool === 'eraser' ? 'grab' : 
                              activeTool === 'pen' || activeTool === 'highlight' ? 'crosshair' : 
                              'default' 
                    }}
                  >
                    {/* PDF Page Canvas */}
                    <canvas
                      ref={(el) => {
                        if (el) pageCanvasRefs.current.set(pageNum, el);
                      }}
                      className="block"
                    />
                    {/* Annotation Canvas Overlay */}
                    <canvas
                      ref={(el) => {
                        if (el) annotationCanvasRefs.current.set(pageNum, el);
                      }}
                      className="absolute top-0 left-0"
                      style={{
                        pointerEvents: activeTool ? 'auto' : 'none',
                        touchAction: activeTool ? 'none' : 'auto'
                      }}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                    {/* Page number */}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      Page {pageNum} of {numPages}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 border-t bg-gray-50 text-sm shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <strong>Instructions:</strong> Select "Navigate PDF" to scroll and read, then choose a tool to annotate. Click "Save Work" when finished.
              {hasAnnotations && <span className="ml-2 text-green-600 font-medium">({strokes.length} strokes, {texts.length} text annotations)</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
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

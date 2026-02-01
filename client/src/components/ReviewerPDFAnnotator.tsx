import { useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Save, 
  X, 
  Check, 
  XCircle, 
  MessageSquare, 
  Move, 
  ZoomIn, 
  ZoomOut, 
  Trash2,
  Eye,
  Pen,
  RotateCcw
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import * as fabricModule from 'fabric';
const { fabric } = fabricModule as any;

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface ReviewerAnnotation {
  id: string;
  type: 'tick' | 'cross' | 'comment' | 'freehand';
  x: number;
  y: number;
  pageNum: number;
  text?: string;
  color?: string;
  fabricJSON?: any;
}

interface ReviewerPDFAnnotatorProps {
  pdfUrl: string;
  submissionId: string;
  existingAnnotations?: string;
  isViewOnly?: boolean;
  onSave: (annotations: string) => Promise<void>;
  onClose: () => void;
  studentName?: string;
  assignmentTitle?: string;
}

type Tool = 'tick' | 'cross' | 'comment' | 'freehand' | null;

function ReviewerPDFAnnotatorContent({ 
  pdfUrl, 
  submissionId, 
  existingAnnotations,
  isViewOnly = false,
  onSave, 
  onClose,
  studentName,
  assignmentTitle
}: ReviewerPDFAnnotatorProps) {
  const [activeTool, setActiveTool] = useState<Tool>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [annotations, setAnnotations] = useState<ReviewerAnnotation[]>([]);
  const [commentText, setCommentText] = useState('');
  const [pendingCommentPosition, setPendingCommentPosition] = useState<{x: number, y: number, pageNum: number} | null>(null);
  
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const pageCanvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const fabricCanvasRefs = useRef<Map<number, fabric.Canvas>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    if (existingAnnotations) {
      try {
        const parsed = JSON.parse(existingAnnotations);
        setAnnotations(parsed);
      } catch (e) {
        console.error('Failed to parse existing annotations:', e);
      }
    }
  }, [existingAnnotations]);

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
      const pdfCanvas = pageCanvasRefs.current.get(pageNum);

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

        let fabricCanvas = fabricCanvasRefs.current.get(pageNum);
        if (!fabricCanvas) {
          fabricCanvas = new fabric.Canvas(null, {
            width: viewport.width,
            height: viewport.height,
            isDrawingMode: false,
            preserveObjectStacking: true,
            selection: !isViewOnly,
            allowTouchScrolling: false,
            enablePointerEvents: true
          });
          fabricCanvasRefs.current.set(pageNum, fabricCanvas);
        } else {
          fabricCanvas.setWidth(viewport.width);
          fabricCanvas.setHeight(viewport.height);
        }
      }
    } catch (error) {
      console.error(`Error rendering page ${pageNum}:`, error);
    }
  }, [scale, isViewOnly]);

  useEffect(() => {
    if (!pdfLoaded || !pdfDocRef.current) return;
    (async () => {
      for (let i = 1; i <= numPages; i++) {
        await renderPDFPage(i);
      }
      renderAnnotationsOnCanvas();
    })();
  }, [pdfLoaded, numPages, scale, renderPDFPage]);

  useEffect(() => {
    for (const [pageNum, fabricCanvas] of Array.from(fabricCanvasRefs.current.entries())) {
      if (isViewOnly) {
        fabricCanvas.isDrawingMode = false;
        fabricCanvas.selection = false;
      } else if (activeTool === 'freehand') {
        fabricCanvas.isDrawingMode = true;
        fabricCanvas.freeDrawingBrush.color = '#FF0000';
        fabricCanvas.freeDrawingBrush.width = 2;
      } else {
        fabricCanvas.isDrawingMode = false;
      }
    }
  }, [activeTool, isViewOnly]);

  const renderAnnotationsOnCanvas = () => {
    for (const [pageNum, fabricCanvas] of Array.from(fabricCanvasRefs.current.entries())) {
      fabricCanvas.clear();
      
      const pageAnnotations = annotations.filter(a => a.pageNum === pageNum);
      for (const annotation of pageAnnotations) {
        if (annotation.type === 'tick') {
          const tick = new fabric.Text('✓', {
            left: annotation.x,
            top: annotation.y,
            fontSize: 32,
            fill: '#22c55e',
            fontWeight: 'bold',
            selectable: !isViewOnly,
            evented: !isViewOnly,
            data: { annotationId: annotation.id }
          });
          fabricCanvas.add(tick);
        } else if (annotation.type === 'cross') {
          const cross = new fabric.Text('✗', {
            left: annotation.x,
            top: annotation.y,
            fontSize: 32,
            fill: '#ef4444',
            fontWeight: 'bold',
            selectable: !isViewOnly,
            evented: !isViewOnly,
            data: { annotationId: annotation.id }
          });
          fabricCanvas.add(cross);
        } else if (annotation.type === 'comment') {
          const group = new fabric.Group([
            new fabric.Rect({
              left: 0,
              top: 0,
              width: Math.max(150, (annotation.text?.length || 10) * 7),
              height: 40,
              fill: '#fef3c7',
              stroke: '#f59e0b',
              strokeWidth: 2,
              rx: 4,
              ry: 4
            }),
            new fabric.Text(annotation.text || '', {
              left: 8,
              top: 10,
              fontSize: 12,
              fill: '#000000',
              fontFamily: 'Arial'
            })
          ], {
            left: annotation.x,
            top: annotation.y,
            selectable: !isViewOnly,
            evented: !isViewOnly,
            data: { annotationId: annotation.id }
          });
          fabricCanvas.add(group);
        } else if (annotation.type === 'freehand' && annotation.fabricJSON) {
          fabricCanvas.loadFromJSON(annotation.fabricJSON, () => {
            fabricCanvas.renderAll();
          });
        }
      }
      fabricCanvas.renderAll();
    }
  };

  useEffect(() => {
    renderAnnotationsOnCanvas();
  }, [annotations, isViewOnly]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, pageNum: number) => {
    if (isViewOnly || !activeTool) return;

    const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
    let x: number, y: number;
    
    if ('touches' in e) {
      e.preventDefault();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    if (activeTool === 'tick') {
      const newAnnotation: ReviewerAnnotation = {
        id: `tick-${Date.now()}`,
        type: 'tick',
        x,
        y,
        pageNum
      };
      setAnnotations(prev => [...prev, newAnnotation]);
    } else if (activeTool === 'cross') {
      const newAnnotation: ReviewerAnnotation = {
        id: `cross-${Date.now()}`,
        type: 'cross',
        x,
        y,
        pageNum
      };
      setAnnotations(prev => [...prev, newAnnotation]);
    } else if (activeTool === 'comment') {
      setPendingCommentPosition({ x, y, pageNum });
    }
  };

  const handleAddComment = () => {
    if (!pendingCommentPosition || !commentText.trim()) return;

    const newAnnotation: ReviewerAnnotation = {
      id: `comment-${Date.now()}`,
      type: 'comment',
      x: pendingCommentPosition.x,
      y: pendingCommentPosition.y,
      pageNum: pendingCommentPosition.pageNum,
      text: commentText.trim()
    };
    setAnnotations(prev => [...prev, newAnnotation]);
    setCommentText('');
    setPendingCommentPosition(null);
  };

  const handleDeleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
  };

  const clearAllAnnotations = () => {
    setAnnotations([]);
    for (const fabricCanvas of fabricCanvasRefs.current.values()) {
      fabricCanvas.clear();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const annotationsJson = JSON.stringify(annotations);
      await onSave(annotationsJson);
      toast({
        title: "Annotations Saved",
        description: "Your review annotations have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving annotations:', error);
      toast({
        title: "Error",
        description: "Failed to save annotations.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl max-h-[95vh] w-full mx-4 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-black">
              {isViewOnly ? 'View Submission' : 'Review & Annotate'}
            </h2>
            {studentName && <p className="text-sm text-gray-600">Student: {studentName}</p>}
            {assignmentTitle && <p className="text-sm text-gray-600">Assignment: {assignmentTitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {!isViewOnly && (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Annotations'}
              </Button>
            )}
            <Button onClick={onClose} variant="ghost">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-56 bg-gray-100 border-r p-4 flex flex-col gap-4 shrink-0 overflow-y-auto">
            {isViewOnly ? (
              <div className="text-center py-4">
                <Eye className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                <p className="text-sm text-gray-600">View Only Mode</p>
                <p className="text-xs text-gray-500 mt-1">This submission has been graded</p>
              </div>
            ) : (
              <>
                <div>
                  <h4 className="font-medium mb-2">Mode</h4>
                  <Button
                    onClick={() => setActiveTool(null)}
                    className={`w-full justify-start ${activeTool === null ? 'bg-black text-white' : 'bg-white'}`}
                  >
                    <Move className="h-4 w-4 mr-2" />
                    Navigate
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Marking Tools</h4>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => setActiveTool('tick')} 
                      className={`w-full justify-start ${activeTool === 'tick' ? 'bg-green-600 text-white' : 'bg-white'}`}
                    >
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                      Tick (Correct)
                    </Button>
                    <Button 
                      onClick={() => setActiveTool('cross')} 
                      className={`w-full justify-start ${activeTool === 'cross' ? 'bg-red-600 text-white' : 'bg-white'}`}
                    >
                      <XCircle className="h-4 w-4 mr-2 text-red-600" />
                      Cross (Wrong)
                    </Button>
                    <Button 
                      onClick={() => setActiveTool('comment')} 
                      className={`w-full justify-start ${activeTool === 'comment' ? 'bg-amber-600 text-white' : 'bg-white'}`}
                    >
                      <MessageSquare className="h-4 w-4 mr-2 text-amber-600" />
                      Comment
                    </Button>
                    <Button 
                      onClick={() => setActiveTool('freehand')} 
                      className={`w-full justify-start ${activeTool === 'freehand' ? 'bg-blue-600 text-white' : 'bg-white'}`}
                    >
                      <Pen className="h-4 w-4 mr-2 text-blue-600" />
                      Freehand
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Zoom</h4>
                  <div className="flex gap-2">
                    <Button onClick={() => setScale(prev => Math.max(prev - 0.25, 0.5))} variant="outline" className="flex-1">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => setScale(prev => Math.min(prev + 0.25, 3))} variant="outline" className="flex-1">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-center text-sm mt-1">{Math.round(scale * 100)}%</div>
                </div>

                <div>
                  <Button onClick={clearAllAnnotations} className="w-full justify-start" variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Annotations ({annotations.length})</h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {annotations.map((a) => (
                      <div key={a.id} className="flex items-center justify-between text-xs bg-white p-1 rounded">
                        <span className="flex items-center">
                          {a.type === 'tick' && <Check className="h-3 w-3 text-green-600 mr-1" />}
                          {a.type === 'cross' && <XCircle className="h-3 w-3 text-red-600 mr-1" />}
                          {a.type === 'comment' && <MessageSquare className="h-3 w-3 text-amber-600 mr-1" />}
                          {a.type === 'freehand' && <Pen className="h-3 w-3 text-blue-600 mr-1" />}
                          <span className="truncate max-w-20">{a.type === 'comment' ? a.text : `Page ${a.pageNum}`}</span>
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-5 w-5 p-0"
                          onClick={() => handleDeleteAnnotation(a.id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {!isViewOnly && (
              <div>
                <h4 className="font-medium mb-2">Zoom</h4>
                <div className="flex gap-2">
                  <Button onClick={() => setScale(prev => Math.max(prev - 0.25, 0.5))} variant="outline" className="flex-1">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => setScale(prev => Math.min(prev + 0.25, 3))} variant="outline" className="flex-1">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-center text-sm mt-1">{Math.round(scale * 100)}%</div>
              </div>
            )}
          </div>

          <div ref={containerRef} className="flex-1 overflow-auto bg-gray-300 p-4">
            {pdfError ? (
              <div className="flex items-center justify-center h-full">
                <div className="bg-white p-6 rounded text-center">
                  <div className="text-red-600 font-medium">Error Loading PDF</div>
                </div>
              </div>
            ) : !pdfLoaded ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <div>Loading...</div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                {Array.from({ length: numPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <div key={pageNum} className="relative bg-white shadow-lg">
                      <canvas
                        ref={(el) => {
                          if (el) pageCanvasRefs.current.set(pageNum, el);
                        }}
                        className="block"
                      />
                      <canvas
                        ref={(el) => {
                          if (el) fabricCanvasRefs.current.get(pageNum)?.setElement?.(el);
                        }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          cursor: isViewOnly ? 'default' : 
                            activeTool === 'tick' ? 'crosshair' : 
                            activeTool === 'cross' ? 'crosshair' : 
                            activeTool === 'comment' ? 'text' :
                            activeTool === 'freehand' ? 'crosshair' : 'default',
                          touchAction: activeTool ? 'none' : 'auto'
                        }}
                        onMouseDown={(e) => handleCanvasClick(e, pageNum)}
                        onTouchStart={(e) => handleCanvasClick(e, pageNum)}
                      />
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1">
                        Page {pageNum}/{numPages}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {pendingCommentPosition && (
          <div className="p-4 border-t bg-amber-50">
            <Label className="text-sm font-medium">Add Comment (Page {pendingCommentPosition.pageNum})</Label>
            <div className="flex gap-2 mt-2">
              <Textarea 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Enter your comment..."
                className="flex-1"
                rows={2}
              />
              <div className="flex flex-col gap-2">
                <Button onClick={handleAddComment} disabled={!commentText.trim()} className="bg-amber-600 hover:bg-amber-700">
                  Add
                </Button>
                <Button onClick={() => setPendingCommentPosition(null)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border-t bg-gray-50 text-sm shrink-0">
          <strong>Instructions:</strong> {isViewOnly 
            ? 'This submission has been graded. You can view the annotations but cannot make changes.'
            : 'Click on the document to add ticks (✓), crosses (✗), or comments. Use freehand for custom marks.'}
        </div>
      </div>
    </div>
  );
}

export function ReviewerPDFAnnotator(props: ReviewerPDFAnnotatorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <ReviewerPDFAnnotatorContent {...props} />,
    document.body
  );
}

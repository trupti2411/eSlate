import { useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Save, X, Pen, Highlighter, Eraser, Type, RotateCcw, Download, Send, Move, ZoomIn, ZoomOut } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import * as fabricModule from 'fabric';
const { fabric } = fabricModule as any;

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PDFAnnotatorProps {
  pdfUrl: string;
  assignmentId: string;
  onSave: (annotatedFileUrl: string) => Promise<void>;
  onClose: () => void;
  isSubmitted?: boolean;
  documentUrl?: string;
}

type Tool = 'pen' | 'eraser' | 'text' | 'highlight' | null;

const strokeStore: Map<string, any> = new Map();

function PDFAnnotatorContent({ pdfUrl, assignmentId, onSave, onClose, isSubmitted = false, documentUrl }: PDFAnnotatorProps) {
  const [activeTool, setActiveTool] = useState<Tool>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  
  const storeKey = `${assignmentId}-${documentUrl || pdfUrl}`;
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const pageCanvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const fabricCanvasRefs = useRef<Map<number, fabric.Canvas>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

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
        setPdfError('Failed to load PDF.');
      }
    };
    loadPDF();
    return () => {
      if (pdfDocRef.current) pdfDocRef.current.destroy();
    };
  }, [pdfUrl]);

  // Render PDF page
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

        // Initialize or update Fabric canvas
        let fabricCanvas = fabricCanvasRefs.current.get(pageNum);
        if (!fabricCanvas) {
          fabricCanvas = new fabric.Canvas(null, {
            width: viewport.width,
            height: viewport.height,
            isDrawingMode: false,
            preserveObjectStacking: true,
            allowTouchScrolling: false,
            enablePointerEvents: true
          });
          fabricCanvasRefs.current.set(pageNum, fabricCanvas);
        } else {
          fabricCanvas.setWidth(viewport.width);
          fabricCanvas.setHeight(viewport.height);
        }

        // Restore saved objects if they exist
        const saved = strokeStore.get(storeKey);
        if (saved && saved[pageNum]) {
          fabricCanvas.loadFromJSON(saved[pageNum], () => {
            fabricCanvas.renderAll();
          });
        }
      }
    } catch (error) {
      console.error(`Error rendering page ${pageNum}:`, error);
    }
  }, [scale, storeKey]);

  // Render all pages when PDF loads or scale changes
  useEffect(() => {
    if (!pdfLoaded || !pdfDocRef.current) return;
    (async () => {
      for (let i = 1; i <= numPages; i++) {
        await renderPDFPage(i);
      }
    })();
  }, [pdfLoaded, numPages, scale, renderPDFPage]);

  // Setup drawing on Fabric canvas
  useEffect(() => {
    for (const [pageNum, fabricCanvas] of Array.from(fabricCanvasRefs.current.entries())) {
      if (activeTool === 'text') {
        fabricCanvas.isDrawingMode = false;
      } else if (activeTool) {
        fabricCanvas.isDrawingMode = true;
        fabricCanvas.freeDrawingBrush.color = 
          activeTool === 'highlight' ? 'rgba(255, 255, 0, 0.5)' : '#000000';
        fabricCanvas.freeDrawingBrush.width = activeTool === 'highlight' ? 20 : 3;
      } else {
        fabricCanvas.isDrawingMode = false;
      }
    }
  }, [activeTool]);

  // Add text on click or touch
  const addText = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, pageNum: number) => {
    if (activeTool !== 'text') return;

    const text = prompt('Enter text:');
    if (!text) return;

    const fabricCanvas = fabricCanvasRefs.current.get(pageNum);
    if (!fabricCanvas) return;

    const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
    let x: number, y: number;
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    const fabricText = new fabric.Text(text, {
      left: x,
      top: y,
      fontSize: 20,
      fill: '#000000',
      fontFamily: 'Arial'
    });

    fabricCanvas.add(fabricText);
    fabricCanvas.renderAll();
  };

  const clearCanvas = () => {
    for (const fabricCanvas of fabricCanvasRefs.current.values()) {
      fabricCanvas.clear();
    }
    strokeStore.delete(storeKey);
  };

  const handleDownload = async () => {
    if (!pdfDocRef.current) return;
    
    const combinedCanvas = document.createElement('canvas');
    const ctx = combinedCanvas.getContext('2d');
    if (!ctx) return;

    let totalHeight = 0;
    let maxWidth = 0;
    const pageData: { pdfCanvas: HTMLCanvasElement; fabricCanvas: fabric.Canvas }[] = [];

    for (let i = 1; i <= numPages; i++) {
      const pdfCanvas = pageCanvasRefs.current.get(i);
      const fabricCanvas = fabricCanvasRefs.current.get(i);
      if (pdfCanvas && fabricCanvas) {
        pageData.push({ pdfCanvas, fabricCanvas });
        totalHeight += pdfCanvas.height;
        maxWidth = Math.max(maxWidth, pdfCanvas.width);
      }
    }

    if (maxWidth === 0 || totalHeight === 0) return;
    
    combinedCanvas.width = maxWidth;
    combinedCanvas.height = totalHeight;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);

    let yOffset = 0;
    const pageDataArray = Array.from(pageData);
    for (const { pdfCanvas, fabricCanvas } of pageDataArray) {
      ctx.drawImage(pdfCanvas, 0, yOffset);
      const fabricElement = fabricCanvas.getElement() as HTMLCanvasElement;
      if (fabricElement) {
        ctx.drawImage(fabricElement, 0, yOffset);
      }
      yOffset += pdfCanvas.height;
    }

    const link = document.createElement('a');
    link.download = `annotated-assignment-${assignmentId}.png`;
    link.href = combinedCanvas.toDataURL('image/png');
    link.click();
  };

  const hasAnnotations = fabricCanvasRefs.current.size > 0 && 
    Array.from(fabricCanvasRefs.current.values()).some(c => c.getObjects().length > 0);

  const handleSaveAndSubmit = async (submitAfterSave: boolean = false) => {
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

      const combinedCanvas = document.createElement('canvas');
      const ctx = combinedCanvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      let totalHeight = 0;
      let maxWidth = 0;
      const pageData: { pdfCanvas: HTMLCanvasElement; fabricCanvas: any }[] = [];

      for (let i = 1; i <= numPages; i++) {
        const pdfCanvas = pageCanvasRefs.current.get(i);
        const fabricCanvas = fabricCanvasRefs.current.get(i);
        if (pdfCanvas && fabricCanvas) {
          pageData.push({ pdfCanvas, fabricCanvas });
          totalHeight += pdfCanvas.height;
          maxWidth = Math.max(maxWidth, pdfCanvas.width);
        }
      }

      if (maxWidth === 0 || totalHeight === 0) throw new Error('No pages to save');
      
      combinedCanvas.width = maxWidth;
      combinedCanvas.height = totalHeight;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);

      let yOffset = 0;
      const pageDataArray = Array.from(pageData);
      for (const { pdfCanvas, fabricCanvas } of pageDataArray) {
        ctx.drawImage(pdfCanvas, 0, yOffset);
        const fabricElement = fabricCanvas.getElement() as HTMLCanvasElement;
        if (fabricElement) {
          ctx.drawImage(fabricElement, 0, yOffset);
        }
        yOffset += pdfCanvas.height;
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

      if (!uploadResponse.ok) throw new Error('Failed to get upload URL');

      const uploadData = await uploadResponse.json();
      
      const putResponse = await fetch(uploadData.uploadURL, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': 'image/png' }
      });

      if (!putResponse.ok) throw new Error('Failed to upload file');

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
          : "Your annotations have been saved.",
      });

      if (isSubmittingNow) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving annotations:', error);
      toast({
        title: "Error",
        description: "Failed to save annotations.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      if (isSubmittingNow) setIsSubmitting(false);
    }
  };

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
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving && !isSubmitting ? 'Saving...' : 'Save Work'}
                </Button>
                <Button
                  onClick={() => handleSaveAndSubmit(true)}
                  disabled={isSaving || isSubmitting || !hasAnnotations}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                </Button>
              </>
            )}
            <Button onClick={onClose} variant="ghost">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Main */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 bg-gray-100 border-r p-4 flex flex-col gap-4 shrink-0 overflow-y-auto">
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
              <h4 className="font-medium mb-2">Draw</h4>
              <div className="space-y-2">
                <Button onClick={() => setActiveTool('pen')} className={`w-full justify-start ${activeTool === 'pen' ? 'bg-black text-white' : 'bg-white'}`}>
                  <Pen className="h-4 w-4 mr-2" />
                  Pen
                </Button>
                <Button onClick={() => setActiveTool('highlight')} className={`w-full justify-start ${activeTool === 'highlight' ? 'bg-black text-white' : 'bg-white'}`}>
                  <Highlighter className="h-4 w-4 mr-2" />
                  Highlight
                </Button>
              </div>
            </div>

            <div>
              <Button onClick={() => setActiveTool('text')} className={`w-full justify-start ${activeTool === 'text' ? 'bg-black text-white' : 'bg-white'}`}>
                <Type className="h-4 w-4 mr-2" />
                Text
              </Button>
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

            <div className="space-y-2">
              <Button onClick={clearCanvas} className="w-full justify-start" variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button onClick={handleDownload} className="w-full justify-start" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          {/* PDF */}
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
                          cursor: activeTool === 'text' ? 'text' : activeTool === 'pen' || activeTool === 'highlight' ? 'crosshair' : 'default',
                          touchAction: activeTool ? 'none' : 'auto',
                          pointerEvents: activeTool ? 'auto' : 'none'
                        }}
                        onMouseDown={(e) => activeTool === 'text' && addText(e, pageNum)}
                        onTouchStart={(e) => activeTool === 'text' && addText(e, pageNum)}
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

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 text-sm shrink-0">
          <strong>Instructions:</strong> Select "Navigate" to scroll, then choose a tool to annotate.
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

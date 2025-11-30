import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Save, X, Pen, Highlighter, Eraser, Type, RotateCcw, Download, Send } from 'lucide-react';

interface PDFAnnotatorProps {
  pdfUrl: string;
  assignmentId: string;
  onSave: (annotatedFileUrl: string) => Promise<void>;
  onClose: () => void;
  isSubmitted?: boolean;
  documentUrl?: string;
}

type Tool = 'pen' | 'eraser' | 'text' | 'highlight';

function PDFAnnotatorComponent({ pdfUrl, assignmentId, onSave, onClose, isSubmitted = false, documentUrl }: PDFAnnotatorProps) {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [hasAnnotations, setHasAnnotations] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfViewerRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasImageRef = useRef<ImageData | null>(null); // Store canvas drawing state
  
  const { toast } = useToast();

  // Initialize canvas and restore previous drawing if it exists
  const initializeCanvas = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas size to container
    const container = containerRef.current;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Configure context for high-quality drawing
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 1.0;
    
    // Restore previous annotations if they exist
    if (canvasImageRef.current) {
      try {
        ctx.putImageData(canvasImageRef.current, 0, 0);
      } catch (e) {
        // Canvas size might have changed, can't restore
        canvasImageRef.current = null;
      }
    }
  }, []);

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'text') {
      addTextAtPosition(e);
      return;
    }
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Configure brush for current tool
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
  };

  const saveCanvasState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    try {
      // Save current canvas drawing state
      canvasImageRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } catch (e) {
      // Silently fail if we can't save state
    }
  }, []);

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasAnnotations(true);
    
    // Save canvas state after each draw
    saveCanvasState();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const addTextAtPosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const text = prompt('Enter text:');
    if (!text) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = 'source-over';
    ctx.font = '18px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText(text, x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `annotated-assignment-${assignmentId}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  // Save and Submit annotated work
  const handleSaveAndSubmit = async (submitAfterSave: boolean = false) => {
    if (!canvasRef.current || isSaving || isSubmitting) return;

    const isSubmittingNow = isSaving ? false : submitAfterSave;
    if (isSubmittingNow) setIsSubmitting(true);
    setIsSaving(true);
    console.log('Starting save process...');
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Check if canvas has any annotations
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      let hasContent = false;
      if (imageData) {
        const data = imageData.data;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] !== 0) { // Alpha channel not zero
            hasContent = true;
            break;
          }
        }
      }

      if (!hasContent) {
        toast({
          title: "No Annotations",
          description: "Please add some annotations before saving.",
          variant: "destructive",
        });
        setIsSaving(false);
        if (isSubmittingNow) setIsSubmitting(false);
        return;
      }

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        }, 'image/png', 1.0);
      });

      console.log('Canvas blob created:', blob.size, 'bytes');

      // Create a File from the blob
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const file = new File([blob], `annotated-assignment-${assignmentId}-${timestamp}.png`, { 
        type: 'image/png' 
      });

      // Upload using FormData
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading file:', file.name);
      
      const response = await fetch('/api/objects/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      
      if (!result.uploadURL) {
        throw new Error('No upload URL received');
      }

      // Clean URL and call onSave
      const cleanUrl = result.uploadURL.replace(/\?.*$/, '');
      console.log('Calling onSave with URL:', cleanUrl);
      
      await onSave(cleanUrl);

      toast({
        title: submitAfterSave ? "Assignment Submitted" : "Assignment Saved",
        description: submitAfterSave 
          ? "Your annotated assignment has been submitted successfully." 
          : "Your annotated assignment has been saved. Click Submit when ready.",
      });

      if (submitAfterSave) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Failed to save",
        description: `There was an error saving your annotated assignment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      if (isSubmittingNow) setIsSubmitting(false);
    }
  };

  // Handle tool change
  const handleToolChange = (tool: Tool) => {
    setActiveTool(tool);
    console.log('Tool changed to:', tool);
  };

  // Initialize canvas on load
  useEffect(() => {
    initializeCanvas();
  }, [initializeCanvas]);

  // Handle window resize - but preserve annotations
  useEffect(() => {
    const handleResize = () => {
      // Save canvas before resize
      saveCanvasState();
      setTimeout(() => {
        initializeCanvas();
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initializeCanvas, saveCanvasState]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">PDF Annotation</h2>
          <div className="flex gap-2">
            <Button
              onClick={() => handleSaveAndSubmit(false)}
              disabled={isSaving || isSubmitting || isSubmitted}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-save-work"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Work'}
            </Button>
            <Button
              onClick={() => handleSaveAndSubmit(true)}
              disabled={isSaving || isSubmitting || isSubmitted}
              className="bg-green-600 hover:bg-green-700 text-white"
              data-testid="button-submit-assignment"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting || isSaving ? 'Submitting...' : 'Submit Assignment'}
            </Button>
            <Button 
              onClick={onClose} 
              variant="outline"
              disabled={isSaving || isSubmitting}
              data-testid="button-close-annotator"
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>

        <div className="flex h-[75vh]">
          {/* Toolbar */}
          <div className="w-64 bg-gray-50 p-4 border-r overflow-y-auto">
            <div className="space-y-4">
              {/* Mode Selection */}
              <div>
                <h4 className="font-medium mb-2">Mode</h4>
                <Button
                  onClick={() => setActiveTool(null)}
                  className={`w-full justify-start ${activeTool === null ? 'bg-black text-white' : 'bg-white'}`}
                >
                  📄 Navigate PDF
                </Button>
              </div>

              {/* Drawing Tools */}
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
                  <Button
                    onClick={() => handleToolChange('eraser')}
                    className={`w-full justify-start ${activeTool === 'eraser' ? 'bg-black text-white' : 'bg-white'}`}
                  >
                    <Eraser className="h-4 w-4 mr-2" />
                    Eraser
                  </Button>
                </div>
              </div>

              {/* Text Tool */}
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

              {/* Actions */}
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
              
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0"
                style={{
                  cursor: activeTool === 'text' ? 'text' : activeTool === 'eraser' ? 'grab' : activeTool === 'pen' || activeTool === 'highlight' ? 'crosshair' : 'default',
                  pointerEvents: activeTool ? 'auto' : 'none',
                  zIndex: activeTool ? 10 : 1
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 border-t bg-gray-50 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <strong>Instructions:</strong> Select "Navigate PDF" to scroll and read, then choose a tool to annotate. Click "Save Work" when finished.
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
  );
}

// Wrap in React.memo to prevent unnecessary re-renders that clear the canvas
export const PDFAnnotator = React.memo(PDFAnnotatorComponent);
import { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import * as fabricModule from 'fabric';
const { fabric } = fabricModule as any;

interface AnnotationMark {
  id: string;
  type: 'tick' | 'cross' | 'comment' | 'freehand';
  x: number;
  y: number;
  text?: string;
  fabricJSON?: any;
}

interface SubmissionAnnotatorProps {
  imageUrl: string;
  submissionId: string;
  studentName?: string;
  assignmentTitle?: string;
  existingAnnotations?: string | null;
  onClose: () => void;
  onSaved?: () => void;
}

type Tool = 'tick' | 'cross' | 'comment' | 'freehand' | 'select';

export function SubmissionAnnotator({
  imageUrl,
  submissionId,
  studentName,
  assignmentTitle,
  existingAnnotations,
  onClose,
  onSaved,
}: SubmissionAnnotatorProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [isSaving, setIsSaving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [pendingComment, setPendingComment] = useState<{ x: number; y: number } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 });

  const activeToolRef = useRef<Tool>('select');
  activeToolRef.current = activeTool;

  const initCanvas = useCallback((w: number, h: number) => {
    if (!canvasRef.current) return;
    if (fabricRef.current) {
      fabricRef.current.dispose();
      fabricRef.current = null;
    }
    const fc = new fabric.Canvas(canvasRef.current, {
      width: w,
      height: h,
      selection: true,
      isDrawingMode: false,
    });
    fabricRef.current = fc;

    fc.on('mouse:down', (opt: any) => {
      const tool = activeToolRef.current;
      if (tool === 'select' || tool === 'freehand') return;
      if (tool === 'comment') return;

      const pointer = fc.getPointer(opt.e);
      if (tool === 'tick') {
        const t = new fabric.Text('✓', {
          left: pointer.x - 12,
          top: pointer.y - 12,
          fontSize: 28,
          fill: '#16a34a',
          selectable: true,
          hasControls: false,
          fontWeight: 'bold',
        });
        fc.add(t);
        fc.renderAll();
      } else if (tool === 'cross') {
        const t = new fabric.Text('✗', {
          left: pointer.x - 12,
          top: pointer.y - 12,
          fontSize: 28,
          fill: '#dc2626',
          selectable: true,
          hasControls: false,
          fontWeight: 'bold',
        });
        fc.add(t);
        fc.renderAll();
      }
    });

    if (existingAnnotations) {
      try {
        const parsed = JSON.parse(existingAnnotations);
        if (parsed && parsed.fabricJSON) {
          fc.loadFromJSON(parsed.fabricJSON, () => {
            fc.renderAll();
          });
        }
      } catch {}
    }
  }, [existingAnnotations]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const maxW = Math.min(window.innerWidth - 280, 1200);
      const maxH = window.innerHeight - 120;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > maxW) { h = (h * maxW) / w; w = maxW; }
      if (h > maxH) { w = (w * maxH) / h; h = maxH; }
      w = Math.round(w);
      h = Math.round(h);
      setCanvasSize({ w, h });
      setImageLoaded(true);

      setTimeout(() => {
        initCanvas(w, h);
        if (!fabricRef.current) return;
        fabric.Image.fromURL(img.src, (fImg: any) => {
          fImg.scaleToWidth(w);
          fImg.scaleToHeight(h);
          fabricRef.current.setBackgroundImage(fImg, fabricRef.current.renderAll.bind(fabricRef.current));
        }, { crossOrigin: 'anonymous' });
      }, 50);
    };
    img.onerror = () => {
      setImageLoaded(true);
      setTimeout(() => initCanvas(800, 600), 50);
    };
    img.src = imageUrl;
    return () => { if (fabricRef.current) { fabricRef.current.dispose(); fabricRef.current = null; } };
  }, [imageUrl]);

  useEffect(() => {
    if (!fabricRef.current) return;
    const fc = fabricRef.current;
    if (activeTool === 'freehand') {
      fc.isDrawingMode = true;
      fc.freeDrawingBrush.color = '#2563eb';
      fc.freeDrawingBrush.width = 3;
    } else {
      fc.isDrawingMode = false;
    }
    fc.selection = activeTool === 'select';
  }, [activeTool]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'comment') return;
    const rect = e.currentTarget.getBoundingClientRect();
    setPendingComment({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleAddComment = () => {
    if (!pendingComment || !commentText.trim() || !fabricRef.current) return;
    const bg = new fabric.Rect({
      left: pendingComment.x - 4,
      top: pendingComment.y - 16,
      width: Math.max(commentText.length * 8, 60),
      height: 22,
      fill: '#fef08a',
      stroke: '#ca8a04',
      strokeWidth: 1,
      rx: 4,
      ry: 4,
      selectable: true,
      hasControls: false,
    });
    const label = new fabric.Text(commentText.trim(), {
      left: pendingComment.x,
      top: pendingComment.y - 14,
      fontSize: 13,
      fill: '#713f12',
      selectable: true,
      hasControls: false,
    });
    fabricRef.current.add(bg, label);
    fabricRef.current.renderAll();
    setCommentText('');
    setPendingComment(null);
  };

  const handleUndo = () => {
    if (!fabricRef.current) return;
    const objects = fabricRef.current.getObjects();
    if (objects.length > 0) {
      fabricRef.current.remove(objects[objects.length - 1]);
      fabricRef.current.renderAll();
    }
  };

  const handleClear = () => {
    if (!fabricRef.current) return;
    fabricRef.current.getObjects().forEach((o: any) => fabricRef.current.remove(o));
    fabricRef.current.renderAll();
  };

  const handleSave = async () => {
    if (!fabricRef.current) return;
    setIsSaving(true);
    try {
      const fabricJSON = fabricRef.current.toJSON();
      const payload = JSON.stringify({ fabricJSON });
      await apiRequest(`/api/submissions/${submissionId}/reviewer-annotations`, 'PATCH', {
        reviewerAnnotations: payload,
      });
      toast({ title: 'Annotations saved', description: 'Your marks have been saved to this submission.' });
      onSaved?.();
    } catch {
      toast({ title: 'Save failed', description: 'Could not save annotations. Try again.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const tools: { key: Tool; label: string; icon: string; color: string; active: string }[] = [
    { key: 'select', label: 'Select', icon: '↖', color: 'text-gray-700', active: 'bg-gray-200' },
    { key: 'tick', label: 'Tick ✓', icon: '✓', color: 'text-green-700', active: 'bg-green-100 border-green-400' },
    { key: 'cross', label: 'Cross ✗', icon: '✗', color: 'text-red-700', active: 'bg-red-100 border-red-400' },
    { key: 'comment', label: 'Comment', icon: '💬', color: 'text-amber-700', active: 'bg-amber-100 border-amber-400' },
    { key: 'freehand', label: 'Draw', icon: '✏️', color: 'text-blue-700', active: 'bg-blue-100 border-blue-400' },
  ];

  const content = (
    <div className="fixed inset-0 z-[9999] bg-black/80 flex">
      {/* Toolbar */}
      <div className="w-56 bg-white border-r flex flex-col gap-3 p-4 flex-shrink-0 overflow-y-auto">
        <div className="mb-1">
          <p className="font-black text-sm text-gray-900 truncate">{studentName || 'Student'}</p>
          <p className="text-xs text-gray-500 truncate">{assignmentTitle || 'Submission'}</p>
        </div>
        <div className="border-t pt-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Tools</p>
          <div className="space-y-1.5">
            {tools.map(t => (
              <button
                key={t.key}
                onClick={() => { setActiveTool(t.key); setPendingComment(null); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                  activeTool === t.key
                    ? `${t.active} border-current`
                    : 'bg-white border-gray-200 hover:border-gray-300'
                } ${t.color}`}
              >
                <span className="text-base w-5 text-center">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {activeTool === 'comment' && (
          <div className="border-t pt-3">
            <p className="text-xs font-bold text-gray-500 mb-2">
              {pendingComment ? 'Type your comment:' : 'Click on the work to place a comment'}
            </p>
            {pendingComment && (
              <>
                <textarea
                  autoFocus
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                  placeholder="Your comment…"
                  className="w-full h-16 text-xs border border-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:border-amber-400"
                />
                <div className="flex gap-2 mt-1.5">
                  <button onClick={handleAddComment} disabled={!commentText.trim()} className="flex-1 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 disabled:opacity-40">Add</button>
                  <button onClick={() => { setPendingComment(null); setCommentText(''); }} className="flex-1 py-1.5 border text-xs font-bold rounded-lg">Cancel</button>
                </div>
              </>
            )}
          </div>
        )}

        <div className="border-t pt-3 space-y-1.5 mt-auto">
          <button onClick={handleUndo} className="w-full py-2 text-xs font-bold border border-gray-200 rounded-xl hover:bg-gray-50">↩ Undo last</button>
          <button onClick={handleClear} className="w-full py-2 text-xs font-bold border border-red-200 text-red-600 rounded-xl hover:bg-red-50">🗑 Clear all</button>
        </div>

        <div className="space-y-1.5">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 disabled:opacity-60 transition-colors"
          >
            {isSaving ? 'Saving…' : '💾 Save marks'}
          </button>
          <button onClick={onClose} className="w-full py-2 text-xs font-bold border border-gray-200 rounded-xl hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 overflow-auto bg-gray-900 flex items-start justify-center p-6">
        <div
          ref={containerRef}
          className="relative shadow-2xl rounded-lg overflow-hidden"
          style={{ width: canvasSize.w, height: canvasSize.h }}
        >
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <p className="text-gray-500 text-sm">Loading…</p>
            </div>
          )}
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            style={{
              cursor:
                activeTool === 'tick' || activeTool === 'cross' ? 'crosshair' :
                activeTool === 'comment' ? 'cell' :
                activeTool === 'freehand' ? 'crosshair' : 'default',
            }}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

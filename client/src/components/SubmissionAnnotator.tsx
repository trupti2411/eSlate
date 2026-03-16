import { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Canvas, FabricImage, FabricText, Rect, PencilBrush } from 'fabric';

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
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [isSaving, setIsSaving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [pendingComment, setPendingComment] = useState<{ x: number; y: number } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 });

  const activeToolRef = useRef<Tool>('select');
  activeToolRef.current = activeTool;

  const setupCanvas = useCallback((fc: Canvas, w: number, h: number, imgSrc: string) => {
    FabricImage.fromURL(imgSrc).then((fImg) => {
      fImg.set({ left: 0, top: 0, scaleX: w / (fImg.width || w), scaleY: h / (fImg.height || h) });
      fc.backgroundImage = fImg;
      fc.renderAll();

      if (existingAnnotations) {
        try {
          const parsed = JSON.parse(existingAnnotations);
          if (parsed?.fabricJSON) {
            fc.loadFromJSON(parsed.fabricJSON).then(() => fc.renderAll());
          }
        } catch {}
      }
    });

    fc.on('mouse:down', (opt) => {
      const tool = activeToolRef.current;
      if (tool === 'select' || tool === 'freehand' || tool === 'comment') return;
      const pointer = fc.getScenePoint(opt.e);
      if (tool === 'tick') {
        const t = new FabricText('✓', {
          left: pointer.x - 12, top: pointer.y - 12,
          fontSize: 32, fill: '#16a34a', selectable: true, hasControls: false, fontWeight: 'bold',
        });
        fc.add(t);
        fc.renderAll();
      } else if (tool === 'cross') {
        const t = new FabricText('✗', {
          left: pointer.x - 12, top: pointer.y - 12,
          fontSize: 32, fill: '#dc2626', selectable: true, hasControls: false, fontWeight: 'bold',
        });
        fc.add(t);
        fc.renderAll();
      }
    });
  }, [existingAnnotations]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const maxW = Math.min(window.innerWidth - 280, 1200);
      const maxH = window.innerHeight - 120;
      let w = img.naturalWidth || 800;
      let h = img.naturalHeight || 600;
      if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
      if (h > maxH) { w = Math.round(w * maxH / h); h = maxH; }
      setCanvasSize({ w, h });
      setImageLoaded(true);

      setTimeout(() => {
        if (!canvasElRef.current) return;
        if (fabricRef.current) { fabricRef.current.dispose(); }
        const fc = new Canvas(canvasElRef.current, { width: w, height: h, selection: true });
        fabricRef.current = fc;
        setupCanvas(fc, w, h, img.src);
      }, 60);
    };
    img.onerror = () => {
      setImageLoaded(true);
      setTimeout(() => {
        if (!canvasElRef.current) return;
        if (fabricRef.current) { fabricRef.current.dispose(); }
        fabricRef.current = new Canvas(canvasElRef.current, { width: 800, height: 600 });
      }, 60);
    };
    img.src = imageUrl;

    return () => {
      if (fabricRef.current) { fabricRef.current.dispose(); fabricRef.current = null; }
    };
  }, [imageUrl]);

  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    if (activeTool === 'freehand') {
      fc.isDrawingMode = true;
      const brush = new PencilBrush(fc);
      brush.color = '#2563eb';
      brush.width = 3;
      fc.freeDrawingBrush = brush;
    } else {
      fc.isDrawingMode = false;
    }
    fc.selection = activeTool === 'select';
  }, [activeTool]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== 'comment') return;
    const rect = e.currentTarget.getBoundingClientRect();
    setPendingComment({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleAddComment = () => {
    if (!pendingComment || !commentText.trim() || !fabricRef.current) return;
    const fc = fabricRef.current;
    const text = commentText.trim();
    const bg = new Rect({
      left: pendingComment.x - 4, top: pendingComment.y - 18,
      width: Math.max(text.length * 7.5, 60), height: 22,
      fill: '#fef08a', stroke: '#ca8a04', strokeWidth: 1, rx: 4, ry: 4,
      selectable: true, hasControls: false,
    });
    const label = new FabricText(text, {
      left: pendingComment.x, top: pendingComment.y - 16,
      fontSize: 13, fill: '#713f12', selectable: true, hasControls: false,
    });
    fc.add(bg, label);
    fc.renderAll();
    setCommentText('');
    setPendingComment(null);
  };

  const handleUndo = () => {
    const fc = fabricRef.current;
    if (!fc) return;
    const objs = fc.getObjects();
    if (objs.length > 0) { fc.remove(objs[objs.length - 1]); fc.renderAll(); }
  };

  const handleClear = () => {
    const fc = fabricRef.current;
    if (!fc) return;
    fc.remove(...fc.getObjects());
    fc.renderAll();
  };

  const handleSave = async () => {
    if (!fabricRef.current) return;
    setIsSaving(true);
    try {
      const fabricJSON = fabricRef.current.toJSON();
      await apiRequest(`/api/submissions/${submissionId}/reviewer-annotations`, 'PATCH', {
        reviewerAnnotations: JSON.stringify({ fabricJSON }),
      });
      toast({ title: 'Marks saved', description: 'Annotations saved to this submission.' });
      onSaved?.();
    } catch {
      toast({ title: 'Save failed', description: 'Could not save annotations. Try again.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const tools: { key: Tool; label: string; icon: string; textColor: string; activeCls: string }[] = [
    { key: 'select',  label: 'Select',    icon: '↖',  textColor: 'text-gray-700',  activeCls: 'bg-gray-100 border-gray-400' },
    { key: 'tick',    label: 'Tick ✓',    icon: '✓',  textColor: 'text-green-700', activeCls: 'bg-green-50 border-green-500' },
    { key: 'cross',   label: 'Cross ✗',   icon: '✗',  textColor: 'text-red-700',   activeCls: 'bg-red-50 border-red-500' },
    { key: 'comment', label: 'Comment',   icon: '💬', textColor: 'text-amber-700', activeCls: 'bg-amber-50 border-amber-500' },
    { key: 'freehand',label: 'Draw',      icon: '✏️', textColor: 'text-blue-700',  activeCls: 'bg-blue-50 border-blue-500' },
  ];

  const content = (
    <div className="fixed inset-0 z-[9999] bg-black/80 flex" onKeyDown={e => e.key === 'Escape' && onClose()}>
      {/* Left toolbar */}
      <div className="w-56 bg-white border-r flex flex-col gap-3 p-4 flex-shrink-0 overflow-y-auto">
        <div>
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
                    ? `${t.activeCls} border-current`
                    : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                } ${activeTool === t.key ? t.textColor : ''}`}
              >
                <span className="text-base w-5 text-center leading-none">{t.icon}</span>
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

        <div className="border-t pt-3 space-y-1.5">
          <button onClick={handleUndo} className="w-full py-2 text-xs font-bold border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700">↩ Undo last</button>
          <button onClick={handleClear} className="w-full py-2 text-xs font-bold border border-red-200 text-red-600 rounded-xl hover:bg-red-50">🗑 Clear all</button>
        </div>

        <div className="space-y-1.5 mt-auto">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 disabled:opacity-60 transition-colors"
          >
            {isSaving ? 'Saving…' : '💾 Save marks'}
          </button>
          <button onClick={onClose} className="w-full py-2 text-xs font-bold border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700">
            Close
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 overflow-auto bg-gray-900 flex items-start justify-center p-6">
        <div ref={containerRef} className="relative shadow-2xl rounded-lg overflow-hidden bg-white"
          style={{ width: canvasSize.w, height: canvasSize.h }}
          onClick={handleCanvasClick}
        >
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <p className="text-gray-500 text-sm">Loading submission…</p>
            </div>
          )}
          <canvas ref={canvasElRef} style={{
            cursor:
              activeTool === 'tick' || activeTool === 'cross' ? 'crosshair' :
              activeTool === 'comment' ? 'cell' :
              activeTool === 'freehand' ? 'crosshair' : 'default',
          }} />
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

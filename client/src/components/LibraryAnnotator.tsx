import { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { Canvas, FabricText, Rect, PencilBrush } from 'fabric';

export interface LibraryAnswerImage {
  questionId: string;
  questionNumber: number;
  imageUrl: string;
}

interface LibraryAnnotatorProps {
  images: LibraryAnswerImage[];
  existingAnnotations?: string | null;
  isViewOnly?: boolean;
  onSave?: (annotationsJson: string) => Promise<void>;
  onClose: () => void;
  studentName?: string;
  assignmentTitle?: string;
}

type Tool = 'select' | 'tick' | 'cross' | 'comment' | 'freehand';

const CANVAS_WIDTH = 760;
const GAP = 24;

function LibraryAnnotatorContent({
  images,
  existingAnnotations,
  isViewOnly = false,
  onSave,
  onClose,
  studentName,
  assignmentTitle,
}: LibraryAnnotatorProps) {
  const { toast } = useToast();
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);

  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [isSaving, setIsSaving] = useState(false);
  const [imageHeights, setImageHeights] = useState<Record<string, number>>({});
  const [pendingComment, setPendingComment] = useState<{ x: number; y: number } | null>(null);
  const [commentText, setCommentText] = useState('');

  const activeToolRef = useRef<Tool>('select');
  activeToolRef.current = activeTool;

  const allLoaded = images.every(img => imageHeights[img.questionId] != null);
  const offsets: Record<string, number> = {};
  let running = 0;
  for (const img of images) {
    offsets[img.questionId] = running;
    running += (imageHeights[img.questionId] ?? 0) + GAP;
  }
  const totalHeight = Math.max(running - GAP, 200);

  const handleImageLoad = (questionId: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    const h = Math.round((CANVAS_WIDTH / el.naturalWidth) * el.naturalHeight);
    setImageHeights(prev => (prev[questionId] === h ? prev : { ...prev, [questionId]: h }));
  };

  const setupCanvas = useCallback((fc: Canvas) => {
    if (existingAnnotations) {
      try {
        const parsed = JSON.parse(existingAnnotations);
        if (parsed?.fabricJSON) {
          fc.loadFromJSON(parsed.fabricJSON).then(() => fc.renderAll());
        }
      } catch {}
    }

    fc.on('mouse:down', opt => {
      const tool = activeToolRef.current;
      if (isViewOnly || tool === 'select' || tool === 'freehand' || tool === 'comment') return;
      const pointer = fc.getScenePoint(opt.e);
      if (tool === 'tick') {
        fc.add(new FabricText('✓', { left: pointer.x - 12, top: pointer.y - 12, fontSize: 32, fill: '#16a34a', selectable: true, hasControls: false, fontWeight: 'bold' }));
        fc.renderAll();
      } else if (tool === 'cross') {
        fc.add(new FabricText('✗', { left: pointer.x - 12, top: pointer.y - 12, fontSize: 32, fill: '#dc2626', selectable: true, hasControls: false, fontWeight: 'bold' }));
        fc.renderAll();
      }
    });
  }, [existingAnnotations, isViewOnly]);

  useEffect(() => {
    if (!allLoaded || !canvasElRef.current) return;
    if (fabricRef.current) { fabricRef.current.dispose(); fabricRef.current = null; }
    const fc = new Canvas(canvasElRef.current, {
      width: CANVAS_WIDTH,
      height: totalHeight,
      selection: !isViewOnly,
    });
    fc.selection = !isViewOnly && activeTool === 'select';
    fabricRef.current = fc;
    setupCanvas(fc);
    return () => { fc.dispose(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLoaded, totalHeight]);

  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc || isViewOnly) return;
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
  }, [activeTool, isViewOnly]);

  const handleCanvasWrapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isViewOnly || activeTool !== 'comment') return;
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
    const label = new FabricText(text, { left: pendingComment.x, top: pendingComment.y - 16, fontSize: 13, fill: '#713f12', selectable: true, hasControls: false });
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
    if (!fabricRef.current || !onSave) return;
    setIsSaving(true);
    try {
      const fabricJSON = fabricRef.current.toJSON();
      await onSave(JSON.stringify({ fabricJSON }));
      toast({ title: 'Annotations saved', description: 'Your markup has been saved.' });
    } catch {
      toast({ title: 'Save failed', description: 'Could not save annotations. Try again.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const tools: { key: Tool; label: string; icon: string; activeCls: string }[] = [
    { key: 'select', label: 'Select', icon: '↖', activeCls: 'bg-gray-100 border-gray-400' },
    { key: 'tick', label: 'Tick', icon: '✓', activeCls: 'bg-green-50 border-green-500' },
    { key: 'cross', label: 'Cross', icon: '✗', activeCls: 'bg-red-50 border-red-500' },
    { key: 'comment', label: 'Comment', icon: '💬', activeCls: 'bg-amber-50 border-amber-500' },
    { key: 'freehand', label: 'Draw', icon: '✏️', activeCls: 'bg-blue-50 border-blue-500' },
  ];

  const content = (
    <div className="fixed inset-0 z-[9999] bg-black/80 flex" onKeyDown={e => e.key === 'Escape' && onClose()}>
      {!isViewOnly && (
        <div className="w-56 bg-white border-r flex flex-col gap-3 p-4 flex-shrink-0 overflow-y-auto">
          <div>
            <p className="font-black text-sm text-gray-900 truncate">{studentName || 'Student'}</p>
            <p className="text-xs text-gray-500 truncate">{assignmentTitle}</p>
          </div>
          <div className="space-y-1.5">
            {tools.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTool(t.key)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold ${activeTool === t.key ? t.activeCls : 'bg-white border-gray-200 hover:bg-gray-50'}`}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleUndo} className="flex-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg py-2">Undo</button>
            <button onClick={handleClear} className="flex-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg py-2">Clear</button>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="mt-auto w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-sm"
          >
            {isSaving ? 'Saving…' : 'Save Annotations'}
          </button>
          <button onClick={onClose} className="w-full text-xs font-semibold text-gray-500 hover:text-gray-700 py-1">Close</button>
        </div>
      )}

      <div className="flex-1 overflow-auto p-6 flex flex-col items-center">
        {isViewOnly && (
          <div className="w-full max-w-3xl flex items-center justify-between mb-3">
            <div>
              <p className="font-black text-sm text-white">Marked-Up Work</p>
              {assignmentTitle && <p className="text-xs text-gray-300">{assignmentTitle}</p>}
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white text-sm font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg">Close</button>
          </div>
        )}

        <div className="relative bg-white shadow-2xl" style={{ width: CANVAS_WIDTH }} onClick={handleCanvasWrapClick}>
          {images.map(img => (
            <img
              key={img.questionId}
              src={img.imageUrl}
              alt={`Question ${img.questionNumber} answer`}
              style={{ width: CANVAS_WIDTH, display: 'block', marginBottom: GAP }}
              onLoad={e => handleImageLoad(img.questionId, e)}
            />
          ))}
          {allLoaded && (
            <canvas
              ref={canvasElRef}
              style={{ position: 'absolute', top: 0, left: 0, pointerEvents: isViewOnly ? 'none' : undefined }}
            />
          )}
        </div>

        {pendingComment && (
          <div className="fixed bottom-6 bg-white rounded-xl shadow-2xl p-4 w-80">
            <label className="text-xs font-bold text-gray-500 uppercase">Add Comment</label>
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
              placeholder="Feedback…"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button onClick={() => setPendingComment(null)} className="flex-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg py-2">Cancel</button>
              <button onClick={handleAddComment} disabled={!commentText.trim()} className="flex-1 text-xs font-semibold bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg py-2">Add</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return content;
}

export function LibraryAnnotator(props: LibraryAnnotatorProps) {
  return createPortal(<LibraryAnnotatorContent {...props} />, document.body);
}

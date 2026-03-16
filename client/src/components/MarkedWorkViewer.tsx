import { useEffect, useRef, useState } from 'react';
import { X, MessageSquare, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Canvas, FabricImage } from 'fabric';

interface MarkedWorkViewerProps {
  submissionId: string;
  fileUrls: string[];
  reviewerAnnotations: string | null | undefined;
  feedback: string | null | undefined;
  score: number | null | undefined;
  assignmentTitle: string;
  studentName?: string;
  gradedAt?: string | null;
  onClose: () => void;
}

export default function MarkedWorkViewer({
  fileUrls,
  reviewerAnnotations,
  feedback,
  score,
  assignmentTitle,
  studentName,
  gradedAt,
  onClose,
}: MarkedWorkViewerProps) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const imageUrls = fileUrls.filter(u => u);
  const currentUrl = imageUrls[pageIndex];

  useEffect(() => {
    if (!canvasElRef.current || !currentUrl) return;

    let cancelled = false;

    const setup = async () => {
      setImageLoaded(false);
      setError(null);

      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
      }

      const container = containerRef.current;
      const maxW = container ? container.clientWidth - 32 : 600;
      const maxH = window.innerHeight * 0.55;

      try {
        const img = await FabricImage.fromURL(currentUrl, { crossOrigin: 'anonymous' });
        if (cancelled) return;

        const naturalW = img.width ?? 800;
        const naturalH = img.height ?? 600;
        const scale = Math.min(maxW / naturalW, maxH / naturalH, 1);
        const canvasW = Math.round(naturalW * scale);
        const canvasH = Math.round(naturalH * scale);

        const fc = new Canvas(canvasElRef.current!, {
          width: canvasW,
          height: canvasH,
          selection: false,
          interactive: false,
        });
        fabricRef.current = fc;

        img.scaleToWidth(canvasW);
        img.set({ left: 0, top: 0, selectable: false, evented: false });
        fc.add(img);
        fc.sendObjectToBack(img);

        if (reviewerAnnotations) {
          try {
            const parsed = JSON.parse(reviewerAnnotations);
            const objects = parsed?.objects ?? [];
            await fc.loadFromJSON({ version: parsed.version ?? '6.0.0', objects });
            fc.getObjects().forEach(o => {
              if (o !== img) {
                o.set({ selectable: false, evented: false });
                o.scale((o.scaleX ?? 1) * scale);
                o.set({ left: (o.left ?? 0) * scale, top: (o.top ?? 0) * scale });
              }
            });
          } catch (_) {
          }
        }

        fc.renderAll();
        if (!cancelled) setImageLoaded(true);
      } catch (e) {
        if (!cancelled) setError('Could not load the submitted image.');
      }
    };

    setup();
    return () => {
      cancelled = true;
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
      }
    };
  }, [currentUrl, reviewerAnnotations]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div ref={containerRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <p className="font-bold text-gray-900 text-base leading-tight">{assignmentTitle}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {studentName && <span>{studentName} · </span>}
              {gradedAt ? `Marked ${new Date(gradedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Marked work'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Score banner */}
        {score !== null && score !== undefined && (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 border-b border-indigo-100 flex-shrink-0">
            <Star size={14} className="text-indigo-500 fill-indigo-500" />
            <span className="text-sm font-bold text-indigo-700">Score: {score}</span>
          </div>
        )}

        {/* Canvas / image area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col items-center gap-4 min-h-0">
          {imageUrls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <p className="text-sm">No submitted files to display.</p>
            </div>
          ) : (
            <>
              <div className="relative w-full flex justify-center">
                {!imageLoaded && !error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-xl">
                    <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {error && (
                  <div className="flex items-center justify-center py-10 text-red-500 text-sm">{error}</div>
                )}
                <canvas
                  ref={canvasElRef}
                  className={`rounded-xl border border-gray-200 shadow-sm transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
              </div>

              {imageUrls.length > 1 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPageIndex(i => Math.max(0, i - 1))}
                    disabled={pageIndex === 0}
                    className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs text-gray-500 font-medium">Page {pageIndex + 1} of {imageUrls.length}</span>
                  <button
                    onClick={() => setPageIndex(i => Math.min(imageUrls.length - 1, i + 1))}
                    disabled={pageIndex === imageUrls.length - 1}
                    className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Tutor feedback */}
          {feedback && (
            <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={14} className="text-amber-600" />
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Tutor's Comment</p>
              </div>
              <p className="text-sm text-amber-900 leading-relaxed">{feedback}</p>
            </div>
          )}

          {!feedback && imageUrls.length > 0 && imageLoaded && (
            <p className="text-xs text-gray-400 italic text-center">No written comment from your tutor yet.</p>
          )}
        </div>

        {/* Footer close */}
        <div className="px-5 py-3 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { X, MessageSquare, Star, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Canvas, FabricImage } from 'fabric';

interface MarkedWorkViewerProps {
  submissionId: string;
  fileUrls: string[];
  documentUrl: string | null | undefined;
  reviewerAnnotations: string | null | undefined;
  feedback: string | null | undefined;
  score: number | null | undefined;
  assignmentTitle: string;
  studentName?: string;
  gradedAt?: string | null;
  onClose: () => void;
}

async function fetchAsBlobUrl(url: string): Promise<string> {
  const resp = await fetch(url, { credentials: 'include' });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const blob = await resp.blob();
  return URL.createObjectURL(blob);
}

function getNaturalSize(blobUrl: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => reject(new Error('Could not read image dimensions'));
    img.src = blobUrl;
  });
}

function parseAnnotations(raw: string): { version: string; objects: any[] } | null {
  try {
    const parsed = JSON.parse(raw);
    const data = parsed.fabricJSON ?? parsed;
    if (!data || typeof data !== 'object') return null;
    return { version: data.version ?? '6.0.0', objects: data.objects ?? [] };
  } catch {
    return null;
  }
}

export default function MarkedWorkViewer({
  fileUrls,
  documentUrl,
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
  const blobUrlRef = useRef<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fileList = (fileUrls ?? []).filter(Boolean);
  const docApiUrl = documentUrl ? `/api/files/${documentUrl}` : null;
  const allUrls: string[] = fileList.length > 0 ? fileList : docApiUrl ? [docApiUrl] : [];
  const currentUrl = allUrls[pageIndex] ?? null;

  useEffect(() => {
    if (!canvasElRef.current) return;
    let cancelled = false;

    const setup = async () => {
      setImageLoaded(false);
      setError(null);

      if (fabricRef.current) { fabricRef.current.dispose(); fabricRef.current = null; }
      if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }

      if (!currentUrl) return;

      const container = containerRef.current;
      const maxW = Math.min(container ? container.clientWidth - 32 : 560, 700);
      const maxH = Math.round(window.innerHeight * 0.52);

      try {
        const blobUrl = await fetchAsBlobUrl(currentUrl);
        if (cancelled) { URL.revokeObjectURL(blobUrl); return; }
        blobUrlRef.current = blobUrl;

        const { w: naturalW, h: naturalH } = await getNaturalSize(blobUrl);
        if (cancelled) return;

        const scale = Math.min(maxW / naturalW, maxH / naturalH, 1);
        const canvasW = Math.round(naturalW * scale);
        const canvasH = Math.round(naturalH * scale);

        const fc = new Canvas(canvasElRef.current!, {
          width: canvasW,
          height: canvasH,
          selection: false,
          interactive: false,
          renderOnAddRemove: false,
        });
        fabricRef.current = fc;

        if (reviewerAnnotations) {
          const annotationData = parseAnnotations(reviewerAnnotations);
          if (annotationData) {
            try {
              await fc.loadFromJSON({ version: annotationData.version, objects: annotationData.objects });
              fc.getObjects().forEach(o => o.set({ selectable: false, evented: false }));
            } catch (_) {}
          }
        }

        const fabricImg = await FabricImage.fromURL(blobUrl);
        if (cancelled) return;
        fabricImg.scaleToWidth(canvasW);
        fabricImg.set({ left: 0, top: 0, selectable: false, evented: false });
        fc.add(fabricImg);
        fc.sendObjectToBack(fabricImg);
        fc.renderAll();

        if (!cancelled) setImageLoaded(true);
      } catch (e) {
        if (!cancelled) setError('Could not load the submitted work. Please try again.');
      }
    };

    setup();
    return () => {
      cancelled = true;
      if (fabricRef.current) { fabricRef.current.dispose(); fabricRef.current = null; }
      if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }
    };
  }, [currentUrl, reviewerAnnotations]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div ref={containerRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="min-w-0 mr-3">
            <p className="font-bold text-gray-900 text-base leading-tight truncate">{assignmentTitle}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {studentName && <span>{studentName} · </span>}
              {gradedAt
                ? `Marked ${new Date(gradedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                : 'Marked work'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0">
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

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-4 min-h-0">

          {/* Image / canvas */}
          {allUrls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
              <p className="text-sm font-medium">No submitted work to display.</p>
              <p className="text-xs">This submission may have been completed digitally within the platform.</p>
            </div>
          ) : (
            <>
              <div className="relative flex justify-center">
                {!imageLoaded && !error && (
                  <div className="flex items-center justify-center min-h-[180px] w-full bg-gray-50 rounded-xl">
                    <div className="w-7 h-7 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 py-10 text-red-500 text-sm">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}
                {!error && (
                  <canvas
                    ref={canvasElRef}
                    className={`rounded-xl border border-gray-200 shadow-sm max-w-full transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}
                  />
                )}
              </div>

              {allUrls.length > 1 && (
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setPageIndex(i => Math.max(0, i - 1))}
                    disabled={pageIndex === 0}
                    className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs text-gray-500 font-medium">
                    Page {pageIndex + 1} of {allUrls.length}
                  </span>
                  <button
                    onClick={() => setPageIndex(i => Math.min(allUrls.length - 1, i + 1))}
                    disabled={pageIndex === allUrls.length - 1}
                    className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Tutor's comment */}
          {feedback ? (
            <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={14} className="text-amber-600" />
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Tutor's Comment</p>
              </div>
              <p className="text-sm text-amber-900 leading-relaxed">{feedback}</p>
            </div>
          ) : imageLoaded ? (
            <p className="text-xs text-gray-400 italic text-center pb-2">No written comment from your tutor yet.</p>
          ) : null}
        </div>

        {/* Footer */}
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

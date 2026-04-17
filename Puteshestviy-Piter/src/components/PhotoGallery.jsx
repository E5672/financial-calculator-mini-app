import { useState, useRef } from 'react';

// Принимает gallery (курированные изображения) или photos (старый формат, может быть picsum).
// НЕ подставляет случайные фото автоматически.
// Если изображение не загрузилось — показывает аккуратную заглушку с именем файла.

function ImagePlaceholder({ src }) {
  const name = src?.split('/').pop()?.replace(/\.(jpg|png|svg|webp)$/i, '') || 'фото';
  return (
    <div className="h-48 w-72 flex-shrink-0 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center gap-2 border border-gray-200">
      <span className="text-3xl opacity-30">🖼</span>
      <span className="text-xs text-gray-400 text-center px-3 leading-tight">{name}</span>
      <span className="text-xs text-gray-300">TODO: добавить фото</span>
    </div>
  );
}

export default function PhotoGallery({ routeId, gallery = [], photos = [] }) {
  // gallery — приоритет (локальные, курированные); photos — старый fallback
  const sources = gallery.length > 0 ? gallery : photos;

  const [lightbox, setLightbox] = useState(null);
  const [failedSrcs, setFailedSrcs] = useState(new Set());
  const [userPhotos, setUserPhotos] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`uphotos_${routeId}`) || '[]'); }
    catch { return []; }
  });
  const fileRef = useRef();

  const allSources = [...sources, ...userPhotos];

  const handleError = (src) => {
    setFailedSrcs(prev => new Set([...prev, src]));
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const updated = [...userPhotos, ev.target.result];
      setUserPhotos(updated);
      try { localStorage.setItem(`uphotos_${routeId}`, JSON.stringify(updated)); } catch {}
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (allSources.length === 0) return null;

  return (
    <div>
      {/* Horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
        {allSources.map((src, i) => (
          failedSrcs.has(src) ? (
            <div key={i} className="flex-shrink-0 snap-start">
              <ImagePlaceholder src={src} />
            </div>
          ) : (
            <img
              key={i}
              src={src}
              alt=""
              onClick={() => setLightbox(i)}
              onError={() => handleError(src)}
              className="h-48 w-72 object-cover rounded-2xl flex-shrink-0 cursor-pointer snap-start hover:opacity-95 transition-opacity"
            />
          )
        ))}
        {/* Upload button */}
        <button
          onClick={() => fileRef.current?.click()}
          className="h-48 w-32 flex-shrink-0 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-emerald-300 hover:text-emerald-500 transition-colors snap-start"
        >
          <span className="text-2xl">📷</span>
          <span className="text-xs font-medium text-center px-2">Добавить фото</span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      {/* Lightbox */}
      {lightbox !== null && !failedSrcs.has(allSources[lightbox]) && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={allSources[lightbox]}
            alt=""
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center text-xl font-bold"
          >
            ×
          </button>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            <button
              onClick={e => { e.stopPropagation(); setLightbox(l => Math.max(0, l - 1)); }}
              disabled={lightbox === 0}
              className="px-4 py-2 bg-white/20 text-white rounded-full text-sm disabled:opacity-30"
            >←</button>
            <span className="px-4 py-2 text-white/60 text-sm">{lightbox + 1} / {allSources.length}</span>
            <button
              onClick={e => { e.stopPropagation(); setLightbox(l => Math.min(allSources.length - 1, l + 1)); }}
              disabled={lightbox === allSources.length - 1}
              className="px-4 py-2 bg-white/20 text-white rounded-full text-sm disabled:opacity-30"
            >→</button>
          </div>
        </div>
      )}
    </div>
  );
}

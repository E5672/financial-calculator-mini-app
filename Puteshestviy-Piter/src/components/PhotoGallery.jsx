import { useState, useRef } from 'react';

export default function PhotoGallery({ routeId, photos = [] }) {
  const [lightbox, setLightbox] = useState(null);
  const [userPhotos, setUserPhotos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`photos_${routeId}`) || '[]');
    } catch { return []; }
  });
  const fileRef = useRef();

  const allPhotos = [...photos, ...userPhotos];

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const newPhotos = [...userPhotos, ev.target.result];
      setUserPhotos(newPhotos);
      try {
        localStorage.setItem(`photos_${routeId}`, JSON.stringify(newPhotos));
      } catch {}
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (allPhotos.length === 0) return null;

  return (
    <div>
      {/* Horizontal scroll gallery */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
        {allPhotos.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            onClick={() => setLightbox(i)}
            className="h-48 w-72 object-cover rounded-2xl flex-shrink-0 cursor-pointer snap-start hover:opacity-95 transition-opacity"
            onError={e => { e.target.style.display = 'none'; }}
          />
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
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={allPhotos[lightbox]}
            alt=""
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center text-lg font-bold"
          >
            ×
          </button>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(l => Math.max(0, l - 1)); }}
              className="px-4 py-2 bg-white/20 text-white rounded-full text-sm disabled:opacity-30"
              disabled={lightbox === 0}
            >
              ←
            </button>
            <span className="px-4 py-2 text-white/60 text-sm">{lightbox + 1} / {allPhotos.length}</span>
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(l => Math.min(allPhotos.length - 1, l + 1)); }}
              className="px-4 py-2 bg-white/20 text-white rounded-full text-sm disabled:opacity-30"
              disabled={lightbox === allPhotos.length - 1}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

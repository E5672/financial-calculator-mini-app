import { useState } from 'react';

function StarRating({ value, onChange, readonly }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          className={`text-xl transition-transform ${readonly ? 'cursor-default' : 'hover:scale-110 active:scale-95'}`}
        >
          {star <= value ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  );
}

// Аватар-заглушка для отзыва без фото (не случайное изображение)
function ReviewAvatar({ author }) {
  const letter = author?.charAt(0)?.toUpperCase() || '?';
  const colors = ['bg-emerald-100 text-emerald-700', 'bg-sky-100 text-sky-700', 'bg-violet-100 text-violet-700', 'bg-amber-100 text-amber-700'];
  const color = colors[letter.charCodeAt(0) % colors.length];
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${color}`}>
      {letter}
    </div>
  );
}

export default function Reviews({ routeId, reviewHints = [] }) {
  const [reviews, setReviews] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`reviews_${routeId}`) || '[]'); }
    catch { return []; }
  });

  const [form, setForm] = useState({ author: '', rating: 5, text: '' });
  const [showForm, setShowForm] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.text.trim()) return;
    const review = {
      id: Date.now(),
      author: form.author.trim() || 'Аноним',
      rating: form.rating,
      text: form.text.trim(),
      date: new Date().toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' }),
      photo: photoPreview,
    };
    const updated = [review, ...reviews];
    setReviews(updated);
    try { localStorage.setItem(`reviews_${routeId}`, JSON.stringify(updated)); } catch {}
    setForm({ author: '', rating: 5, text: '' });
    setPhotoPreview(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {avgRating ? (
            <div className="flex items-center gap-2.5">
              <span className="text-3xl font-bold text-gray-900">{avgRating}</span>
              <div>
                <StarRating value={Math.round(Number(avgRating))} readonly />
                <p className="text-xs text-gray-400 mt-0.5">
                  {reviews.length} {reviews.length === 1 ? 'отзыв' : reviews.length < 5 ? 'отзыва' : 'отзывов'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 font-medium">Пока нет отзывов</p>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 active:scale-95 transition-all"
        >
          {showForm ? 'Отмена' : '✍️ Написать отзыв'}
        </button>
      </div>

      {/* Review form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-100">
          <input
            type="text"
            placeholder="Ваше имя (необязательно)"
            value={form.author}
            onChange={e => setForm(p => ({ ...p, author: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none"
          />
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Оценка</p>
            <StarRating value={form.rating} onChange={v => setForm(p => ({ ...p, rating: v }))} />
          </div>
          <textarea
            placeholder="Расскажите о поездке..."
            value={form.text}
            onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
            rows={3}
            required
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm resize-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none"
          />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:text-emerald-600 transition-colors">
              <span>📷</span>
              <span>{photoPreview ? 'Фото выбрано' : 'Добавить фото'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
            {photoPreview && (
              <button type="button" onClick={() => setPhotoPreview(null)} className="text-xs text-red-500 hover:underline">
                Удалить
              </button>
            )}
          </div>
          {photoPreview && (
            <img src={photoPreview} alt="" className="h-24 w-full object-cover rounded-xl" />
          )}
          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 active:scale-[0.98] transition-all"
          >
            Опубликовать отзыв
          </button>
        </form>
      )}

      {/* Empty state with hints */}
      {reviews.length === 0 && !showForm && (
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-center">
          <p className="text-2xl mb-2">💬</p>
          <p className="text-sm font-semibold text-gray-700">Пока нет отзывов</p>
          <p className="text-xs text-gray-400 mt-1">Станьте первым, кто поделится впечатлениями</p>

          {reviewHints.length > 0 && (
            <div className="mt-4 text-left space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Что можно написать</p>
              {reviewHints.map((hint, i) => (
                <button
                  key={i}
                  onClick={() => { setShowForm(true); setForm(p => ({ ...p, text: hint + ' ' })); }}
                  className="block w-full text-left text-xs text-gray-500 bg-white rounded-xl px-3 py-2 border border-gray-200 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
                >
                  {hint}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-3">
        {reviews.map(r => (
          <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <ReviewAvatar author={r.author} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-900">{r.author}</span>
                  <span className="text-xs text-gray-400">{r.date}</span>
                </div>
                <StarRating value={r.rating} readonly />
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{r.text}</p>
            {r.photo && (
              <img src={r.photo} alt="" className="h-32 w-full object-cover rounded-xl mt-3" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

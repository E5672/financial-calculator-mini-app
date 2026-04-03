interface Props {
  message: string
  onClose: () => void
}

export default function ConflictModal({ message, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-red-700 rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="text-red-400 text-2xl flex-shrink-0">⚠</div>
          <div>
            <div className="text-white font-semibold mb-2">Конфликт редактирования</div>
            <div className="text-slate-300 text-sm">{message}</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
        >
          Обновить данные
        </button>
      </div>
    </div>
  )
}

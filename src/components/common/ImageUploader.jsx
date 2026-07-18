import { useRef, useState } from 'react'
import { Upload, Trash2, ClipboardPaste } from 'lucide-react'
import { useCollageStore } from '../../hooks/useCollageStore'

// Fotoğraf yükleme alanı + yüklenen fotoğrafların listesi
export default function ImageUploader() {
  const { photos, addPhotos, removePhoto } = useCollageStore()
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault()
          setDragOver(false)
          addPhotos(e.dataTransfer.files)
        }}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-colors mb-2
          ${dragOver
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-500/5'}`}
      >
        <Upload className="mx-auto mb-1.5 text-blue-500" size={22} />
        <p className="text-xs font-medium">Fotoğrafları sürükleyin veya tıklayın</p>
        <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-center gap-1">
          <ClipboardPaste size={11} /> Ctrl+V ile yapıştırabilirsiniz
        </p>
        <input
          ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => { addPhotos(e.target.files); e.target.value = '' }}
        />
      </div>

      {photos.length > 0 && (
        <p className="text-[10px] text-slate-400 mb-1.5">
          {photos.length} fotoğraf — yuvalara sürükleyin
        </p>
      )}

      <div className="flex-1 overflow-y-auto min-h-0 grid grid-cols-3 gap-1.5 content-start pr-1">
        {photos.map(p => (
          <div
            key={p.id}
            className="group relative aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 cursor-grab active:cursor-grabbing"
            draggable
            onDragStart={e => {
              e.dataTransfer.setData('photo-id', p.id)
              e.dataTransfer.effectAllowed = 'copy'
            }}
            title={p.name}
          >
            <img src={p.url} alt={p.name} className="w-full h-full object-cover pointer-events-none" />
            <button
              onClick={() => removePhoto(p.id)}
              className="absolute top-1 right-1 hidden group-hover:flex items-center justify-center w-5 h-5 rounded-md bg-black/60 text-white hover:bg-red-500"
              title="Fotoğrafı sil"
            >
              <Trash2 size={11} />
            </button>
          </div>
        ))}
        {!photos.length && (
          <p className="col-span-3 text-center text-xs text-slate-400 mt-4">Henüz fotoğraf yok.</p>
        )}
      </div>
    </div>
  )
}

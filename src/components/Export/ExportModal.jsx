import { useState } from 'react'
import { X, Download, Loader2 } from 'lucide-react'
import { exportCollage } from '../../utils/exportUtils'
import { useCollageStore } from '../../hooks/useCollageStore'

const SIZES = [
  { id: '1x', label: 'Orijinal (1x)', scale: 1 },
  { id: '2x', label: 'Orijinal (2x)', scale: 2 },
  { id: '3x', label: 'Orijinal (3x)', scale: 3 },
  { id: '1080', label: '1080 px', targetWidth: 1080 },
  { id: '1920', label: '1920 px (Full HD)', targetWidth: 1920 },
  { id: '3840', label: '3840 px (4K)', targetWidth: 3840 },
]

export default function ExportModal({ onClose }) {
  const [format, setFormat] = useState('png')
  const [quality, setQuality] = useState(92)
  const [size, setSize] = useState('2x')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const selectSlot = useCollageStore(s => s.selectSlot)

  const doExport = async () => {
    setBusy(true)
    setError(null)
    selectSlot(null) // seçim halkaları görüntüye girmesin
    await new Promise(r => setTimeout(r, 60))
    try {
      const s = SIZES.find(x => x.id === size)
      await exportCollage({ format, quality: quality / 100, targetWidth: s.targetWidth, scale: s.scale })
      onClose()
    } catch (e) {
      console.error(e)
      setError('Dışa aktarma başarısız oldu. Lütfen tekrar deneyin.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass rounded-2xl w-full max-w-sm p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-base">Dışa Aktar</h2>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <p className="panel-title mb-2">Biçim</p>
        <div className="grid grid-cols-2 gap-1.5 mb-4">
          {['png', 'jpg'].map(f => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`rounded-lg py-2 text-sm font-semibold uppercase transition-colors
                ${format === f ? 'bg-accent text-white' : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {format === 'jpg' && (
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-slate-500">Kalite</span>
              <span className="text-xs font-medium">%{quality}</span>
            </div>
            <input type="range" min={50} max={100} value={quality} className="input-range"
              onChange={e => setQuality(Number(e.target.value))} />
          </div>
        )}

        <p className="panel-title mb-2">Boyut</p>
        <div className="grid grid-cols-2 gap-1.5 mb-5">
          {SIZES.map(s => (
            <button
              key={s.id}
              onClick={() => setSize(s.id)}
              className={`rounded-lg py-1.5 text-xs font-medium transition-colors
                ${size === s.id ? 'bg-accent text-white' : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700'}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <button className="btn-primary w-full py-2.5" onClick={doExport} disabled={busy}>
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {busy ? 'Hazırlanıyor...' : 'İndir'}
        </button>
      </div>
    </div>
  )
}

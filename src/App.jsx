import { useEffect, useState } from 'react'
import { Images, SlidersHorizontal, PencilRuler, Download, X } from 'lucide-react'
import Navbar from './components/Layout/Navbar'
import Sidebar from './components/Layout/Sidebar'
import CollageCanvas from './components/Canvas/CollageCanvas'
import EditorPanel from './components/Editor/EditorPanel'
import ExportModal from './components/Export/ExportModal'
import CustomLayoutBuilder from './components/CustomBuilder/CustomLayoutBuilder'
import { useCollageStore } from './hooks/useCollageStore'

export default function App() {
  const { theme, addPhotos, undo, redo } = useCollageStore()
  const [showExport, setShowExport] = useState(false)
  const [showBuilder, setShowBuilder] = useState(false)
  const [mobilePanel, setMobilePanel] = useState(null) // null | 'left' | 'right'
  const [dropHint, setDropHint] = useState(false)

  // Tema başlangıcı
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Klavye kısayolları + panodan yapıştırma
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
    }
    const onPaste = (e) => {
      const files = Array.from(e.clipboardData?.items || [])
        .filter(i => i.type.startsWith('image/'))
        .map(i => i.getAsFile())
        .filter(Boolean)
      if (files.length) addPhotos(files)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('paste', onPaste)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('paste', onPaste)
    }
  }, [undo, redo, addPhotos])

  // Pencereye dosya sürükleme ipucu (yuvalar kendi drop olaylarını yönetir)
  useEffect(() => {
    let depth = 0
    const enter = (e) => { if (e.dataTransfer?.types?.includes('Files')) { depth++; setDropHint(true) } }
    const leave = () => { depth = Math.max(0, depth - 1); if (!depth) setDropHint(false) }
    const drop = (e) => {
      depth = 0
      setDropHint(false)
      // Bir yuvanın üzerine bırakılmadıysa fotoğraf listesine ekle
      if (!e.defaultPrevented && e.dataTransfer?.files?.length) {
        e.preventDefault()
        addPhotos(e.dataTransfer.files)
      }
    }
    const over = (e) => e.preventDefault()
    window.addEventListener('dragenter', enter)
    window.addEventListener('dragleave', leave)
    window.addEventListener('dragover', over)
    window.addEventListener('drop', drop)
    return () => {
      window.removeEventListener('dragenter', enter)
      window.removeEventListener('dragleave', leave)
      window.removeEventListener('dragover', over)
      window.removeEventListener('drop', drop)
    }
  }, [addPhotos])

  return (
    <div className="h-full flex flex-col gap-3 p-3 bg-gradient-to-br from-slate-100 via-slate-100 to-blue-100/40 dark:from-slate-950 dark:via-slate-950 dark:to-blue-950/30">
      <Navbar onExport={() => setShowExport(true)} onCustomBuilder={() => setShowBuilder(true)} />

      <div className="flex-1 flex gap-3 min-h-0">
        {/* Sol panel — masaüstü */}
        <div className="hidden lg:block w-72 xl:w-80 shrink-0">
          <Sidebar />
        </div>

        {/* Merkez tuval */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0 glass rounded-2xl overflow-hidden">
          <CollageCanvas />
        </main>

        {/* Sağ panel — masaüstü */}
        <div className="hidden lg:block w-64 xl:w-72 shrink-0">
          <EditorPanel />
        </div>
      </div>

      {/* Mobil / tablet alt çubuğu */}
      <nav className="lg:hidden glass rounded-2xl flex items-center justify-around p-1.5">
        <MobileBtn icon={Images} label="Galeri" onClick={() => setMobilePanel(p => p === 'left' ? null : 'left')} active={mobilePanel === 'left'} />
        <MobileBtn icon={SlidersHorizontal} label="Düzenle" onClick={() => setMobilePanel(p => p === 'right' ? null : 'right')} active={mobilePanel === 'right'} />
        <MobileBtn icon={PencilRuler} label="Özel" onClick={() => setShowBuilder(true)} />
        <MobileBtn icon={Download} label="İndir" onClick={() => setShowExport(true)} />
      </nav>

      {/* Mobil çekmeceler */}
      {mobilePanel && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setMobilePanel(null)}>
          <div
            className="absolute bottom-0 left-0 right-0 h-[70vh] p-3 pb-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative h-full">
              <button
                className="absolute -top-2 right-2 z-10 w-8 h-8 grid place-items-center rounded-full glass shadow-lg"
                onClick={() => setMobilePanel(null)}
              ><X size={16} /></button>
              {mobilePanel === 'left' ? <Sidebar /> : <EditorPanel />}
            </div>
          </div>
        </div>
      )}

      {/* Dosya sürükleme ipucu */}
      {dropHint && (
        <div className="fixed inset-0 z-30 pointer-events-none flex items-center justify-center bg-blue-500/10 border-4 border-dashed border-blue-500/60 rounded-2xl m-2">
          <p className="glass rounded-xl px-5 py-3 font-semibold text-sm shadow-xl">
            Fotoğrafları buraya bırakın 📸
          </p>
        </div>
      )}

      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      {showBuilder && <CustomLayoutBuilder onClose={() => setShowBuilder(false)} />}
    </div>
  )
}

function MobileBtn({ icon: Icon, label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl text-[10px] font-medium transition-colors
        ${active ? 'text-blue-500 bg-blue-500/10' : 'text-slate-500 dark:text-slate-400'}`}
    >
      <Icon size={18} />
      {label}
    </button>
  )
}

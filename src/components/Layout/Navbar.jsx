import { Undo2, Redo2, Sun, Moon, Download, PencilRuler, ZoomIn, ZoomOut, LayoutDashboard } from 'lucide-react'
import { useCollageStore } from '../../hooks/useCollageStore'

export default function Navbar({ onExport, onCustomBuilder }) {
  const { undo, redo, past, future, theme, setTheme, canvasZoom, setCanvasZoom } = useCollageStore()

  return (
    <header className="glass rounded-2xl flex items-center gap-2 px-3 py-2">
      <div className="flex items-center gap-2 mr-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 grid place-items-center text-white shadow-md shadow-blue-500/30">
          <LayoutDashboard size={17} />
        </div>
        <h1 className="font-bold text-sm sm:text-base tracking-tight">Kolaj Yapıcı</h1>
      </div>

      <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block" />

      <button className="btn-icon disabled:opacity-30" onClick={undo} disabled={!past.length} title="Geri al (Ctrl+Z)">
        <Undo2 size={17} />
      </button>
      <button className="btn-icon disabled:opacity-30" onClick={redo} disabled={!future.length} title="Yinele (Ctrl+Y)">
        <Redo2 size={17} />
      </button>

      <div className="hidden md:flex items-center gap-1 ml-1">
        <button className="btn-icon" onClick={() => setCanvasZoom(canvasZoom - 0.1)} title="Uzaklaştır"><ZoomOut size={16} /></button>
        <span className="text-xs w-10 text-center text-slate-500 tabular-nums">{Math.round(canvasZoom * 100)}%</span>
        <button className="btn-icon" onClick={() => setCanvasZoom(canvasZoom + 0.1)} title="Yakınlaştır"><ZoomIn size={16} /></button>
      </div>

      <div className="flex-1" />

      <button className="btn hidden sm:inline-flex" onClick={onCustomBuilder}>
        <PencilRuler size={15} /> Özel Düzen
      </button>
      <button
        className="btn-icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        title={theme === 'dark' ? 'Açık tema' : 'Koyu tema'}
      >
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>
      <button className="btn-primary" onClick={onExport}>
        <Download size={15} /> <span className="hidden sm:inline">Dışa Aktar</span>
      </button>
    </header>
  )
}

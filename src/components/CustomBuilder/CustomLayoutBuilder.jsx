import { useMemo, useRef, useState } from 'react'
import { X, Grid3X3, MousePointerSquareDashed, Plus, Trash2, Combine, Split, ArrowUp, ArrowDown, Save, FileDown, FileUp, Magnet } from 'lucide-react'
import { useCollageStore } from '../../hooks/useCollageStore'
import { parseAspect } from '../Templates/templates-data'

const ASPECTS = ['1:1', '4:5', '3:4', '4:3', '16:9', '9:16']

// Özel düzen oluşturucu: Izgara modu + Serbest yerleştirme modu
export default function CustomLayoutBuilder({ onClose }) {
  const { saveMyTemplate, setTemplate } = useCollageStore()
  const [mode, setMode] = useState('grid')
  const [name, setName] = useState('Özel Düzenim')
  const [aspect, setAspect] = useState('1:1')

  // --- Izgara modu durumu ---
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [colW, setColW] = useState([1, 1, 1, 1, 1, 1])
  const [rowH, setRowH] = useState([1, 1, 1, 1, 1, 1])
  const [merges, setMerges] = useState([]) // { r, c, rs, cs }
  const [selection, setSelection] = useState([]) // ["r,c"]

  // --- Serbest mod durumu ---
  const [frames, setFrames] = useState([
    { id: 1, x: 8, y: 8, w: 40, h: 40 },
    { id: 2, x: 52, y: 30, w: 40, h: 40 },
  ])
  const [snap, setSnap] = useState(true)
  const [activeFrame, setActiveFrame] = useState(null)
  const frameIdRef = useRef(3)
  const boxRef = useRef(null)
  const gesture = useRef(null)
  const fileRef = useRef(null)

  // Izgara → slot listesi
  const gridSlots = useMemo(() => {
    const cw = colW.slice(0, cols)
    const rh = rowH.slice(0, rows)
    const totW = cw.reduce((a, b) => a + b, 0)
    const totH = rh.reduce((a, b) => a + b, 0)
    const xAt = (c) => (cw.slice(0, c).reduce((a, b) => a + b, 0) / totW) * 100
    const yAt = (r) => (rh.slice(0, r).reduce((a, b) => a + b, 0) / totH) * 100

    const covered = new Set()
    for (const m of merges) {
      for (let r = m.r; r < m.r + m.rs; r++)
        for (let c = m.c; c < m.c + m.cs; c++)
          if (r !== m.r || c !== m.c) covered.add(`${r},${c}`)
    }
    const slots = []
    let id = 0
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (covered.has(`${r},${c}`)) continue
        const m = merges.find(m => m.r === r && m.c === c)
        const rs = m ? m.rs : 1
        const cs = m ? m.cs : 1
        slots.push({
          id: ++id,
          key: `${r},${c}`,
          x: xAt(c), y: yAt(r),
          width: xAt(Math.min(cols, c + cs)) - xAt(c) || 100 - xAt(c),
          height: yAt(Math.min(rows, r + rs)) - yAt(r) || 100 - yAt(r),
        })
      }
    }
    return slots
  }, [rows, cols, colW, rowH, merges])

  const mergeSelection = () => {
    if (selection.length < 2) return
    // Seçimin (span'ler dahil) sınırlayıcı kutusunu birleştir
    let r0 = Infinity, c0 = Infinity, r1 = -1, c1 = -1
    for (const key of selection) {
      const [r, c] = key.split(',').map(Number)
      const m = merges.find(m => m.r === r && m.c === c)
      r0 = Math.min(r0, r); c0 = Math.min(c0, c)
      r1 = Math.max(r1, r + (m ? m.rs : 1) - 1)
      c1 = Math.max(c1, c + (m ? m.cs : 1) - 1)
    }
    const next = merges.filter(m => m.r + m.rs - 1 < r0 || m.r > r1 || m.c + m.cs - 1 < c0 || m.c > c1)
    next.push({ r: r0, c: c0, rs: r1 - r0 + 1, cs: c1 - c0 + 1 })
    setMerges(next)
    setSelection([])
  }

  const splitSelection = () => {
    setMerges(merges.filter(m => !selection.includes(`${m.r},${m.c}`)))
    setSelection([])
  }

  // --- Serbest mod: sürükleme / boyutlandırma ---
  const snapVal = (v) => snap ? Math.round(v / 5) * 5 : Math.round(v * 10) / 10
  const startGesture = (e, frame, type) => {
    e.stopPropagation()
    setActiveFrame(frame.id)
    e.currentTarget.setPointerCapture(e.pointerId)
    const rect = boxRef.current.getBoundingClientRect()
    gesture.current = { type, id: frame.id, startX: e.clientX, startY: e.clientY, f: { ...frame }, bw: rect.width, bh: rect.height }
  }
  const moveGesture = (e) => {
    const g = gesture.current
    if (!g) return
    const dx = ((e.clientX - g.startX) / g.bw) * 100
    const dy = ((e.clientY - g.startY) / g.bh) * 100
    setFrames(fs => fs.map(f => {
      if (f.id !== g.id) return f
      if (g.type === 'move') {
        return {
          ...f,
          x: Math.min(100 - f.w, Math.max(0, snapVal(g.f.x + dx))),
          y: Math.min(100 - f.h, Math.max(0, snapVal(g.f.y + dy))),
        }
      }
      return {
        ...f,
        w: Math.min(100 - f.x, Math.max(8, snapVal(g.f.w + dx))),
        h: Math.min(100 - f.y, Math.max(8, snapVal(g.f.h + dy))),
      }
    }))
  }
  const endGesture = () => { gesture.current = null }

  const moveLayer = (id, dir) => {
    setFrames(fs => {
      const i = fs.findIndex(f => f.id === id)
      const j = i + dir
      if (j < 0 || j >= fs.length) return fs
      const next = [...fs]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  const buildTemplate = () => {
    const slots = (mode === 'grid' ? gridSlots : frames.map((f, i) => ({ id: i + 1, x: f.x, y: f.y, width: f.w, height: f.h })))
      .map(({ key, ...s }) => s)
    return {
      id: `custom-${Date.now()}`,
      name: name.trim() || 'Özel Düzen',
      category: 'custom',
      aspectRatio: aspect,
      gap: 4,
      slots,
    }
  }

  const save = () => {
    const t = buildTemplate()
    if (!t.slots.length) return
    saveMyTemplate(t)
    setTemplate(t)
    onClose()
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(buildTemplate(), null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${name.trim() || 'ozel-duzen'}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importJson = (file) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const t = JSON.parse(reader.result)
        if (!Array.isArray(t.slots) || !t.slots.length) throw new Error('geçersiz')
        const tpl = { ...t, id: `custom-${Date.now()}`, category: 'custom' }
        saveMyTemplate(tpl)
        setTemplate(tpl)
        onClose()
      } catch {
        alert('Geçersiz şablon dosyası.')
      }
    }
    reader.readAsText(file)
  }

  const previewAspect = parseAspect(aspect)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3" onClick={onClose}>
      <div className="glass rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col p-4 shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base">Özel Düzen Oluşturucu</h2>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="flex gap-1 bg-slate-200/70 dark:bg-slate-800/70 rounded-xl p-1">
            <button
              onClick={() => setMode('grid')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors
                ${mode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}
            ><Grid3X3 size={14} /> Izgara</button>
            <button
              onClick={() => setMode('free')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors
                ${mode === 'free' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}
            ><MousePointerSquareDashed size={14} /> Serbest</button>
          </div>
          <input className="input-text !w-40" value={name} onChange={e => setName(e.target.value)} placeholder="Şablon adı" />
          <select className="input-text !w-24" value={aspect} onChange={e => setAspect(e.target.value)}>
            {ASPECTS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="grid md:grid-cols-[1fr_220px] gap-4 flex-1 min-h-0">
          {/* Önizleme alanı */}
          <div className="flex items-center justify-center bg-slate-200/50 dark:bg-slate-800/40 rounded-xl p-3 min-h-[300px]">
            <div
              ref={boxRef}
              className="relative bg-slate-300/60 dark:bg-slate-900 rounded-lg overflow-hidden w-full"
              style={{ aspectRatio: previewAspect, maxHeight: 380, maxWidth: previewAspect < 1 ? 380 * previewAspect : undefined, margin: '0 auto' }}
              onPointerMove={mode === 'free' ? moveGesture : undefined}
              onPointerUp={endGesture}
              onPointerDown={() => setActiveFrame(null)}
            >
              {mode === 'grid' && gridSlots.map(s => (
                <div
                  key={s.key}
                  onPointerDown={e => e.stopPropagation()}
                  onClick={() => setSelection(sel => sel.includes(s.key) ? sel.filter(k => k !== s.key) : [...sel, s.key])}
                  className={`absolute rounded-md cursor-pointer transition-colors border-2
                    ${selection.includes(s.key)
                      ? 'bg-blue-500/40 border-blue-500'
                      : 'bg-slate-400/40 dark:bg-slate-600/40 border-transparent hover:border-blue-400'}`}
                  style={{
                    left: `calc(${s.x}% + 2px)`, top: `calc(${s.y}% + 2px)`,
                    width: `calc(${s.width}% - 4px)`, height: `calc(${s.height}% - 4px)`,
                  }}
                />
              ))}

              {mode === 'free' && (
                <>
                  {snap && (
                    <div className="absolute inset-0 pointer-events-none opacity-30"
                      style={{
                        backgroundImage: 'linear-gradient(rgba(59,130,246,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,.35) 1px, transparent 1px)',
                        backgroundSize: '5% 5%',
                      }} />
                  )}
                  {frames.map((f, i) => (
                    <div
                      key={f.id}
                      className={`absolute rounded-md cursor-move flex items-center justify-center text-[10px] font-bold border-2
                        ${activeFrame === f.id
                          ? 'bg-blue-500/40 border-blue-500 z-10'
                          : 'bg-slate-400/50 dark:bg-slate-600/50 border-slate-400 dark:border-slate-500'}`}
                      style={{ left: `${f.x}%`, top: `${f.y}%`, width: `${f.w}%`, height: `${f.h}%` }}
                      onPointerDown={e => startGesture(e, f, 'move')}
                      onPointerMove={moveGesture}
                      onPointerUp={endGesture}
                    >
                      {i + 1}
                      <div
                        className="absolute -right-1 -bottom-1 w-3.5 h-3.5 rounded-sm bg-blue-500 cursor-se-resize"
                        onPointerDown={e => startGesture(e, f, 'resize')}
                        onPointerMove={moveGesture}
                        onPointerUp={endGesture}
                      />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Kontroller */}
          <div className="space-y-3 overflow-y-auto pr-1">
            {mode === 'grid' ? (
              <>
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Satır</span><b>{rows}</b></div>
                  <input type="range" min={1} max={6} value={rows} className="input-range"
                    onChange={e => { setRows(Number(e.target.value)); setMerges([]); setSelection([]) }} />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Sütun</span><b>{cols}</b></div>
                  <input type="range" min={1} max={6} value={cols} className="input-range"
                    onChange={e => { setCols(Number(e.target.value)); setMerges([]); setSelection([]) }} />
                </div>
                <div className="flex gap-1.5">
                  <button className="btn flex-1 !text-xs" onClick={mergeSelection} disabled={selection.length < 2}>
                    <Combine size={13} /> Birleştir
                  </button>
                  <button className="btn flex-1 !text-xs" onClick={splitSelection} disabled={!selection.length}>
                    <Split size={13} /> Ayır
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Hücrelere tıklayıp seçin, ardından birleştirin. Birleşik hücreyi seçip "Ayır" ile geri bölebilirsiniz.
                </p>
                <p className="panel-title">Sütun Genişlikleri</p>
                {Array.from({ length: cols }).map((_, c) => (
                  <input key={c} type="range" min={0.5} max={3} step={0.25} value={colW[c]} className="input-range"
                    onChange={e => setColW(w => w.map((v, i) => i === c ? Number(e.target.value) : v))} />
                ))}
                <p className="panel-title">Satır Yükseklikleri</p>
                {Array.from({ length: rows }).map((_, r) => (
                  <input key={r} type="range" min={0.5} max={3} step={0.25} value={rowH[r]} className="input-range"
                    onChange={e => setRowH(h => h.map((v, i) => i === r ? Number(e.target.value) : v))} />
                ))}
              </>
            ) : (
              <>
                <button className="btn w-full !text-xs" onClick={() => {
                  const id = frameIdRef.current++
                  setFrames(fs => [...fs, { id, x: 30, y: 30, w: 30, h: 30 }])
                  setActiveFrame(id)
                }}>
                  <Plus size={14} /> Çerçeve Ekle
                </button>
                <button
                  className={`btn w-full !text-xs ${snap ? '!bg-blue-500/20 !text-blue-500' : ''}`}
                  onClick={() => setSnap(s => !s)}
                >
                  <Magnet size={13} /> Izgaraya Hizala: {snap ? 'Açık' : 'Kapalı'}
                </button>
                {activeFrame != null && (
                  <div className="flex gap-1.5">
                    <button className="btn flex-1 !px-1 !text-xs" title="Arkaya" onClick={() => moveLayer(activeFrame, -1)}><ArrowDown size={13} /></button>
                    <button className="btn flex-1 !px-1 !text-xs" title="Öne" onClick={() => moveLayer(activeFrame, 1)}><ArrowUp size={13} /></button>
                    <button className="btn flex-1 !px-1 !text-xs !text-red-500" title="Sil"
                      onClick={() => { setFrames(fs => fs.filter(f => f.id !== activeFrame)); setActiveFrame(null) }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Çerçeveleri sürükleyin, sağ alt köşeden boyutlandırın. Ok tuşları katman sırasını değiştirir.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button className="btn-primary flex-1" onClick={save}>
            <Save size={15} /> Kaydet ve Uygula
          </button>
          <button className="btn" onClick={exportJson} title="Düzeni JSON olarak indir">
            <FileDown size={15} /> JSON
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()} title="JSON şablon yükle">
            <FileUp size={15} /> İçe Aktar
          </button>
          <input ref={fileRef} type="file" accept=".json,application/json" className="hidden"
            onChange={e => { if (e.target.files?.[0]) importJson(e.target.files[0]); e.target.value = '' }} />
        </div>
      </div>
    </div>
  )
}

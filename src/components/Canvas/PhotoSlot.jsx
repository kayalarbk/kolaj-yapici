import { useRef, useEffect } from 'react'
import { ImagePlus, RotateCw, FlipHorizontal2, FlipVertical2, ZoomIn, ZoomOut, RefreshCw, Trash2 } from 'lucide-react'
import { useCollageStore, filterCss, SHAPE_CLIPS, fileToDataUrl } from '../../hooks/useCollageStore'

export default function PhotoSlot({ slot, gap }) {
  const {
    slotContents, photos, settings, filters, selectedSlot,
    selectSlot, setSlotPhoto, swapSlots, updateSlotContent, clearSlot, pushHistory, addPhotos,
  } = useCollageStore()

  const content = slotContents[slot.id]
  const photo = content?.photoId ? photos.find(p => p.id === content.photoId) : null
  const selected = selectedSlot === slot.id
  const innerRef = useRef(null)
  const fileRef = useRef(null)
  const drag = useRef(null)
  const lastWheel = useRef(0)

  // Kaydırma tekerleği ile zoom (pasif olmayan dinleyici gerekli)
  useEffect(() => {
    const el = innerRef.current
    if (!el || !photo) return
    const onWheel = (e) => {
      e.preventDefault()
      const now = Date.now()
      if (now - lastWheel.current > 600) pushHistory()
      lastWheel.current = now
      const c = useCollageStore.getState().slotContents[slot.id]
      if (!c) return
      const scale = Math.min(5, Math.max(0.2, c.scale * (1 - e.deltaY * 0.0012)))
      updateSlotContent(slot.id, { scale })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [photo, slot.id, pushHistory, updateSlotContent])

  const onPointerDown = (e) => {
    selectSlot(slot.id)
    if (!photo || e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const rect = innerRef.current.getBoundingClientRect()
    drag.current = {
      startX: e.clientX, startY: e.clientY,
      ox: content.offsetX, oy: content.offsetY,
      w: rect.width, h: rect.height, moved: false,
    }
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d) return
    const dx = ((e.clientX - d.startX) / d.w) * 100
    const dy = ((e.clientY - d.startY) / d.h) * 100
    if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > 3) {
      d.moved = true
      pushHistory()
    }
    if (d.moved) updateSlotContent(slot.id, { offsetX: d.ox + dx, offsetY: d.oy + dy })
  }
  const onPointerUp = () => { drag.current = null }

  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const fromSlot = e.dataTransfer.getData('slot-id')
    const photoId = e.dataTransfer.getData('photo-id')
    if (fromSlot && Number(fromSlot) !== slot.id) swapSlots(Number(fromSlot), slot.id)
    else if (photoId) setSlotPhoto(slot.id, photoId)
    else if (e.dataTransfer.files?.length) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('image/')) placeFile(file)
    }
  }

  const placeFile = async (file) => {
    const p = { id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, url: await fileToDataUrl(file), name: file.name }
    useCollageStore.setState(s => ({ photos: [...s.photos, p] }))
    setSlotPhoto(slot.id, p.id)
  }

  const radius = slot.shape === 'circle' ? '50%' : (slot.radius ?? `${settings.cornerRadius}px`)
  const clip = slot.clip || SHAPE_CLIPS[slot.shape]
  const sx = content?.flipH ? -1 : 1
  const sy = content?.flipV ? -1 : 1

  return (
    <div
      className="absolute"
      style={{ left: `${slot.x}%`, top: `${slot.y}%`, width: `${slot.width}%`, height: `${slot.height}%`, padding: gap / 2 }}
      onDragOver={e => e.preventDefault()}
      onDrop={onDrop}
    >
      <div
        ref={innerRef}
        className={`relative w-full h-full overflow-hidden transition-shadow select-none
          ${photo ? 'cursor-move' : 'cursor-pointer'}
          ${selected && !clip ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-transparent' : ''}`}
        style={{
          borderRadius: radius,
          clipPath: clip,
          border: settings.borderWidth > 0 ? `${settings.borderWidth}px solid ${settings.borderColor}` : undefined,
          background: photo ? '#000' : 'rgba(148,163,184,0.12)',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={() => { if (!photo) fileRef.current?.click() }}
        draggable={!!photo}
        onDragStart={e => {
          e.dataTransfer.setData('slot-id', String(slot.id))
          e.dataTransfer.effectAllowed = 'move'
        }}
      >
        {photo ? (
          <img
            src={photo.url}
            alt=""
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
            style={{
              transform: `translate(${content.offsetX}%, ${content.offsetY}%) rotate(${content.rotation}deg) scale(${content.scale * sx}, ${content.scale * sy})`,
              filter: filterCss(filters),
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400 border-2 border-dashed border-slate-400/40"
            style={{ borderRadius: radius }}>
            <ImagePlus size={Math.min(22, 16 + slot.width / 10)} />
            <span className="text-[10px] font-medium hidden sm:block">Fotoğraf ekle</span>
          </div>
        )}
      </div>

      {/* Seçili yuva araç çubuğu */}
      {selected && photo && (
        <div
          data-export-hide
          className="absolute left-1/2 -translate-x-1/2 top-1 z-20 flex flex-wrap justify-center gap-0.5 glass rounded-lg p-1 shadow-lg"
          onPointerDown={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
        >
          <MiniBtn title="Döndür (90°)" onClick={() => { pushHistory(); updateSlotContent(slot.id, { rotation: (content.rotation + 90) % 360 }) }}><RotateCw size={13} /></MiniBtn>
          <MiniBtn title="Yatay çevir" onClick={() => { pushHistory(); updateSlotContent(slot.id, { flipH: !content.flipH }) }}><FlipHorizontal2 size={13} /></MiniBtn>
          <MiniBtn title="Dikey çevir" onClick={() => { pushHistory(); updateSlotContent(slot.id, { flipV: !content.flipV }) }}><FlipVertical2 size={13} /></MiniBtn>
          <MiniBtn title="Yakınlaştır" onClick={() => { pushHistory(); updateSlotContent(slot.id, { scale: Math.min(5, content.scale * 1.15) }) }}><ZoomIn size={13} /></MiniBtn>
          <MiniBtn title="Uzaklaştır" onClick={() => { pushHistory(); updateSlotContent(slot.id, { scale: Math.max(0.2, content.scale / 1.15) }) }}><ZoomOut size={13} /></MiniBtn>
          <MiniBtn title="Değiştir" onClick={() => fileRef.current?.click()}><RefreshCw size={13} /></MiniBtn>
          <MiniBtn title="Kaldır" danger onClick={() => clearSlot(slot.id)}><Trash2 size={13} /></MiniBtn>
        </div>
      )}

      <input
        ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={e => { if (e.target.files?.[0]) placeFile(e.target.files[0]); e.target.value = '' }}
      />
    </div>
  )
}

function MiniBtn({ children, title, danger, onClick }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded-md transition-colors ${danger
        ? 'text-red-500 hover:bg-red-500/15'
        : 'text-slate-600 dark:text-slate-300 hover:bg-blue-500/15 hover:text-blue-500'}`}
    >
      {children}
    </button>
  )
}

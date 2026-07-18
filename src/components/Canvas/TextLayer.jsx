import { useRef } from 'react'
import { useCollageStore } from '../../hooks/useCollageStore'

// Kolaj üzerine sürüklenebilir metin kutuları
export default function TextLayer({ canvasWidth }) {
  const { texts, selectedText, selectText, updateText, pushHistory } = useCollageStore()
  const drag = useRef(null)

  if (!texts.length) return null

  return (
    <>
      {texts.map(t => (
        <div
          key={t.id}
          className={`absolute z-10 cursor-move whitespace-pre px-1 leading-tight
            ${selectedText === t.id ? 'outline outline-2 outline-blue-500 outline-dashed rounded' : ''}`}
          style={{
            left: `${t.x}%`, top: `${t.y}%`,
            transform: 'translate(-50%, -50%)',
            fontFamily: `'${t.fontFamily}', sans-serif`,
            fontSize: (t.fontSize / 100) * canvasWidth,
            fontWeight: t.weight,
            color: t.color,
            textShadow: t.shadow ? '0 2px 8px rgba(0,0,0,0.55)' : 'none',
          }}
          onPointerDown={e => {
            e.stopPropagation()
            selectText(t.id)
            e.currentTarget.setPointerCapture(e.pointerId)
            const parent = e.currentTarget.parentElement.getBoundingClientRect()
            drag.current = { id: t.id, startX: e.clientX, startY: e.clientY, x: t.x, y: t.y, pw: parent.width, ph: parent.height, moved: false }
          }}
          onPointerMove={e => {
            const d = drag.current
            if (!d || d.id !== t.id) return
            if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > 3) {
              d.moved = true
              pushHistory()
            }
            if (d.moved) {
              updateText(t.id, {
                x: Math.min(100, Math.max(0, d.x + ((e.clientX - d.startX) / d.pw) * 100)),
                y: Math.min(100, Math.max(0, d.y + ((e.clientY - d.startY) / d.ph) * 100)),
              })
            }
          }}
          onPointerUp={() => { drag.current = null }}
        >
          {t.text}
        </div>
      ))}
    </>
  )
}

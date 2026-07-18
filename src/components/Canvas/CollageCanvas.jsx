import { useEffect, useRef, useState } from 'react'
import { useCollageStore, backgroundCss } from '../../hooks/useCollageStore'
import { parseAspect } from '../Templates/templates-data'
import PhotoSlot from './PhotoSlot'
import TextLayer from './TextLayer'

// Şablona göre kolajı çizen merkez tuval
export default function CollageCanvas() {
  const { template, settings, canvasZoom, selectSlot, selectText } = useCollageStore()
  const containerRef = useRef(null)
  const [dims, setDims] = useState({ w: 400, h: 400 })

  const ar = parseAspect(template.aspectRatio)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const compute = () => {
      const pad = 24
      const cw = el.clientWidth - pad
      const ch = el.clientHeight - pad
      let w = cw
      let h = w / ar
      if (h > ch) { h = ch; w = h * ar }
      setDims({ w: Math.max(80, w), h: Math.max(80, h) })
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ar])

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center overflow-hidden min-h-0"
      onPointerDown={() => { selectSlot(null); selectText(null) }}
    >
      <div style={{ transform: `scale(${canvasZoom})`, transition: 'transform 0.15s ease' }}>
        <div
          id="collage-canvas"
          className="relative shadow-2xl shadow-black/40 overflow-hidden"
          style={{
            width: dims.w, height: dims.h,
            padding: settings.gap / 2,
            borderRadius: Math.min(16, settings.cornerRadius + 4),
            ...backgroundCss(settings),
          }}
          onPointerDown={e => e.stopPropagation()}
        >
          <div className="relative w-full h-full">
            {template.slots.map(slot => (
              <PhotoSlot key={`${template.id}-${slot.id}`} slot={slot} gap={settings.gap} />
            ))}
            <TextLayer canvasWidth={dims.w} />
          </div>
        </div>
      </div>
    </div>
  )
}

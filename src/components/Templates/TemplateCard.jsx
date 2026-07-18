import { parseAspect } from './templates-data'

// Şablonun SVG önizlemesi
export function TemplatePreview({ template, className = '' }) {
  const ar = parseAspect(template.aspectRatio)
  return (
    <div className={`w-full ${className}`} style={{ aspectRatio: Math.max(0.5, Math.min(2.2, ar)) }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        {template.slots.map((s, i) => {
          const common = { fill: 'currentColor', className: 'text-slate-400 dark:text-slate-500', opacity: 0.55 + (i % 3) * 0.15 }
          if (s.shape === 'circle') {
            return <ellipse key={i} cx={s.x + s.width / 2} cy={s.y + s.height / 2} rx={s.width / 2 - 1.5} ry={s.height / 2 - 1.5} {...common} />
          }
          if (s.shape === 'diamond') {
            const cx = s.x + s.width / 2, cy = s.y + s.height / 2
            return <polygon key={i} points={`${cx},${s.y + 1} ${s.x + s.width - 1},${cy} ${cx},${s.y + s.height - 1} ${s.x + 1},${cy}`} {...common} />
          }
          if (s.shape === 'hex') {
            const { x, y, width: w, height: h } = s
            return <polygon key={i} points={`${x + w * 0.25},${y + 1} ${x + w * 0.75},${y + 1} ${x + w - 1},${y + h / 2} ${x + w * 0.75},${y + h - 1} ${x + w * 0.25},${y + h - 1} ${x + 1},${y + h / 2}`} {...common} />
          }
          return <rect key={i} x={s.x + 1} y={s.y + 1} width={Math.max(2, s.width - 2)} height={Math.max(2, s.height - 2)} rx={2.5} {...common} />
        })}
      </svg>
    </div>
  )
}

export default function TemplateCard({ template, active, onClick, onDelete }) {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full rounded-xl p-2 transition-all text-left
        ${active
          ? 'bg-blue-500/15 ring-2 ring-blue-500'
          : 'bg-slate-200/60 dark:bg-slate-800/60 hover:bg-slate-300/60 dark:hover:bg-slate-700/60'}`}
    >
      <TemplatePreview template={template} />
      <div className="mt-1.5 text-[11px] font-medium truncate text-slate-600 dark:text-slate-300">
        {template.name}
      </div>
      {onDelete && (
        <span
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="absolute top-1 right-1 hidden group-hover:flex items-center justify-center w-5 h-5 rounded-md bg-red-500/90 text-white text-xs"
          title="Şablonu sil"
        >×</span>
      )}
    </button>
  )
}

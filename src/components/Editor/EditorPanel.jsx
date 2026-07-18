import { useState } from 'react'
import { SlidersHorizontal, Paintbrush, Wand2, Type, Plus, Trash2 } from 'lucide-react'
import { useCollageStore, FILTER_PRESETS } from '../../hooks/useCollageStore'

const SWATCHES = ['#0f172a', '#ffffff', '#000000', '#f1f5f9', '#fecaca', '#fde68a', '#bbf7d0', '#bfdbfe', '#ddd6fe', '#fbcfe8', '#3B82F6', '#ef4444', '#22c55e', '#eab308', '#a855f7']
const FONTS = ['Inter', 'Poppins', 'Montserrat', 'Playfair Display', 'Oswald', 'Raleway', 'Merriweather', 'Bebas Neue', 'Anton', 'Lobster', 'Pacifico', 'Dancing Script', 'Caveat', 'Satisfy', 'Shadows Into Light']

export default function EditorPanel() {
  const [tab, setTab] = useState('layout')
  const tabs = [
    { id: 'layout', icon: SlidersHorizontal, label: 'Düzen' },
    { id: 'bg', icon: Paintbrush, label: 'Arka Plan' },
    { id: 'filters', icon: Wand2, label: 'Filtre' },
    { id: 'text', icon: Type, label: 'Metin' },
  ]

  return (
    <aside className="glass rounded-2xl flex flex-col h-full min-h-0 p-3 w-full">
      <div className="grid grid-cols-4 gap-1 mb-3 bg-slate-200/70 dark:bg-slate-800/70 rounded-xl p-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-semibold transition-colors
              ${tab === t.id ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-4">
        {tab === 'layout' && <LayoutSection />}
        {tab === 'bg' && <BackgroundSection />}
        {tab === 'filters' && <FilterSection />}
        {tab === 'text' && <TextSection />}
      </div>
    </aside>
  )
}

function Slider({ label, value, min, max, step = 1, unit = '', onChange, onCommit }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
        <span className="text-xs font-medium tabular-nums">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        className="input-range"
        onPointerDown={onCommit}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  )
}

function ColorField({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <input
        type="color" value={value}
        onChange={e => onChange(e.target.value)}
        className="w-9 h-7 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent cursor-pointer"
      />
    </div>
  )
}

// ---- Düzen: boşluk, köşe, kenarlık ----
function LayoutSection() {
  const { settings, setSettings, pushHistory } = useCollageStore()
  const commit = () => pushHistory()
  return (
    <>
      <p className="panel-title">Genel Düzen</p>
      <Slider label="Fotoğraf Boşluğu" value={settings.gap} min={0} max={30} unit="px" onCommit={commit} onChange={v => setSettings({ gap: v }, false)} />
      <Slider label="Köşe Yuvarlaklığı" value={settings.cornerRadius} min={0} max={30} unit="px" onCommit={commit} onChange={v => setSettings({ cornerRadius: v }, false)} />
      <Slider label="Kenarlık Kalınlığı" value={settings.borderWidth} min={0} max={20} unit="px" onCommit={commit} onChange={v => setSettings({ borderWidth: v }, false)} />
      <ColorField label="Kenarlık Rengi" value={settings.borderColor} onChange={v => setSettings({ borderColor: v }, false)} />
      <p className="text-[10px] text-slate-400 leading-relaxed pt-2 border-t border-slate-200 dark:border-slate-800">
        İpucu: Fotoğrafı yuva içinde sürükleyerek konumlandırın, fare tekerleği ile yakınlaştırın. Yuvaları birbirine sürükleyerek yer değiştirin.
      </p>
    </>
  )
}

// ---- Arka plan ----
function BackgroundSection() {
  const { settings, setSettings, pushHistory } = useCollageStore()
  const types = [
    { id: 'solid', label: 'Düz Renk' },
    { id: 'gradient', label: 'Gradyan' },
    { id: 'pattern', label: 'Desen' },
  ]
  return (
    <>
      <p className="panel-title">Arka Plan</p>
      <div className="grid grid-cols-3 gap-1">
        {types.map(t => (
          <button
            key={t.id}
            onClick={() => setSettings({ bgType: t.id })}
            className={`rounded-lg py-1.5 text-[11px] font-medium transition-colors
              ${settings.bgType === t.id ? 'bg-accent text-white' : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {settings.bgType !== 'gradient' && (
        <>
          <div className="grid grid-cols-5 gap-1.5">
            {SWATCHES.map(c => (
              <button
                key={c}
                onClick={() => { pushHistory(); setSettings({ bgColor: c }, false) }}
                className={`aspect-square rounded-lg border-2 transition-transform hover:scale-110
                  ${settings.bgColor === c ? 'border-blue-500' : 'border-slate-300/50 dark:border-slate-700/50'}`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
          <ColorField label="Özel Renk" value={settings.bgColor} onChange={v => setSettings({ bgColor: v }, false)} />
        </>
      )}

      {settings.bgType === 'gradient' && (
        <>
          <ColorField label="Başlangıç" value={settings.gradFrom} onChange={v => setSettings({ gradFrom: v }, false)} />
          <ColorField label="Bitiş" value={settings.gradTo} onChange={v => setSettings({ gradTo: v }, false)} />
          <Slider label="Açı" value={settings.gradAngle} min={0} max={360} unit="°" onCommit={() => pushHistory()} onChange={v => setSettings({ gradAngle: v }, false)} />
        </>
      )}

      {settings.bgType === 'pattern' && (
        <>
          <div className="grid grid-cols-3 gap-1">
            {[['dots', 'Noktalar'], ['lines', 'Çizgiler'], ['grid', 'Izgara']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setSettings({ pattern: id })}
                className={`rounded-lg py-1.5 text-[11px] font-medium transition-colors
                  ${settings.pattern === id ? 'bg-accent text-white' : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <ColorField label="Desen Rengi" value={settings.patternColor} onChange={v => setSettings({ patternColor: v }, false)} />
        </>
      )}
    </>
  )
}

// ---- Filtreler ----
function FilterSection() {
  const { filters, setFilters, applyPreset, pushHistory } = useCollageStore()
  const commit = () => pushHistory()
  return (
    <>
      <p className="panel-title">Hazır Filtreler</p>
      <div className="grid grid-cols-4 gap-1">
        {FILTER_PRESETS.map(p => (
          <button
            key={p.name}
            onClick={() => applyPreset(p)}
            className="rounded-lg py-1.5 text-[10px] font-medium bg-slate-200 dark:bg-slate-800 hover:bg-blue-500/20 hover:text-blue-500 transition-colors"
          >
            {p.name}
          </button>
        ))}
      </div>
      <p className="panel-title pt-1">İnce Ayar</p>
      <Slider label="Parlaklık" value={filters.brightness} min={40} max={180} unit="%" onCommit={commit} onChange={v => setFilters({ brightness: v }, false)} />
      <Slider label="Kontrast" value={filters.contrast} min={40} max={180} unit="%" onCommit={commit} onChange={v => setFilters({ contrast: v }, false)} />
      <Slider label="Doygunluk" value={filters.saturate} min={0} max={220} unit="%" onCommit={commit} onChange={v => setFilters({ saturate: v }, false)} />
      <Slider label="Bulanıklık" value={filters.blur} min={0} max={10} step={0.5} unit="px" onCommit={commit} onChange={v => setFilters({ blur: v }, false)} />
      <Slider label="Sepya" value={filters.sepia} min={0} max={100} unit="%" onCommit={commit} onChange={v => setFilters({ sepia: v }, false)} />
      <Slider label="Siyah-Beyaz" value={filters.grayscale} min={0} max={100} unit="%" onCommit={commit} onChange={v => setFilters({ grayscale: v }, false)} />
    </>
  )
}

// ---- Metin ----
function TextSection() {
  const { texts, selectedText, addText, updateText, removeText, selectText, pushHistory } = useCollageStore()
  const active = texts.find(t => t.id === selectedText) || texts[texts.length - 1]

  return (
    <>
      <button className="btn-primary w-full" onClick={addText}>
        <Plus size={15} /> Metin Ekle
      </button>

      {texts.length > 0 && (
        <div className="space-y-1">
          {texts.map(t => (
            <div
              key={t.id}
              onClick={() => selectText(t.id)}
              className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-xs cursor-pointer transition-colors
                ${active?.id === t.id ? 'bg-blue-500/15 ring-1 ring-blue-500' : 'bg-slate-200/70 dark:bg-slate-800/70 hover:bg-slate-300/70 dark:hover:bg-slate-700/70'}`}
            >
              <span className="truncate">{t.text || '(boş)'}</span>
              <button onClick={e => { e.stopPropagation(); removeText(t.id) }} className="text-red-400 hover:text-red-500 ml-2">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {active && (
        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <textarea
            rows={2}
            className="input-text resize-none"
            value={active.text}
            onFocus={() => pushHistory()}
            onChange={e => updateText(active.id, { text: e.target.value })}
            placeholder="Metin girin..."
          />
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Yazı Tipi</span>
            <select
              className="input-text"
              value={active.fontFamily}
              onChange={e => updateText(active.id, { fontFamily: e.target.value }, true)}
            >
              {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
            </select>
          </div>
          <Slider label="Boyut" value={active.fontSize} min={2} max={20} step={0.5} onCommit={() => pushHistory()} onChange={v => updateText(active.id, { fontSize: v })} />
          <ColorField label="Renk" value={active.color} onChange={v => updateText(active.id, { color: v })} />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">Kalın</span>
            <input type="checkbox" checked={active.weight >= 700} className="w-4 h-4 accent-blue-500"
              onChange={e => updateText(active.id, { weight: e.target.checked ? 700 : 400 }, true)} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">Gölge</span>
            <input type="checkbox" checked={active.shadow} className="w-4 h-4 accent-blue-500"
              onChange={e => updateText(active.id, { shadow: e.target.checked }, true)} />
          </div>
          <p className="text-[10px] text-slate-400">Metni kolaj üzerinde sürükleyerek konumlandırabilirsiniz.</p>
        </div>
      )}
    </>
  )
}

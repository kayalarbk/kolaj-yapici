import { create } from 'zustand'
import { TEMPLATES } from '../components/Templates/templates-data'

const HISTORY_LIMIT = 30

const DEFAULT_SETTINGS = {
  bgType: 'solid', // solid | gradient | pattern
  bgColor: '#0f172a',
  gradFrom: '#3B82F6',
  gradTo: '#9333EA',
  gradAngle: 135,
  pattern: 'dots', // dots | lines | grid
  patternColor: '#334155',
  gap: 8,
  cornerRadius: 8,
  borderWidth: 0,
  borderColor: '#ffffff',
}

const DEFAULT_FILTERS = {
  brightness: 100, contrast: 100, saturate: 100,
  blur: 0, sepia: 0, grayscale: 0, hue: 0,
}

export const FILTER_PRESETS = [
  { name: 'Normal', values: { ...DEFAULT_FILTERS } },
  { name: 'Vivid', values: { ...DEFAULT_FILTERS, brightness: 105, contrast: 115, saturate: 145 } },
  { name: 'Retro', values: { ...DEFAULT_FILTERS, brightness: 105, contrast: 90, saturate: 75, sepia: 35 } },
  { name: 'B&W', values: { ...DEFAULT_FILTERS, grayscale: 100, contrast: 112 } },
  { name: 'Warm', values: { ...DEFAULT_FILTERS, brightness: 104, saturate: 118, sepia: 22 } },
  { name: 'Cool', values: { ...DEFAULT_FILTERS, brightness: 103, saturate: 92, contrast: 104, hue: 12 } },
  { name: 'Dramatic', values: { ...DEFAULT_FILTERS, brightness: 92, contrast: 140, saturate: 110 } },
  { name: 'Fade', values: { ...DEFAULT_FILTERS, brightness: 108, contrast: 84, saturate: 82 } },
]

function loadLS(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch { return fallback }
}

const snapshotOf = (s) => ({
  template: s.template,
  slotContents: s.slotContents,
  settings: s.settings,
  filters: s.filters,
  texts: s.texts,
})

let textIdCounter = 1

export const useCollageStore = create((set, get) => ({
  // --- Durum ---
  photos: [], // { id, url, name }
  template: TEMPLATES.find(t => t.id === 'grid-2x2'),
  slotContents: {}, // slotId -> { photoId, offsetX, offsetY, scale, rotation, flipH, flipV }
  settings: loadLS('collage-settings', DEFAULT_SETTINGS),
  filters: { ...DEFAULT_FILTERS },
  texts: [], // { id, text, x, y, fontFamily, fontSize, color, weight, shadow }
  selectedSlot: null,
  selectedText: null,
  myTemplates: loadLS('collage-my-templates', []),
  theme: loadLS('collage-theme', 'dark'),
  canvasZoom: 1,
  past: [],
  future: [],

  // --- Geçmiş (undo/redo) ---
  pushHistory: () => set(s => ({
    past: [...s.past.slice(-(HISTORY_LIMIT - 1)), snapshotOf(s)],
    future: [],
  })),
  undo: () => set(s => {
    if (!s.past.length) return {}
    const prev = s.past[s.past.length - 1]
    return { ...prev, past: s.past.slice(0, -1), future: [snapshotOf(s), ...s.future].slice(0, HISTORY_LIMIT) }
  }),
  redo: () => set(s => {
    if (!s.future.length) return {}
    const next = s.future[0]
    return { ...next, future: s.future.slice(1), past: [...s.past.slice(-(HISTORY_LIMIT - 1)), snapshotOf(s)] }
  }),

  // --- Fotoğraflar ---
  // Not: dışa aktarma (html-to-image) blob: URL'lerle çalışmadığı için data URL kullanılır
  addPhotos: async (files) => {
    const list = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!list.length) return
    const newPhotos = await Promise.all(list.map(async f => ({
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      url: await fileToDataUrl(f),
      name: f.name || 'panodan',
    })))
    set(s => {
      // Yeni fotoğrafları boş yuvalara otomatik yerleştir
      const contents = { ...s.slotContents }
      const empty = s.template.slots.filter(sl => !contents[sl.id]?.photoId)
      newPhotos.forEach((p, i) => {
        if (empty[i]) contents[empty[i].id] = defaultContent(p.id)
      })
      return { photos: [...s.photos, ...newPhotos], slotContents: contents }
    })
  },
  removePhoto: (photoId) => {
    get().pushHistory()
    set(s => {
      const contents = { ...s.slotContents }
      for (const k of Object.keys(contents)) {
        if (contents[k]?.photoId === photoId) delete contents[k]
      }
      return { photos: s.photos.filter(p => p.id !== photoId), slotContents: contents }
    })
  },

  // --- Şablon ---
  setTemplate: (template) => {
    get().pushHistory()
    set(s => {
      // Mevcut fotoğrafları sırayla yeni şablonun yuvalarına aktar
      const used = s.template.slots
        .map(sl => s.slotContents[sl.id])
        .filter(c => c?.photoId)
      const contents = {}
      template.slots.forEach((sl, i) => {
        if (used[i]) contents[sl.id] = { ...defaultContent(used[i].photoId) }
      })
      return { template, slotContents: contents, selectedSlot: null }
    })
  },

  // --- Yuva içerikleri ---
  setSlotPhoto: (slotId, photoId) => {
    get().pushHistory()
    set(s => ({ slotContents: { ...s.slotContents, [slotId]: defaultContent(photoId) } }))
  },
  swapSlots: (a, b) => {
    get().pushHistory()
    set(s => {
      const contents = { ...s.slotContents }
      const tmp = contents[a]
      contents[a] = contents[b]
      contents[b] = tmp
      if (!contents[a]) delete contents[a]
      if (!contents[b]) delete contents[b]
      return { slotContents: contents }
    })
  },
  updateSlotContent: (slotId, patch) => set(s => ({
    slotContents: {
      ...s.slotContents,
      [slotId]: { ...(s.slotContents[slotId] || defaultContent(null)), ...patch },
    },
  })),
  clearSlot: (slotId) => {
    get().pushHistory()
    set(s => {
      const contents = { ...s.slotContents }
      delete contents[slotId]
      return { slotContents: contents, selectedSlot: null }
    })
  },
  selectSlot: (slotId) => set({ selectedSlot: slotId, selectedText: null }),

  // --- Ayarlar / filtreler ---
  setSettings: (patch, commit = true) => {
    if (commit) get().pushHistory()
    set(s => {
      const settings = { ...s.settings, ...patch }
      try { localStorage.setItem('collage-settings', JSON.stringify(settings)) } catch {}
      return { settings }
    })
  },
  setFilters: (patch, commit = true) => {
    if (commit) get().pushHistory()
    set(s => ({ filters: { ...s.filters, ...patch } }))
  },
  applyPreset: (preset) => {
    get().pushHistory()
    set({ filters: { ...preset.values } })
  },

  // --- Metinler ---
  addText: () => {
    get().pushHistory()
    const id = `t-${textIdCounter++}-${Date.now()}`
    set(s => ({
      texts: [...s.texts, {
        id, text: 'Metniniz', x: 50, y: 50,
        fontFamily: 'Poppins', fontSize: 6, color: '#ffffff',
        weight: 700, shadow: true,
      }],
      selectedText: id, selectedSlot: null,
    }))
  },
  updateText: (id, patch, commit = false) => {
    if (commit) get().pushHistory()
    set(s => ({ texts: s.texts.map(t => t.id === id ? { ...t, ...patch } : t) }))
  },
  removeText: (id) => {
    get().pushHistory()
    set(s => ({ texts: s.texts.filter(t => t.id !== id), selectedText: null }))
  },
  selectText: (id) => set({ selectedText: id, selectedSlot: null }),

  // --- Özel şablonlar ---
  saveMyTemplate: (template) => set(s => {
    const myTemplates = [...s.myTemplates.filter(t => t.id !== template.id), template]
    try { localStorage.setItem('collage-my-templates', JSON.stringify(myTemplates)) } catch {}
    return { myTemplates }
  }),
  removeMyTemplate: (id) => set(s => {
    const myTemplates = s.myTemplates.filter(t => t.id !== id)
    try { localStorage.setItem('collage-my-templates', JSON.stringify(myTemplates)) } catch {}
    return { myTemplates }
  }),

  // --- Tema / görünüm ---
  setTheme: (theme) => {
    try { localStorage.setItem('collage-theme', JSON.stringify(theme)) } catch {}
    document.documentElement.classList.toggle('dark', theme === 'dark')
    set({ theme })
  },
  setCanvasZoom: (z) => set({ canvasZoom: Math.min(2, Math.max(0.3, z)) }),
}))

function defaultContent(photoId) {
  return { photoId, offsetX: 0, offsetY: 0, scale: 1, rotation: 0, flipH: false, flipV: false }
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

export function filterCss(f) {
  return `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturate}%) blur(${f.blur}px) sepia(${f.sepia}%) grayscale(${f.grayscale}%) hue-rotate(${f.hue}deg)`
}

export function backgroundCss(st) {
  if (st.bgType === 'gradient') {
    return { background: `linear-gradient(${st.gradAngle}deg, ${st.gradFrom}, ${st.gradTo})` }
  }
  if (st.bgType === 'pattern') {
    if (st.pattern === 'dots') {
      return {
        backgroundColor: st.bgColor,
        backgroundImage: `radial-gradient(${st.patternColor} 1.5px, transparent 1.5px)`,
        backgroundSize: '18px 18px',
      }
    }
    if (st.pattern === 'lines') {
      return {
        backgroundColor: st.bgColor,
        backgroundImage: `repeating-linear-gradient(45deg, ${st.patternColor} 0 2px, transparent 2px 14px)`,
      }
    }
    return {
      backgroundColor: st.bgColor,
      backgroundImage: `linear-gradient(${st.patternColor} 1px, transparent 1px), linear-gradient(90deg, ${st.patternColor} 1px, transparent 1px)`,
      backgroundSize: '22px 22px',
    }
  }
  return { backgroundColor: st.bgColor }
}

export const SHAPE_CLIPS = {
  diamond: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
  hex: 'polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)',
}

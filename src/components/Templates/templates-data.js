// 50 hazır kolaj şablonu.
// Her slot: { id, x, y, width, height } — değerler yüzde (0-100).
// Opsiyonel: shape ('circle' | 'diamond' | 'hex'), radius (özel border-radius), clip (özel clip-path)

let sid = 0
const S = (x, y, width, height, extra = {}) => ({ id: ++sid, x, y, width, height, ...extra })

// cols x rows eşit ızgara üretir
function grid(cols, rows) {
  const slots = []
  const w = 100 / cols
  const h = 100 / rows
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) slots.push(S(c * w, r * h, w, h))
  return slots
}

// Satır desenli ızgara: rowsOf = [2,3] → üst satırda 2, alt satırda 3 hücre
function rowsGrid(rowsOf) {
  const slots = []
  const h = 100 / rowsOf.length
  rowsOf.forEach((count, r) => {
    const w = 100 / count
    for (let c = 0; c < count; c++) slots.push(S(c * w, r * h, w, h))
  })
  return slots
}

export const CATEGORIES = [
  { id: 'all', name: 'Tümü' },
  { id: 'grid', name: 'Izgara' },
  { id: 'mosaic', name: 'Mozaik' },
  { id: 'story', name: 'Hikaye' },
  { id: 'panoramic', name: 'Panoramik' },
  { id: 'creative', name: 'Yaratıcı' },
  { id: 'social', name: 'Sosyal Medya' },
  { id: 'custom', name: 'Şablonlarım' },
]

export const TEMPLATES = [
  // ============ IZGARA (12) ============
  { id: 'grid-1', name: 'Tek Kare', category: 'grid', aspectRatio: '1:1', gap: 4, slots: grid(1, 1) },
  { id: 'grid-2x1', name: 'İkili Yatay', category: 'grid', aspectRatio: '4:3', gap: 4, slots: grid(2, 1) },
  { id: 'grid-1x2', name: 'İkili Dikey', category: 'grid', aspectRatio: '3:4', gap: 4, slots: grid(1, 2) },
  { id: 'grid-2x2', name: 'Klasik 2x2', category: 'grid', aspectRatio: '1:1', gap: 4, slots: grid(2, 2) },
  { id: 'grid-3x3', name: 'Klasik 3x3', category: 'grid', aspectRatio: '1:1', gap: 4, slots: grid(3, 3) },
  { id: 'grid-4x4', name: 'Büyük 4x4', category: 'grid', aspectRatio: '1:1', gap: 3, slots: grid(4, 4) },
  { id: 'grid-2x3', name: 'Dikey 2x3', category: 'grid', aspectRatio: '3:4', gap: 4, slots: grid(2, 3) },
  { id: 'grid-3x2', name: 'Yatay 3x2', category: 'grid', aspectRatio: '4:3', gap: 4, slots: grid(3, 2) },
  { id: 'grid-5', name: "Beşli Izgara", category: 'grid', aspectRatio: '1:1', gap: 4, slots: rowsGrid([2, 3]) },
  { id: 'grid-6-mix', name: "Altılı Karışık", category: 'grid', aspectRatio: '1:1', gap: 4, slots: rowsGrid([2, 4]) },
  { id: 'grid-8', name: "Sekizli Izgara", category: 'grid', aspectRatio: '16:9', gap: 3, slots: grid(4, 2) },
  { id: 'grid-10', name: "Onlu Izgara", category: 'grid', aspectRatio: '16:9', gap: 3, slots: grid(5, 2) },

  // ============ MOZAİK (10) ============
  {
    id: 'mosaic-l', name: 'L Düzeni', category: 'mosaic', aspectRatio: '1:1', gap: 4,
    slots: [S(0, 0, 66.67, 100), S(66.67, 0, 33.33, 50), S(66.67, 50, 33.33, 50)],
  },
  {
    id: 'mosaic-t', name: 'T Düzeni', category: 'mosaic', aspectRatio: '1:1', gap: 4,
    slots: [S(0, 0, 100, 60), S(0, 60, 50, 40), S(50, 60, 50, 40)],
  },
  {
    id: 'mosaic-center', name: 'Merkez + 4 Köşe', category: 'mosaic', aspectRatio: '1:1', gap: 4,
    slots: [S(30, 30, 40, 40), S(0, 0, 30, 50), S(70, 0, 30, 50), S(0, 50, 30, 50), S(70, 50, 30, 50)],
  },
  {
    id: 'mosaic-left-big', name: 'Sol Büyük + 3', category: 'mosaic', aspectRatio: '4:3', gap: 4,
    slots: [S(0, 0, 60, 100), S(60, 0, 40, 33.33), S(60, 33.33, 40, 33.33), S(60, 66.67, 40, 33.34)],
  },
  {
    id: 'mosaic-right-big', name: 'Sağ Büyük + 3', category: 'mosaic', aspectRatio: '4:3', gap: 4,
    slots: [S(40, 0, 60, 100), S(0, 0, 40, 33.33), S(0, 33.33, 40, 33.33), S(0, 66.67, 40, 33.34)],
  },
  {
    id: 'mosaic-top-big', name: 'Üst Büyük + 3', category: 'mosaic', aspectRatio: '3:4', gap: 4,
    slots: [S(0, 0, 100, 65), S(0, 65, 33.33, 35), S(33.33, 65, 33.33, 35), S(66.67, 65, 33.33, 35)],
  },
  {
    id: 'mosaic-masonry-4', name: 'Masonry Dörtlü', category: 'mosaic', aspectRatio: '3:4', gap: 4,
    slots: [S(0, 0, 50, 60), S(50, 0, 50, 40), S(0, 60, 50, 40), S(50, 40, 50, 60)],
  },
  {
    id: 'mosaic-masonry-6', name: 'Masonry Altılı', category: 'mosaic', aspectRatio: '3:4', gap: 4,
    slots: [
      S(0, 0, 50, 40), S(50, 0, 50, 25), S(50, 25, 50, 35),
      S(0, 40, 50, 30), S(0, 70, 50, 30), S(50, 60, 50, 40),
    ],
  },
  {
    id: 'mosaic-2big-4small', name: '2 Büyük + 4 Küçük', category: 'mosaic', aspectRatio: '1:1', gap: 4,
    slots: [
      S(0, 0, 50, 66.67), S(50, 33.33, 50, 66.67),
      S(50, 0, 25, 33.33), S(75, 0, 25, 33.33), S(0, 66.67, 25, 33.33), S(25, 66.67, 25, 33.33),
    ],
  },
  {
    id: 'mosaic-feature-strip', name: 'Büyük + Şerit', category: 'mosaic', aspectRatio: '1:1', gap: 4,
    slots: [
      S(0, 0, 100, 75),
      S(0, 75, 25, 25), S(25, 75, 25, 25), S(50, 75, 25, 25), S(75, 75, 25, 25),
    ],
  },

  // ============ HİKAYE / DİKEY (8) — 9:16 ============
  { id: 'story-full', name: 'Tam Hikaye', category: 'story', aspectRatio: '9:16', gap: 0, slots: grid(1, 1) },
  { id: 'story-2', name: 'İkili Hikaye', category: 'story', aspectRatio: '9:16', gap: 4, slots: grid(1, 2) },
  { id: 'story-3', name: 'Üçlü Hikaye', category: 'story', aspectRatio: '9:16', gap: 4, slots: grid(1, 3) },
  { id: 'story-4', name: 'Dörtlü Hikaye', category: 'story', aspectRatio: '9:16', gap: 4, slots: grid(2, 2) },
  {
    id: 'story-top-big', name: 'Üst Büyük Hikaye', category: 'story', aspectRatio: '9:16', gap: 4,
    slots: [S(0, 0, 100, 60), S(0, 60, 50, 40), S(50, 60, 50, 40)],
  },
  {
    id: 'story-polaroid', name: 'Polaroid Hikaye', category: 'story', aspectRatio: '9:16', gap: 0,
    slots: [S(10, 6, 80, 42), S(10, 52, 80, 42)],
  },
  {
    id: 'story-strip-big', name: 'Şerit + Büyük', category: 'story', aspectRatio: '9:16', gap: 4,
    slots: [S(0, 0, 33.33, 30), S(33.33, 0, 33.33, 30), S(66.67, 0, 33.33, 30), S(0, 30, 100, 70)],
  },
  {
    id: 'story-zigzag', name: 'Zigzag Hikaye', category: 'story', aspectRatio: '9:16', gap: 4,
    slots: [S(0, 0, 65, 33.33), S(35, 33.33, 65, 33.33), S(0, 66.67, 65, 33.33)],
  },

  // ============ PANORAMİK / YATAY (6) ============
  { id: 'pano-full', name: 'Geniş Ekran', category: 'panoramic', aspectRatio: '16:9', gap: 0, slots: grid(1, 1) },
  { id: 'pano-triptych', name: 'Triptik', category: 'panoramic', aspectRatio: '16:9', gap: 5, slots: grid(3, 1) },
  { id: 'pano-4strip', name: 'Sinematik Şerit', category: 'panoramic', aspectRatio: '21:9', gap: 4, slots: grid(4, 1) },
  { id: 'pano-split', name: 'Yatay İkili', category: 'panoramic', aspectRatio: '16:9', gap: 4, slots: grid(2, 1) },
  {
    id: 'pano-banner', name: 'Banner Düzeni', category: 'panoramic', aspectRatio: '21:9', gap: 4,
    slots: [S(0, 0, 55, 100), S(55, 0, 45, 50), S(55, 50, 45, 50)],
  },
  { id: 'pano-film', name: 'Film Şeridi', category: 'panoramic', aspectRatio: '16:9', gap: 6, slots: grid(4, 2).slice(0, 4).map(s => ({ ...s, y: 15, height: 70 })) },

  // ============ YARATICI ŞEKİLLER (8) ============
  {
    id: 'creative-circles-4', name: 'Dörtlü Daire', category: 'creative', aspectRatio: '1:1', gap: 6,
    slots: grid(2, 2).map(s => ({ ...s, shape: 'circle' })),
  },
  {
    id: 'creative-circle-center', name: 'Merkez Daire', category: 'creative', aspectRatio: '1:1', gap: 5,
    slots: [
      S(25, 25, 50, 50, { shape: 'circle' }),
      S(0, 0, 26, 26, { shape: 'circle' }), S(74, 0, 26, 26, { shape: 'circle' }),
      S(0, 74, 26, 26, { shape: 'circle' }), S(74, 74, 26, 26, { shape: 'circle' }),
    ],
  },
  {
    id: 'creative-heart', name: 'Kalp Düzeni', category: 'creative', aspectRatio: '1:1', gap: 0,
    slots: [
      S(6, 8, 46, 46, { shape: 'circle' }),
      S(48, 8, 46, 46, { shape: 'circle' }),
      S(26, 42, 48, 48, { shape: 'diamond' }),
    ],
  },
  {
    id: 'creative-diamond', name: 'Elmas Üçlü', category: 'creative', aspectRatio: '16:9', gap: 4,
    slots: [
      S(2, 15, 30, 70, { shape: 'diamond' }),
      S(35, 5, 32, 90, { shape: 'diamond' }),
      S(70, 15, 30, 70, { shape: 'diamond' }),
    ],
  },
  {
    id: 'creative-hex', name: 'Petek Düzeni', category: 'creative', aspectRatio: '4:3', gap: 4,
    slots: [
      S(2, 4, 34, 44, { shape: 'hex' }), S(33, 28, 34, 44, { shape: 'hex' }),
      S(64, 4, 34, 44, { shape: 'hex' }), S(2, 52, 34, 44, { shape: 'hex' }),
      S(64, 52, 34, 44, { shape: 'hex' }),
    ],
  },
  {
    id: 'creative-diag-2', name: 'Çapraz İkili', category: 'creative', aspectRatio: '1:1', gap: 0,
    slots: [
      S(0, 0, 100, 100, { clip: 'polygon(0 0, 100% 0, 0 100%)' }),
      S(0, 0, 100, 100, { clip: 'polygon(100% 0, 100% 100%, 0 100%)' }),
    ],
  },
  {
    id: 'creative-diag-3', name: 'Çapraz Üçlü', category: 'creative', aspectRatio: '16:9', gap: 0,
    slots: [
      S(0, 0, 45, 100, { clip: 'polygon(0 0, 100% 0, 78% 100%, 0 100%)' }),
      S(25, 0, 50, 100, { clip: 'polygon(20% 0, 100% 0, 80% 100%, 0 100%)' }),
      S(55, 0, 45, 100, { clip: 'polygon(22% 0, 100% 0, 100% 100%, 0 100%)' }),
    ],
  },
  {
    id: 'creative-wave', name: 'Dalga Kenar', category: 'creative', aspectRatio: '3:4', gap: 5,
    slots: [
      S(0, 0, 100, 50, { radius: '0 0 50% 50% / 0 0 18% 18%' }),
      S(0, 50, 100, 50, { radius: '50% 50% 0 0 / 18% 18% 0 0' }),
    ],
  },

  // ============ SOSYAL MEDYA (6) ============
  {
    id: 'social-instagram', name: 'Instagram Post', category: 'social', aspectRatio: '1:1', gap: 4,
    slots: [S(0, 0, 50, 100), S(50, 0, 50, 50), S(50, 50, 50, 50)],
  },
  {
    id: 'social-facebook', name: 'Facebook Kapak', category: 'social', aspectRatio: '820:312', gap: 4,
    slots: grid(3, 1),
  },
  {
    id: 'social-twitter', name: 'X / Twitter Header', category: 'social', aspectRatio: '3:1', gap: 4,
    slots: [S(0, 0, 40, 100), S(40, 0, 30, 100), S(70, 0, 30, 100)],
  },
  {
    id: 'social-linkedin', name: 'LinkedIn Banner', category: 'social', aspectRatio: '4:1', gap: 4,
    slots: grid(4, 1),
  },
  {
    id: 'social-youtube', name: 'YouTube Thumbnail', category: 'social', aspectRatio: '16:9', gap: 4,
    slots: [S(0, 0, 65, 100), S(65, 0, 35, 50), S(65, 50, 35, 50)],
  },
  {
    id: 'social-pinterest', name: 'Pinterest Pin', category: 'social', aspectRatio: '2:3', gap: 4,
    slots: [S(0, 0, 100, 55), S(0, 55, 50, 45), S(50, 55, 50, 45)],
  },
]

export function getTemplateById(id, myTemplates = []) {
  return TEMPLATES.find(t => t.id === id) || myTemplates.find(t => t.id === id) || TEMPLATES[3]
}

// "1:1" → sayısal oran
export function parseAspect(ar) {
  const [w, h] = (ar || '1:1').split(':').map(Number)
  return w / h
}

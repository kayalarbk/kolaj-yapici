import { toPng, toJpeg } from 'html-to-image'

// data-export-hide işaretli öğeleri (araç çubukları, seçim halkaları) dışarıda bırak
const filter = (node) => !(node.getAttribute && node.getAttribute('data-export-hide') !== null)

export async function exportCollage({ format = 'png', quality = 0.92, targetWidth = null, scale = 1 }) {
  const node = document.getElementById('collage-canvas')
  if (!node) throw new Error('Kolaj bulunamadı')

  const width = node.offsetWidth
  const pixelRatio = targetWidth ? targetWidth / width : scale
  const opts = {
    pixelRatio: Math.max(0.5, Math.min(8, pixelRatio)),
    filter,
  }

  const dataUrl = format === 'jpg'
    ? await toJpeg(node, { ...opts, quality, backgroundColor: '#ffffff' })
    : await toPng(node, opts)

  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `kolaj-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.${format}`
  a.click()
}

import { LayoutGrid, Images } from 'lucide-react'
import TemplateGallery from '../Templates/TemplateGallery'
import ImageUploader from '../common/ImageUploader'
import { useCollageStore } from '../../hooks/useCollageStore'
import { useState } from 'react'

// Sol panel: Şablonlar ve Fotoğraflar sekmeleri
export default function Sidebar() {
  const [tab, setTab] = useState('templates')
  const photoCount = useCollageStore(s => s.photos.length)

  return (
    <aside className="glass rounded-2xl flex flex-col h-full min-h-0 p-3 w-full">
      <div className="flex gap-1 mb-3 bg-slate-200/70 dark:bg-slate-800/70 rounded-xl p-1">
        <TabBtn active={tab === 'templates'} onClick={() => setTab('templates')}>
          <LayoutGrid size={14} /> Şablonlar
        </TabBtn>
        <TabBtn active={tab === 'photos'} onClick={() => setTab('photos')}>
          <Images size={14} /> Fotoğraflar{photoCount > 0 && <span className="text-[10px] opacity-70">({photoCount})</span>}
        </TabBtn>
      </div>
      <div className="flex-1 min-h-0">
        {tab === 'templates' ? <TemplateGallery /> : <ImageUploader />}
      </div>
    </aside>
  )
}

function TabBtn({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-colors
        ${active ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
    >
      {children}
    </button>
  )
}

import { useState } from 'react'
import { Search } from 'lucide-react'
import { TEMPLATES, CATEGORIES } from './templates-data'
import TemplateCard from './TemplateCard'
import { useCollageStore } from '../../hooks/useCollageStore'

export default function TemplateGallery() {
  const { template, setTemplate, myTemplates, removeMyTemplate } = useCollageStore()
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')

  const all = [...TEMPLATES, ...myTemplates]
  const filtered = all.filter(t => {
    if (category !== 'all' && t.category !== category) return false
    if (query && !t.name.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr'))) return false
    return true
  })

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="relative mb-2">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Şablon ara..."
          className="input-text pl-8"
        />
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors
              ${category === c.id
                ? 'bg-accent text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 grid grid-cols-2 gap-2 content-start pr-1">
        {filtered.map(t => (
          <TemplateCard
            key={t.id}
            template={t}
            active={template.id === t.id}
            onClick={() => setTemplate(t)}
            onDelete={t.category === 'custom' ? () => removeMyTemplate(t.id) : undefined}
          />
        ))}
        {!filtered.length && (
          <p className="col-span-2 text-center text-xs text-slate-400 mt-6">
            {category === 'custom' ? 'Henüz özel şablon kaydetmediniz.' : 'Sonuç bulunamadı.'}
          </p>
        )}
      </div>
    </div>
  )
}

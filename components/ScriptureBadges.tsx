import { Scripture } from '@/lib/supabase'

interface ScriptureBadgesProps {
  scriptures: Scripture[]
  className?: string
}

export default function ScriptureBadges({ scriptures, className = '' }: ScriptureBadgesProps) {
  if (!scriptures || scriptures.length === 0) {
    return null
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {scriptures.map((scripture, i) => (
        <span
          key={i}
          className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
        >
          📖 {scripture.book} {scripture.chapter}:{scripture.verseFrom}
          {scripture.verseTo && scripture.verseTo !== scripture.verseFrom && `-${scripture.verseTo}`}
        </span>
      ))}
    </div>
  )
}

